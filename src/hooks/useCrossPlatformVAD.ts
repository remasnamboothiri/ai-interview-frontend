/**
 * useCrossPlatformVAD — Voice Activity Detection using Web Audio API
 *
 * Works on ALL browsers: Chrome, Safari, Firefox, Edge, iOS, Android
 * No ONNX, no AudioWorklet, no WASM — just Web Audio API AnalyserNode.
 *
 * Safari/iOS fixes:
 * - Accepts external mic stream to avoid multiple getUserMedia conflicts
 * - Uses audio:true constraints (Safari rejects echoCancellation:false)
 * - Handles suspended AudioContext (Safari requires user gesture)
 */

import { useRef, useCallback, useState, useEffect } from 'react';

interface VADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  threshold?: number;
  speechFrames?: number;
  silenceFrames?: number;
  intervalMs?: number;
  /** Pass a shared mic stream to avoid multiple getUserMedia calls (critical for iOS) */
  externalStream?: MediaStream | null;
}

interface VADReturn {
  start: () => Promise<void>;
  pause: () => void;
  destroy: () => void;
  isSpeaking: boolean;
  isActive: boolean;
  volume: number;
}

export function useCrossPlatformVAD(options: VADOptions = {}): VADReturn {
  const {
    onSpeechStart,
    onSpeechEnd,
    threshold = 0.015,
    speechFrames = 3,
    silenceFrames = 15,
    intervalMs = 50,
    externalStream = null,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(0);

  const onSpeechStartRef = useRef(onSpeechStart);
  const onSpeechEndRef = useRef(onSpeechEnd);
  onSpeechStartRef.current = onSpeechStart;
  onSpeechEndRef.current = onSpeechEnd;

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const destroyedRef = useRef(false);
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;
  const externalStreamRef = useRef<MediaStream | null>(externalStream);
  externalStreamRef.current = externalStream;
  const ownsStreamRef = useRef(false); // track if we created the stream

  const speechCountRef = useRef(0);
  const silenceCountRef = useRef(0);
  const isSpeakingRef = useRef(false);
  const debugCountRef = useRef(0);

  // ── Calculate RMS volume ───────────────────────────────────
  const calculateVolume = useCallback((analyser: AnalyserNode): number => {
    const dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = (dataArray[i] - 128) / 128;
      sum += value * value;
    }
    return Math.sqrt(sum / dataArray.length);
  }, []);

  // ── Start/restart monitoring interval ──────────────────────
  const startMonitoringInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    speechCountRef.current = 0;
    silenceCountRef.current = 0;
    debugCountRef.current = 0;

    console.log('🎙️ VAD monitoring interval started');

    intervalRef.current = setInterval(() => {
      if (!analyserRef.current) return;

      const vol = calculateVolume(analyserRef.current);
      setVolume(vol);

      debugCountRef.current++;
      if (debugCountRef.current % 40 === 0) {
        console.log(`🔊 VAD vol: ${vol.toFixed(4)}, threshold: ${thresholdRef.current}, speaking: ${isSpeakingRef.current}, speechFrames: ${speechCountRef.current}, silenceFrames: ${silenceCountRef.current}`);
      }

      if (vol >= thresholdRef.current) {
        speechCountRef.current++;
        silenceCountRef.current = 0;

        if (!isSpeakingRef.current && speechCountRef.current >= speechFrames) {
          console.log(`🗣️ VAD: Speech STARTED (vol: ${vol.toFixed(4)})`);
          isSpeakingRef.current = true;
          setIsSpeaking(true);
          onSpeechStartRef.current?.();
        }
      } else {
        silenceCountRef.current++;
        speechCountRef.current = 0;

        if (isSpeakingRef.current && silenceCountRef.current >= silenceFrames) {
          console.log(`🔇 VAD: Speech ENDED`);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          onSpeechEndRef.current?.();
        }
      }
    }, intervalMs);
  }, [calculateVolume, speechFrames, silenceFrames, intervalMs]);

  // ── Get mic stream (reuse external or create new) ──────────
  const getMicStream = useCallback(async (): Promise<MediaStream> => {
    // Prefer external shared stream (avoids iOS multi-getUserMedia bug)
    if (externalStreamRef.current?.active) {
      streamRef.current = externalStreamRef.current;
      ownsStreamRef.current = false;
      return externalStreamRef.current;
    }

    if (streamRef.current?.active) return streamRef.current;

    // Use simple audio:true — Safari rejects echoCancellation:false
    // and specific constraints can cause dead streams on iOS
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    streamRef.current = stream;
    ownsStreamRef.current = true;
    return stream;
  }, []);

  // ── Start VAD ──────────────────────────────────────────────
  const start = useCallback(async () => {
    destroyedRef.current = false;

    // Resume existing setup if paused
    if (analyserRef.current && streamRef.current?.active) {
      console.log('🔄 VAD: resuming existing setup');
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      startMonitoringInterval();
      setIsActive(true);
      return;
    }

    try {
      console.log('🎙️ VAD: requesting microphone...');
      const stream = await getMicStream();
      console.log('✅ VAD: mic stream obtained, tracks:', stream.getAudioTracks().length);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioContextRef.current?.state !== 'closed' ? audioContextRef.current : null;
      const audioCtx = ctx || new AudioCtx();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      console.log('✅ VAD: AudioContext state:', audioCtx.state, 'sampleRate:', audioCtx.sampleRate);

      try { sourceRef.current?.disconnect(); } catch (e) {}

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      source.connect(analyser);

      startMonitoringInterval();
      setIsActive(true);
      console.log('✅ Cross-platform VAD fully initialized and monitoring');
    } catch (err) {
      console.error('❌ VAD start failed:', err);
    }
  }, [startMonitoringInterval, getMicStream]);

  // ── Pause VAD ──────────────────────────────────────────────
  const pause = useCallback(() => {
    console.log('⏸️ VAD paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    speechCountRef.current = 0;
    silenceCountRef.current = 0;
    if (isSpeakingRef.current) {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }
    setIsActive(false);
    setVolume(0);
  }, []);

  // ── Destroy VAD ────────────────────────────────────────────
  const destroy = useCallback(() => {
    console.log('🗑️ VAD destroyed');
    destroyedRef.current = true;
    pause();

    try { sourceRef.current?.disconnect(); } catch (e) {}
    sourceRef.current = null;
    analyserRef.current = null;

    // try { audioContextRef.current?.close(); } catch (e) {}
    // audioContextRef.current = null;

    // ✅ CORRECT — check state before closing
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    audioContextRef.current = null;

    // Only stop stream if we created it (not external)
    if (streamRef.current && ownsStreamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    streamRef.current = null;

    setIsActive(false);
    setIsSpeaking(false);
    setVolume(0);
  }, [pause]);

  // ── Cleanup on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => {
      destroyedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      try { sourceRef.current?.disconnect(); } catch (e) {}
      // try { audioContextRef.current?.close(); } catch (e) {}
      // ✅ CORRECT
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
      }

      if (streamRef.current && ownsStreamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return { start, pause, destroy, isSpeaking, isActive, volume };
}

export default useCrossPlatformVAD;