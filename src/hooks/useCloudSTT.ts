/**
 * useCloudSTT — Deepgram real-time Speech-to-Text via WebSocket
 *
 * Works on ALL browsers (Chrome, Safari, Firefox, Edge, mobile).
 * Keeps WebSocket alive during AI speech to avoid reconnection issues.
 */

import { useRef, useCallback, useState } from 'react';

interface CloudSTTOptions {
  onInterim?: (transcript: string) => void;
  onFinal?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  language?: string;
  model?: string;
  smartFormat?: boolean;
  backendUrl?: string;
}

interface CloudSTTReturn {
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
  isConnecting: boolean;
  destroy: () => void;
}

const DEEPGRAM_WS_BASE = 'wss://api.deepgram.com/v1/listen';

export function useCloudSTT(options: CloudSTTOptions = {}): CloudSTTReturn {
  const {
    onInterim,
    onFinal,
    onError,
    onEnd,
    language = 'en',
    model = 'nova-2',
    smartFormat = true,
    backendUrl = import.meta.env.VITE_API_BASE_URL || '',
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const apiKeyRef = useRef<string>('');
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const isDestroyedRef = useRef(false);

  const onInterimRef = useRef(onInterim);
  const onFinalRef = useRef(onFinal);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);
  onInterimRef.current = onInterim;
  onFinalRef.current = onFinal;
  onErrorRef.current = onError;
  onEndRef.current = onEnd;

  // ── Fetch Deepgram API key ─────────────────────────────────
  const getApiKey = useCallback(async (): Promise<string> => {
    if (apiKeyRef.current) return apiKeyRef.current;
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
      const resp = await fetch(`${backendUrl}/api/speech/stt-token/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error(`STT token failed: ${resp.status}`);
      const data = await resp.json();
      apiKeyRef.current = data.key;
      return data.key;
    } catch (err) {
      throw new Error(`STT token fetch failed: ${err}`);
    }
  }, [backendUrl]);

  // ── Get microphone stream ──────────────────────────────────
  const getMicStream = useCallback(async (): Promise<MediaStream> => {
    if (streamRef.current?.active) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    streamRef.current = stream;
    return stream;
  }, []);

  // ── Start MediaRecorder and attach to WebSocket ────────────
  const startRecorder = useCallback((ws: WebSocket, stream: MediaStream) => {
    // Stop existing recorder if any
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : '';

    if (!mimeType) {
      onErrorRef.current?.('No supported audio format for MediaRecorder');
      return;
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0 && ws.readyState === WebSocket.OPEN && !isPausedRef.current) {
        ws.send(event.data);
      }
    };

    recorder.start(250);
    console.log('🎙️ MediaRecorder started');
  }, []);

  // ── Connect WebSocket ──────────────────────────────────────
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (isDestroyedRef.current) return;

    setIsConnecting(true);

    try {
      const apiKey = await getApiKey();
      const stream = await getMicStream();

      const params = new URLSearchParams({
        model,
        language,
        smart_format: smartFormat.toString(),
        interim_results: 'true',
        utterance_end_ms: '1500',
        vad_events: 'true',
      });

      const ws = new WebSocket(`${DEEPGRAM_WS_BASE}?${params.toString()}`, ['token', apiKey]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Deepgram WebSocket connected');
        setIsConnecting(false);
        setIsListening(true);
        isPausedRef.current = false;

        // Start sending audio
        startRecorder(ws, stream);

        // KeepAlive every 8s — uses Deepgram's official format
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        keepAliveRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'KeepAlive' }));
          }
        }, 8000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'Results') {
            const alt = data.channel?.alternatives?.[0];
            if (!alt) return;
            const transcript = alt.transcript || '';
            const confidence = alt.confidence || 0;
            if (!transcript.trim()) return;

            if (data.is_final) {
              console.log('✅ FINAL chunk:', transcript.slice(0, 50));
              onFinalRef.current?.(transcript, confidence);
            } else {
              console.log('🎤 NEW interim:', transcript.slice(0, 50));
              onInterimRef.current?.(transcript);
            }
          }

          if (data.type === 'UtteranceEnd') {
            console.log('🔇 Utterance end detected');
          }
        } catch (e) {}
      };

      ws.onerror = (event) => {
        console.error('❌ Deepgram WebSocket error:', event);
        onErrorRef.current?.('STT connection error');
      };

      ws.onclose = (event) => {
        console.log(`🔌 Deepgram WebSocket closed: code=${event.code} reason=${event.reason}`);
        setIsListening(false);
        setIsConnecting(false);

        if (keepAliveRef.current) {
          clearInterval(keepAliveRef.current);
          keepAliveRef.current = null;
        }

        wsRef.current = null;

        // Auto-reconnect on any close (unless intentionally destroyed/paused)
        if (!isDestroyedRef.current && !isPausedRef.current) {
          console.log('🔄 Unexpected close, reconnecting in 1s...');
          setTimeout(() => {
            if (!isDestroyedRef.current && !isPausedRef.current) {
              connect();
            }
          }, 1000);
        }

        // Only fire onEnd for unexpected closes
        if (event.code !== 1000 && event.code !== 1005) {
          onEndRef.current?.();
        }
      };
    } catch (err) {
      console.error('Failed to start STT:', err);
      setIsConnecting(false);
      setIsListening(false);
      onErrorRef.current?.(err instanceof Error ? err.message : 'Failed to start STT');
    }
  }, [getApiKey, getMicStream, language, model, smartFormat, startRecorder]);

  // ── Start listening ────────────────────────────────────────
  const startListening = useCallback(async () => {
    isPausedRef.current = false;
    isDestroyedRef.current = false;

    // Check if WebSocket is actually alive
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('🔄 Resuming STT (WebSocket already open)');
      setIsListening(true);

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        const stream = await getMicStream();
        startRecorder(wsRef.current, stream);
      } else if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      return;
    }

    // WebSocket dead or closed — clean up and reconnect
    if (wsRef.current) {
      console.log('⚠️ WebSocket not open (state:', wsRef.current.readyState, '), reconnecting...');
      wsRef.current = null;
    }

    await connect();
  }, [connect, getMicStream, startRecorder]);

  // ── Stop listening (pause — keeps WebSocket alive) ─────────
  const stopListening = useCallback(() => {
    isPausedRef.current = true;

    // Pause MediaRecorder (don't stop — faster resume)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.pause();
        console.log('⏸️ MediaRecorder paused');
      } catch (e) {}
    }

    setIsListening(false);

    // Keep WebSocket alive with KeepAlive messages — no reconnection needed
    // The keepAlive interval is still running from connect()
  }, []);

  // ── Destroy (full cleanup — use on unmount or interview end) ──
  const destroy = useCallback(() => {
    isDestroyedRef.current = true;
    isPausedRef.current = true;

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    mediaRecorderRef.current = null;

    // Close WebSocket
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        try { wsRef.current.send(JSON.stringify({ type: 'CloseStream' })); } catch (e) {}
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear keepAlive
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }

    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    setIsListening(false);
    setIsConnecting(false);
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    isConnecting,
    destroy,
  };
}

export default useCloudSTT;