/**
 * useCloudTTS — Cloud Text-to-Speech via backend API
 *
 * Drop-in replacement for browser SpeechSynthesis.
 * Works on ALL browsers (Chrome, Safari, Firefox, Edge, mobile).
 * No 15-second Chrome bug. No onend firing issues.
 *
 * Backend generates audio via Edge TTS (free) or ElevenLabs/OpenAI (paid).
 *
 * Usage:
 *   const { speak, stop, isSpeaking } = useCloudTTS({
 *     onStart: () => console.log('Started speaking'),
 *     onEnd: () => console.log('Done speaking'),
 *     backendUrl: 'https://api.example.com',
 *   });
 *
 *   speak("Hello, how are you today?");
 */

import { useRef, useCallback, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────
interface CloudTTSOptions {
  /** Called when audio starts playing */
  onStart?: () => void;
  /** Called when audio finishes playing */
  onEnd?: () => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** TTS voice (e.g., 'en-US-AriaNeural', 'en-IN-NeerjaNeural') */
  voice?: string;
  /** Speech rate (e.g., '+10%', '-5%', '+0%') */
  rate?: string;
  /** Speech pitch (e.g., '+5Hz', '-10Hz', '+0Hz') */
  pitch?: string;
  /** Backend base URL */
  backendUrl?: string;
}

interface CloudTTSReturn {
  /** Speak the given text */
  speak: (text: string) => Promise<void>;
  /** Stop current speech immediately */
  stop: () => void;
  /** Whether audio is currently playing */
  isSpeaking: boolean;
  /** Whether audio is being fetched from backend */
  isLoading: boolean;
  /** Pre-fetch audio for faster playback (optional) */
  prefetch: (text: string) => void;
}

// ─── Audio cache for instant playback ────────────────────────
const audioCache = new Map<string, string>(); // text hash → blob URL
const MAX_CACHE_SIZE = 20;

function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

// ─── Hook ────────────────────────────────────────────────────
export function useCloudTTS(options: CloudTTSOptions = {}): CloudTTSReturn {
  const {
    onStart,
    onEnd,
    onError,
    voice,
    rate = '+0%',
    pitch = '+0Hz',
    backendUrl = import.meta.env.VITE_API_BASE_URL || '',
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for latest callbacks
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);
  onStartRef.current = onStart;
  onEndRef.current = onEnd;
  onErrorRef.current = onError;

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch audio from backend ───────────────────────────────
 const fetchAudio = useCallback(
    async (text: string, signal?: AbortSignal): Promise<string> => {
      const cacheKey = hashText(text + (voice || ''));

      // Check cache first
      const cached = audioCache.get(cacheKey);
      if (cached) return cached;

      let token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
      let resp: Response | null = null;
      let lastError = '';

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          resp = await fetch(`${backendUrl}/api/speech/tts/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ text, voice, rate, pitch }),
            signal,
          });

          if (resp.ok) break;

          // 401: refresh token and retry
          if (resp.status === 401 && attempt === 0) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const refreshResp = await fetch(`${backendUrl}/api/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
                signal,
              });
              if (refreshResp.ok) {
                const data = await refreshResp.json();
                localStorage.setItem('access_token', data.access);
                token = data.access;
                continue;
              }
            }
          }

          // 500+: wait and retry
          if (resp.status >= 500) {
            lastError = `TTS request failed: ${resp.status}`;
            console.warn(`TTS attempt ${attempt + 1} failed (${resp.status}), retrying...`);
            await new Promise(r => setTimeout(r, 1500));
            continue;
          }

          throw new Error(`TTS request failed: ${resp.status}`);
        } catch (err: any) {
          if (err?.name === 'AbortError') throw err;
          lastError = err?.message || 'TTS fetch failed';
          if (attempt < 2) {
            console.warn(`TTS attempt ${attempt + 1} error, retrying...`);
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }

      if (!resp || !resp.ok) {
        throw new Error(lastError || 'TTS failed after retries');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      _addToCache(cacheKey, blobUrl);
      return blobUrl;
    },
    [backendUrl, voice, rate, pitch]
  );

  // ── Cache management ───────────────────────────────────────
  function _addToCache(key: string, url: string) {
    // Evict oldest if cache is full
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey !== undefined) {
        const oldUrl = audioCache.get(firstKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        audioCache.delete(firstKey);
      }
    }
    audioCache.set(key, url);
  }

  // ── Speak text ─────────────────────────────────────────────
  const speak = useCallback(
  async (text: string) => {
    if (!text.trim()) return;
    stop();
    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const provider = import.meta.env.VITE_TTS_PROVIDER || 'edge';

      // Use streaming for ElevenLabs — reduces first audio latency
      if (provider === 'elevenlabs' && window.MediaSource) {
        const streamToken = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
        const response = await fetch(`${baseUrl}/api/speech/tts-stream/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(streamToken ? { Authorization: `Bearer ${streamToken}` } : {}),
          },
          body: JSON.stringify({ text }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error(`TTS stream failed: ${response.status}`);

        const reader = response.body!.getReader();
        const mediaSource = new MediaSource();
        const audio = new Audio();
        audioRef.current = audio;
        audio.src = URL.createObjectURL(mediaSource);

        audio.onplay = () => { setIsLoading(false); setIsSpeaking(true); onStartRef.current?.(); };
        audio.onended = () => { setIsSpeaking(false); audioRef.current = null; onEndRef.current?.(); };
        audio.onerror = () => { setIsSpeaking(false); setIsLoading(false); audioRef.current = null; onErrorRef.current?.('Audio playback failed'); onEndRef.current?.(); };

        mediaSource.addEventListener('sourceopen', async () => {
          try {
            const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
            while (true) {
              const { done, value } = await reader.read();
              if (done) { mediaSource.endOfStream(); break; }
              await new Promise<void>(resolve => {
                sourceBuffer.addEventListener('updateend', () => resolve(), { once: true });
                sourceBuffer.appendBuffer(value);
              });
            }
          } catch (e) {
            // Always call onEnd so interview flow continues even if audio fails
            setIsSpeaking(false);
            setIsLoading(false);
            audioRef.current = null;
            onErrorRef.current?.('Audio stream failed');
            onEndRef.current?.();   // ← THIS is the critical fix
          }
        });

        await audio.play().catch(() => {
          // play() failed — call onEnd so interview doesn't get stuck
          setIsSpeaking(false);
          setIsLoading(false);
          audioRef.current = null;
          onEndRef.current?.();
        });
        return;
      }

      // Non-streaming fallback (Edge TTS or no MediaSource support)
      const audioUrl = await fetchAudio(text, abortRef.current.signal);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => { setIsLoading(false); setIsSpeaking(true); onStartRef.current?.(); };
      audio.onended = () => { setIsSpeaking(false); audioRef.current = null; onEndRef.current?.(); };
      audio.onerror = () => { setIsSpeaking(false); setIsLoading(false); audioRef.current = null; onErrorRef.current?.('Audio playback failed'); onEndRef.current?.(); };
      await audio.play();
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // Intentionally cancelled

        console.error('TTS speak error:', err);
        setIsLoading(false);
        setIsSpeaking(false);
        onErrorRef.current?.(err?.message || 'TTS failed');

        // CRITICAL: Always call onEnd so the interview flow continues
        // even if TTS fails (falls back to text-only mode)
        onEndRef.current?.();
      }
    },
    [fetchAudio]
  );

  // ── Stop speech ────────────────────────────────────────────
  const stop = useCallback(() => {
    // Abort any pending fetch
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // ── Prefetch audio (for faster playback) ───────────────────
  const prefetch = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      // Fetch in background, don't await
      fetchAudio(text).catch(() => {});
    },
    [fetchAudio]
  );

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    prefetch,
  };
}

export default useCloudTTS;