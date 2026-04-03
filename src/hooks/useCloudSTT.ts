/**
 * useCloudSTT — Deepgram real-time Speech-to-Text via WebSocket
 *
 * Works on ALL browsers (Chrome, Safari, Firefox, Edge, mobile).
 * Keeps WebSocket alive during AI speech to avoid reconnection issues.
 *
 * Safari/iOS fixes:
 * - Detects audio/mp4 and adds encoding param for Deepgram
 * - Longer timeslice on Safari to avoid empty chunks
 * - Accepts external mic stream to prevent multiple getUserMedia conflicts
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
  /** Pass a shared mic stream to avoid multiple getUserMedia calls (critical for iOS) */
  externalStream?: MediaStream | null;
}

interface CloudSTTReturn {
  startListening: (streamOverride?: MediaStream) => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
  isConnecting: boolean;
  destroy: () => void;
  getStream: () => MediaStream | null;
}

const DEEPGRAM_WS_BASE = import.meta.env.VITE_DEEPGRAM_WS_URL;

const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

export function useCloudSTT(options: CloudSTTOptions = {}): CloudSTTReturn {
  const {
    onInterim,
    onFinal,
    onError,
    onEnd,
    language = import.meta.env.VITE_STT_LANGUAGE,
    model = import.meta.env.VITE_STT_MODEL,
    smartFormat = true,
    backendUrl = import.meta.env.VITE_API_BASE_URL || '',
    externalStream = null,
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
  const mimeTypeRef = useRef<string>('');
  const externalStreamRef = useRef<MediaStream | null>(externalStream);
  externalStreamRef.current = externalStream;

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

  // ── Get microphone stream (reuse external or create new) ───
  const getMicStream = useCallback(async (): Promise<MediaStream> => {
    if (externalStreamRef.current?.active) {
      streamRef.current = externalStreamRef.current;
      return externalStreamRef.current;
    }
    if (streamRef.current?.active) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 16000,    // ← ADD: Deepgram optimal sample rate
        sampleSize: 16,       // ← ADD: 16-bit audio
      },
    });
    streamRef.current = stream;
    return stream;
  }, []);

  // ── Detect best mimeType ───────────────────────────────────
  const detectMimeType = useCallback((): string => {
    if (mimeTypeRef.current) return mimeTypeRef.current;
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/aac',
      '',
    ];
    for (const type of types) {
      if (!type || MediaRecorder.isTypeSupported(type)) {
        mimeTypeRef.current = type;
        console.log(`🎤 MediaRecorder mimeType: "${type || 'default'}" (Safari: ${isSafari()}, iOS: ${isIOS()})`);
        return type;
      }
    }
    return '';
  }, []);

    

  // ── Start MediaRecorder and attach to WebSocket ────────────
  const startRecorder = useCallback((ws: WebSocket, stream: MediaStream) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    // ✅ NEW: Check that the stream has at least one live audio track
    // ✅ CORRECT — add mimeTypeRef.current = '' before return
    const liveTracks = stream.getTracks().filter(t => t.readyState === 'live');
    if (liveTracks.length === 0) {
      console.warn('⚠️ Stream has no live tracks — cannot start MediaRecorder');
      streamRef.current = null;
      mimeTypeRef.current = '';  // ← ADD THIS ONE LINE
      return;
    }



    const mimeType = detectMimeType();
    const recorderOptions: MediaRecorderOptions = {};
    if (mimeType) recorderOptions.mimeType = mimeType;
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, recorderOptions);
    } catch (e) {
      console.warn('⚠️ MediaRecorder failed with mimeType, trying default:', e);
      recorder = new MediaRecorder(stream);
    }
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0 && ws.readyState === WebSocket.OPEN && !isPausedRef.current) {
        ws.send(event.data);
      }
    };
    const timeslice = (isSafari() || isIOS()) ? 500 : 250;
    recorder.start(timeslice);
    console.log(`🎙️ MediaRecorder started (timeslice: ${timeslice}ms, mimeType: "${mimeType || 'default'}")`);
  }, [detectMimeType]);

  // ── Connect WebSocket ──────────────────────────────────────
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (isDestroyedRef.current) return;

    setIsConnecting(true);

    try {
      const apiKey = await getApiKey();
      const stream = await getMicStream();
      const mimeType = detectMimeType();

      const params = new URLSearchParams({
  model,
  language,
  smart_format: smartFormat.toString(),
  interim_results: 'true',
  utterance_end_ms: '1000',
  vad_events: 'true',
  punctuate: 'true',
  filler_words: 'false',
  numerals: 'true',
  endpointing: '200',
});

      if (mimeType.includes('mp4') || mimeType.includes('aac')) {
        params.set('channels', '1');
        console.log('🍎 Safari/iOS: using audio/mp4 container for Deepgram');
      }

      const ws = new WebSocket(`${DEEPGRAM_WS_BASE}?${params.toString()}`, ['token', apiKey]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Deepgram WebSocket connected');
        setIsConnecting(false);
        setIsListening(true);
        isPausedRef.current = false;

        startRecorder(ws, stream);

        // KeepAlive every 3s to prevent 1011 timeout during pauses
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        keepAliveRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'KeepAlive' }));
          }
        }, 3000);
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

        // ✅ NEW: Don't reconnect on 1011 — that means no audio was sent.
        // Reconnecting with a dead stream just creates an infinite loop.
        // The interview room's watchdog will restart listening when needed.
        const isNoAudioTimeout = event.code === 1011;

        if (!isDestroyedRef.current && !isPausedRef.current && !isNoAudioTimeout) {
          console.log('🔄 Unexpected close, reconnecting in 1s...');
          setTimeout(() => {
            if (!isDestroyedRef.current && !isPausedRef.current) {
              connect();
            }
          }, 1000);
        }

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
  }, [getApiKey, getMicStream, detectMimeType, language, model, smartFormat, startRecorder]);

  // ── Start listening ────────────────────────────────────────
  const startListening = useCallback(async (streamOverride?: MediaStream) => {
    isPausedRef.current = false;
    isDestroyedRef.current = false;

    // If a stream is passed directly, wire it in immediately
    // This bypasses the async setState → re-render → prop update cycle
    if (streamOverride) {
      externalStreamRef.current = streamOverride;
      streamRef.current = streamOverride;
    }

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

    if (wsRef.current) {
      console.log('⚠️ WebSocket not open (state:', wsRef.current.readyState, '), reconnecting...');
      wsRef.current = null;
    }

    await connect();
  }, [connect, getMicStream, startRecorder]);

  // ── Stop listening (pause — keeps WebSocket alive) ─────────
  const stopListening = useCallback(() => {
    isPausedRef.current = true;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.pause();
        console.log('⏸️ MediaRecorder paused');
        // Send KeepAlive immediately to prevent 1011 timeout during processing pause
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'KeepAlive' }));
        }
      } catch (e) {}
    }

    setIsListening(false);
  }, []);

  // ── Get stream (for sharing with other hooks) ──────────────
  const getStream = useCallback((): MediaStream | null => {
    return streamRef.current;
  }, []);

  // ── Destroy ────────────────────────────────────────────────
  const destroy = useCallback(() => {
    isDestroyedRef.current = true;
    isPausedRef.current = true;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    mediaRecorderRef.current = null;

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        try { wsRef.current.send(JSON.stringify({ type: 'CloseStream' })); } catch (e) {}
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }

    // Only stop stream if we created it (not external)
    if (streamRef.current && !externalStreamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    streamRef.current = null;

    setIsListening(false);
    setIsConnecting(false);
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    isConnecting,
    destroy,
    getStream,
  };
}

export default useCloudSTT;