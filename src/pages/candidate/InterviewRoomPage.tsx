import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Bot, Volume2, VolumeX,
  MessageSquare, SkipForward, AlertCircle, AlertTriangle, X, Play
} from 'lucide-react';
import { interviewService } from '@/services/interviewService';
import type { StartInterviewResponse, SendMessageResponse } from '@/services/interviewService';
import { useIntegrityDetection } from '@/hooks/useIntegrityDetection';
import { useCloudSTT } from '@/hooks/useCloudSTT';
import { useCloudTTS } from '@/hooks/useCloudTTS';
import { useCrossPlatformVAD } from '@/hooks/useCrossPlatformVAD';

// ── Module-level shared webcam ───────────────────────────────
let sharedStream: MediaStream | null = null;
let streamPromise: Promise<MediaStream | null> | null = null;

async function getSharedWebcamStream(): Promise<MediaStream | null> {
  if (sharedStream?.active) return sharedStream;
  if (streamPromise) return streamPromise;
  streamPromise = navigator.mediaDevices
    .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
    .then((s) => { sharedStream = s; streamPromise = null; return s; })
    .catch((e) => { console.error('Webcam:', e); streamPromise = null; return null; });
  return streamPromise;
}

// ── Module-level shared microphone ───────────────────────────
let sharedAudioStream: MediaStream | null = null;
let audioStreamPromise: Promise<MediaStream | null> | null = null;

async function getSharedAudioStream(): Promise<MediaStream | null> {
  if (sharedAudioStream?.active) return sharedAudioStream;
  if (audioStreamPromise) return audioStreamPromise;
  audioStreamPromise = navigator.mediaDevices
    .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } })
    .then((s) => { sharedAudioStream = s; audioStreamPromise = null; return s; })
    .catch((e) => { console.error('Mic:', e); audioStreamPromise = null; return null; });
  return audioStreamPromise;
}

const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// ── Text similarity: checks if transcript matches AI question ──
function textSimilarity(transcript: string, aiQuestion: string): number {
  if (!transcript || !aiQuestion) return 0;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const tWords = new Set(normalize(transcript));
  const qWords = new Set(normalize(aiQuestion));
  if (tWords.size === 0 || qWords.size === 0) return 0;
  let overlap = 0;
  tWords.forEach(w => { if (qWords.has(w)) overlap++; });
  return overlap / tWords.size;
}

// ============================================================
// COMPONENT
// ============================================================
export const InterviewRoomPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscriptDisplay, setFinalTranscriptDisplay] = useState('');
  const [conversation, setConversation] = useState<Array<{
    role: 'ai' | 'candidate'; message: string; timestamp: string;
  }>>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endingProgress, setEndingProgress] = useState(0);
  const [endingStatus, setEndingStatus] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pendingQuestionRef = useRef('');
  const currentQuestionRef = useRef('');
  const completionPendingRef = useRef(false);
  const ttsQueueRef = useRef<string[]>([]);

  // ── Interrupt mode tracking ────────────────────────────────
  const sileroAvailableRef = useRef(false);
  const sileroVadRef = useRef<any>(null);
  const sileroInitializedRef = useRef(false);
  const [interruptMode, setInterruptMode] = useState<'silero' | 'deepgram' | 'skip'>('skip');

  const sharedMicStreamRef = useRef<MediaStream | null>(null);
  const [sharedMicStream, setSharedMicStream] = useState<MediaStream | null>(null);

  // ── Integrity Detection ────────────────────────────────────
  const {
    faceCount,
    multipleFacesDetected,
    phoneDetected,
    lookingAway,
    totalFlags: integrityFlags,
    isModelLoaded: _detectionModelsLoaded,
    canvasRef: detectionCanvasRef,
  } = useIntegrityDetection({
    videoRef,
    interviewId,
    enabled: isInterviewStarted && isVideoOn && !isInterviewComplete,
    intervalMs: 2500,
  });

  // ── Recent detection memory ────────────────────────────────
  const recentPhoneRef = useRef(false);
  const recentLookingAwayRef = useRef(false);
  const recentMultipleFacesRef = useRef(false);
  const recentMaxFaceCountRef = useRef(0);

  useEffect(() => {
    if (phoneDetected) recentPhoneRef.current = true;
    if (lookingAway) recentLookingAwayRef.current = true;
    if (multipleFacesDetected) recentMultipleFacesRef.current = true;
    if (faceCount > recentMaxFaceCountRef.current) recentMaxFaceCountRef.current = faceCount;
  }, [phoneDetected, lookingAway, multipleFacesDetected, faceCount]);

  // ── Mutable refs ───────────────────────────────────────────
  const R = useRef({
    isAISpeaking: false,
    isListening: false,
    isInterviewComplete: false,
    isLoading: false,
    isMuted: false,
    isSpeaking: false,
    interviewId: null as number | null,
    screenshotCount: 0,
    accumulatedTranscript: '',
    longSilenceTimer: null as ReturnType<typeof setTimeout> | null,
    speechStartTime: 0,
    lastFinalChunkTime: 0,
    lastActivityTime: 0,
    lastInterimText: '',
    submissionCheckInterval: null as ReturnType<typeof setInterval> | null,
    useFallbackInterrupt: false,
    lastInterruptTime: 0,  // ← ADD THIS
    interruptSpeechBuffer: '',      // ← ADD
  capturingInterruptSpeech: false, // ← ADD
  });

  useEffect(() => {
    R.current.isAISpeaking = isAISpeaking;
    R.current.isListening = isListening;
    R.current.isInterviewComplete = isInterviewComplete;
    R.current.isLoading = isLoading;
    R.current.isMuted = isMuted;
    R.current.interviewId = interviewId;
    R.current.screenshotCount = screenshotCount;
  });

  const onUserDoneSpeakingRef = useRef<(text: string) => void>(() => {});
  const doStartListeningRef = useRef<() => void>(() => {});
  const doSpeakCheckInRef = useRef<(msg: string) => void>(() => {});

  // ============================================================
  // SILERO VAD
  // ============================================================
  const initSileroVAD = useCallback(async () => {
    if (sileroInitializedRef.current || sileroVadRef.current) return;
    sileroInitializedRef.current = true;

    try {
      if (!(window as any).ort) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.wasm.min.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load onnxruntime-web'));
          document.head.appendChild(s);
        });
        if ((window as any).ort?.env?.wasm) {
          (window as any).ort.env.wasm.numThreads = 1;
        }
      }

      if (!(window as any).__vadLoaded) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/bundle.min.js';
          s.onload = () => { (window as any).__vadLoaded = true; resolve(); };
          s.onerror = () => reject(new Error('Failed to load VAD bundle'));
          document.head.appendChild(s);
        });
      }

      const MicVAD = (window as any).vad?.MicVAD;
      if (!MicVAD) throw new Error('MicVAD not found');

      const vadInstance = await MicVAD.new({
        onnxWASMBasePath: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/',
        baseAssetPath: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/',
        positiveSpeechThreshold: 0.75,
        negativeSpeechThreshold: 0.3,
        minSpeechFrames: 8,
        redemptionFrames: 25,
        preSpeechPadFrames: 3,

       onSpeechStart: () => {
  console.log('🗣️ Silero: Speech detected');
  if (R.current.isAISpeaking) {
    const ttsStartTime = (R.current as any).ttsFirstStartTime || (R.current as any).ttsStartTime || 0;
    const isMobile = isMobileDevice();
    const echoWindow = isMobile ? 3000 : 1500;
    const confirmDelay = isMobile ? 3000 : 1500;

    if (Date.now() - ttsStartTime < echoWindow) {
      console.log(`🔇 Silero: Ignoring — echo window (${isMobile ? 'mobile' : 'desktop'})`);
      return;
    }

    const sileroSpeechAt = Date.now();

    

    setTimeout(() => {
      if (R.current.isAISpeaking &&
          (R.current.isSpeaking || Date.now() - sileroSpeechAt < confirmDelay + 1000)) {
        // Interrupt confirmed — stop TTS and keep STT running
        R.current.lastInterruptTime = Date.now();
        tts.stop();
        ttsQueueRef.current = [];
        setIsAISpeaking(false); R.current.isAISpeaking = false;
        try { sileroVadRef.current?.pause(); } catch (e) {}

        R.current.capturingInterruptSpeech = false;
        R.current.interruptSpeechBuffer = '';
        R.current.lastInterimText = '';
        R.current.accumulatedTranscript = '';
        R.current.lastActivityTime = 0;
        setFinalTranscriptDisplay('');
        setInterimTranscript('');

        if (!R.current.isInterviewComplete) {
          doStartListeningRef.current(); // restarts submission interval + VAD
        }
      } else {
      // False positive — Deepgram stays alive, just log it
  console.log('🔇 Silero: false positive, ignoring');
      }
    }, confirmDelay);
  }
},
        onSpeechEnd: () => {},
        onVADMisfire: () => {},
      });

      sileroVadRef.current = vadInstance;
      sileroAvailableRef.current = true;
      R.current.useFallbackInterrupt = false;
      setInterruptMode('silero');
      // Pause immediately — only start during AI speech via tts.onStart
      try { vadInstance.pause(); } catch (e) {}
      console.log('✅ Silero VAD loaded — using neural network interrupt');
    } catch (err) {
      console.warn('⚠️ Silero VAD failed to load, using Deepgram fallback:', err);
      sileroInitializedRef.current = false;
      sileroAvailableRef.current = false;
      R.current.useFallbackInterrupt = true;
      setInterruptMode('deepgram');
    }
  }, []);

  useEffect(() => {
    initSileroVAD();
    return () => {
      try { sileroVadRef.current?.destroy(); } catch (e) {}
      sileroVadRef.current = null;
      sileroInitializedRef.current = false;
    };
  }, [initSileroVAD]);

  // ============================================================
  // CLOUD STT (Deepgram)
  // ============================================================
  const stt = useCloudSTT({
    language: 'en',
    model: 'nova-2-conversationalai',
    smartFormat: true,
    externalStream: sharedMicStream,
    onInterim: (transcript) => {
      if (R.current.isAISpeaking && R.current.useFallbackInterrupt) {
        setInterimTranscript(transcript);
        return;
      }
      if (R.current.isAISpeaking || R.current.isLoading) return;
      
       if (transcript !== R.current.lastInterimText) {
    R.current.lastActivityTime = Date.now();
    R.current.lastInterimText = transcript;
  }
  setInterimTranscript(transcript);
},
    onFinal: (transcript, _confidence) => {
      // ── Deepgram fallback interrupt during AI speech ──
      if (R.current.isAISpeaking && R.current.useFallbackInterrupt) {
        if (!transcript.trim()) return;
        const words = transcript.trim().split(/\s+/).length;
        const similarity = textSimilarity(transcript, currentQuestionRef.current);
        console.log(`🔍 Deepgram fallback: "${transcript.slice(0, 40)}" similarity=${similarity.toFixed(2)} words=${words}`);
        if (similarity < 0.5 && words >= 3) {
          console.log('🗣️ Deepgram fallback: User interrupt detected!');
          tts.stop();
          ttsQueueRef.current = [];
          setIsAISpeaking(false); R.current.isAISpeaking = false;
          R.current.accumulatedTranscript = '';
          R.current.lastInterimText = '';
          R.current.lastActivityTime = 0;
          setFinalTranscriptDisplay('');
          setInterimTranscript('');
          setTimeout(() => {
            if (!R.current.isInterviewComplete) doStartListeningRef.current();
          }, 1000);
        }
        return;
      }

      // ── Silero mode: ignore finals during AI speech (echo risk) ──
      // ── Silero mode: ignore finals during AI speech (echo risk) ──
if (R.current.isAISpeaking && !R.current.useFallbackInterrupt) {
  if (!transcript.trim()) return;
  const similarity = textSimilarity(transcript, currentQuestionRef.current);
  if (similarity > 0.3) {
    console.log('🔇 Echo discarded, similarity:', similarity.toFixed(2));
    return;
  }
  // Real user speech during AI — buffer it
  R.current.interruptSpeechBuffer += (R.current.interruptSpeechBuffer ? ' ' : '') + transcript;
  console.log('📝 Buffered user speech during AI:', transcript.slice(0, 30));
  return;
}

      // ── Normal listening mode ──
      if (R.current.isAISpeaking || R.current.isLoading) return;
      if (!transcript.trim()) return;
       // Ignore echo transcripts for 2s after a Silero interrupt
      // In onFinal normal listening mode:


      console.log('✅ FINAL chunk:', transcript.slice(0, 50));
      R.current.lastActivityTime = Date.now();
      R.current.lastFinalChunkTime = Date.now();

      if (R.current.longSilenceTimer) {
        clearTimeout(R.current.longSilenceTimer);
        R.current.longSilenceTimer = null;
      }

      R.current.accumulatedTranscript += (R.current.accumulatedTranscript ? ' ' : '') + transcript;
      setFinalTranscriptDisplay(R.current.accumulatedTranscript);
      setInterimTranscript('');
    },
    onEnd: () => {
      setIsListening(false);
      R.current.isListening = false;
    },
    onError: (err) => {
      console.error('STT error:', err);
      setIsListening(false);
      R.current.isListening = false;
    },
  });

  // ============================================================
  // CLOUD TTS
  // ============================================================
  const tts = useCloudTTS({
    voice: 'en-US-AriaNeural',
    rate: '+0%',
    pitch: '+0Hz',
    onStart: () => {
      setIsAISpeaking(true);
      R.current.isAISpeaking = true;
       // Only set ttsStartTime on first sentence, not queue sentences
  if (!(R.current as any).ttsFirstStartTime) {
    (R.current as any).ttsStartTime = Date.now();
  } else {
    (R.current as any).ttsStartTime = (R.current as any).ttsFirstStartTime;
  }
      

      R.current.accumulatedTranscript = '';
      R.current.lastInterimText = '';
      setInterimTranscript('');
      setFinalTranscriptDisplay('');

      if (pendingQuestionRef.current) {
        setCurrentQuestion(pendingQuestionRef.current);
        currentQuestionRef.current = pendingQuestionRef.current;
        pendingQuestionRef.current = '';
      }

      if (sileroAvailableRef.current && sileroVadRef.current) {
        try {
          sileroVadRef.current.start();
          console.log('🎙️ Silero VAD started for interrupt detection');
        } catch (e) {
          console.error('Silero start failed, falling back:', e);
          R.current.useFallbackInterrupt = true;
          setInterruptMode('deepgram');
        }
      }
    },
    onEnd: () => {
  if (ttsQueueRef.current.length > 0) {
    const nextSentence = ttsQueueRef.current.shift()!;
    pendingQuestionRef.current = nextSentence;
    setTimeout(() => tts.speak(nextSentence), 20);
    return;
  }

  (R.current as any).ttsFirstStartTime = 0;
  setIsAISpeaking(false);
  R.current.isAISpeaking = false;
  try { sileroVadRef.current?.pause(); } catch (e) {}
  pauseVAD();

  if (completionPendingRef.current) {
    completionPendingRef.current = false;
    handleEndInterview();
    return;
  }

  if (!R.current.isInterviewComplete && !R.current.isLoading) {
  setTimeout(() => {
    // Replay anything user said while AI was speaking
    if (R.current.interruptSpeechBuffer.trim()) {
      R.current.accumulatedTranscript = R.current.interruptSpeechBuffer;
      R.current.lastActivityTime = Date.now();
      setFinalTranscriptDisplay(R.current.accumulatedTranscript);
      R.current.interruptSpeechBuffer = '';
    }
    doStartListeningRef.current();
  }, 400);
}
},
    onError: (err) => {
      console.error('TTS error:', err);
      setIsAISpeaking(false);
      R.current.isAISpeaking = false;
      try { sileroVadRef.current?.pause(); } catch (e) {}
      pauseVAD();

      if (pendingQuestionRef.current) {
        setCurrentQuestion(pendingQuestionRef.current);
        currentQuestionRef.current = pendingQuestionRef.current;
        pendingQuestionRef.current = '';
      }

      R.current.accumulatedTranscript = '';
      R.current.lastInterimText = '';
      R.current.lastActivityTime = 0;
      setInterimTranscript('');
      setFinalTranscriptDisplay('');

      if (completionPendingRef.current) {
        completionPendingRef.current = false;
        handleEndInterview();
        return;
      }
      if (!R.current.isInterviewComplete) {
        setTimeout(() => doStartListeningRef.current(), 400);
      }
    },
  });

  // ============================================================
  // Cross-platform VAD
  // ============================================================
  const vad = useCrossPlatformVAD({
    threshold: 0.015,
    speechFrames: 3,
    silenceFrames: 15,
    externalStream: sharedMicStream,
    onSpeechStart: () => {
      R.current.isSpeaking = true;
      R.current.speechStartTime = Date.now();
     
    },
    onSpeechEnd: () => {
      R.current.isSpeaking = false;
    },
  });

  const vadReady = vad.isActive;
  const startVAD = useCallback(async () => {
    try { await vad.start(); } catch (e) { console.error('Cross-platform VAD start failed:', e); }
  }, [vad]);
  const pauseVAD = useCallback(() => { vad.pause(); }, [vad]);

  // ============================================================
  // START / STOP LISTENING
  // ============================================================
  const startListening = useCallback(() => {
    if (R.current.isInterviewComplete || R.current.isLoading || R.current.isAISpeaking) return;

    stt.startListening();
    setIsListening(true);
    R.current.isListening = true;

    if (!R.current.submissionCheckInterval) {
      R.current.submissionCheckInterval = setInterval(() => {
        try {
          if (R.current.isLoading || R.current.isAISpeaking || R.current.isInterviewComplete) return;
          if (R.current.isSpeaking) {
            const speakingDuration = Date.now() - R.current.speechStartTime;
            if (speakingDuration > 10000) {
              console.log('⚠️ isSpeaking stuck for 10s+, resetting');
              R.current.isSpeaking = false;
            } else {
              return;
            }
          }
          if (!R.current.lastActivityTime) return;

          const silenceDuration = Date.now() - R.current.lastActivityTime;
          console.log(`⏱ Check: silence=${Math.round(silenceDuration / 1000)}s, speaking=${R.current.isSpeaking}, transcript="${R.current.accumulatedTranscript.slice(0, 30)}"`);

          if (silenceDuration >= 5000) {
            const currentText = R.current.accumulatedTranscript.trim();
            if (currentText && currentText.split(/\s+/).length < 2 && silenceDuration >= 15000) {
              console.log('🧹 Clearing stale short transcript:', currentText);
              R.current.accumulatedTranscript = '';
              R.current.lastInterimText = '';
              R.current.lastActivityTime = 0;
              setFinalTranscriptDisplay('');
              setInterimTranscript('');
              return;
            }
            if (!R.current.accumulatedTranscript.trim() && R.current.lastInterimText.trim()) {
              R.current.accumulatedTranscript = R.current.lastInterimText.trim();
              setFinalTranscriptDisplay(R.current.accumulatedTranscript);
              setInterimTranscript('');
            }

            const fullText = R.current.accumulatedTranscript.trim();
const wordCount = fullText.split(/\s+/).length;
const isPostInterrupt = Date.now() - R.current.lastInterruptTime < 10000;

if (fullText && (wordCount >= 2 || (isPostInterrupt && wordCount >= 1))) {
  if (R.current.isLoading) return;
  console.log('📤 SUBMITTING:', fullText.slice(0, 80));
  R.current.accumulatedTranscript = '';
  setInterimTranscript('');
  setFinalTranscriptDisplay('');
  onUserDoneSpeakingRef.current(fullText);
}
          }
        } catch (e) {
          console.error('⏱ Interval error:', e);
        }
      }, 1000);
    }

    startVAD();

    if (R.current.longSilenceTimer) clearTimeout(R.current.longSilenceTimer);
    const scheduleCheckIn = () => {
  R.current.longSilenceTimer = setTimeout(() => {
    if (R.current.isInterviewComplete || R.current.isAISpeaking || R.current.isLoading) return;
    
    const noActivity = !R.current.accumulatedTranscript.trim() && !R.current.lastInterimText.trim();
    const longSilence = !R.current.lastActivityTime || (Date.now() - R.current.lastActivityTime > 20000);
    
    if (!R.current.isSpeaking && noActivity && longSilence) {
      const msgs = [
        "Are you still there? Take your time and answer whenever you're ready.",
        "I notice some silence. Can you hear me clearly? Please go ahead when you're ready.",
        "Just checking in — are you able to hear my question? No rush at all.",
        "Take your time. I'm still here whenever you're ready to answer.",
      ];
      doSpeakCheckInRef.current(msgs[Math.floor(Math.random() * msgs.length)]);
    } else if (!R.current.isInterviewComplete) {
      scheduleCheckIn(); // reschedule and keep checking
    }
  }, 25000);
};

scheduleCheckIn();
}, [stt]); 

  const stopListening = useCallback(() => {
    if (R.current.longSilenceTimer) { clearTimeout(R.current.longSilenceTimer); R.current.longSilenceTimer = null; }
    stt.stopListening();
    setIsListening(false); R.current.isListening = false; R.current.isSpeaking = false;
    setInterimTranscript('');
    pauseVAD();
  }, [stt, pauseVAD]);

  // ============================================================
  // SPEAK TEXT
  // ============================================================
  const speakText = useCallback((text: string) => {
    R.current.accumulatedTranscript = '';
    setInterimTranscript('');
    
    R.current.lastInterimText = '';
    R.current.lastActivityTime = 0;
    R.current.lastFinalChunkTime = Date.now();

    if (R.current.isMuted) {
      if (!R.current.isInterviewComplete) setTimeout(() => startListening(), 200);
      return;
    }

    if (R.current.useFallbackInterrupt) {
  if (R.current.longSilenceTimer) { clearTimeout(R.current.longSilenceTimer); R.current.longSilenceTimer = null; }
  if (R.current.submissionCheckInterval) { clearInterval(R.current.submissionCheckInterval); R.current.submissionCheckInterval = null; }
  pauseVAD();
  console.log('🎧 Deepgram fallback: keeping STT alive during TTS');
} else {
  // Silero mode — keep Deepgram alive but stop submission interval + VAD
  if (R.current.longSilenceTimer) { clearTimeout(R.current.longSilenceTimer); R.current.longSilenceTimer = null; }
  if (R.current.submissionCheckInterval) { clearInterval(R.current.submissionCheckInterval); R.current.submissionCheckInterval = null; }
  pauseVAD();
  // DON'T stop STT — keep Deepgram connected so interrupt words are captured instantly
  // Transcripts during AI speech are already discarded in onFinal
    stt.startListening();  // ← ADD THIS
  console.log('🎙️ Silero mode: keeping Deepgram alive during TTS');
}

    // Always pause Silero before TTS so it resets state
    // and never fires immediately from accumulated audio
    try { sileroVadRef.current?.pause(); } catch (e) {}
    (R.current as any).ttsFirstStartTime = Date.now();

    tts.speak(text);
  }, [tts, startListening, stopListening, pauseVAD]);

  const skipAISpeech = useCallback(() => {
    tts.stop();
    ttsQueueRef.current = [];
    setIsAISpeaking(false); R.current.isAISpeaking = false;
    (R.current as any).ttsFirstStartTime = 0;  // ← ADD THIS
    try { sileroVadRef.current?.pause(); } catch (e) {}
    pauseVAD();

    R.current.accumulatedTranscript = '';
    R.current.lastInterimText = '';
    R.current.lastActivityTime = 0;
    R.current.capturingInterruptSpeech = false;
R.current.interruptSpeechBuffer = '';
    setFinalTranscriptDisplay('');
    setInterimTranscript('');

    if (!R.current.isInterviewComplete) setTimeout(() => startListening(), 200);
  }, [tts, startListening, pauseVAD]);

  useEffect(() => { doStartListeningRef.current = startListening; }, [startListening]);
  useEffect(() => { doSpeakCheckInRef.current = (msg: string) => { addToConversation('ai', msg); speakText(msg); }; }, [speakText]);

  const addToConversation = useCallback((role: 'ai' | 'candidate', message: string) => {
    setConversation(prev => [...prev, { role, message, timestamp: new Date().toLocaleTimeString() }]);
  }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  // ============================================================
  // Global watchdog
  // ============================================================
  useEffect(() => {
    if (!isInterviewStarted || isInterviewComplete) return;
    const watchdog = setInterval(() => {
      if (R.current.isLoading || R.current.isAISpeaking || R.current.isInterviewComplete) return;
      if (!R.current.isListening) {
        console.log('🚨 Global watchdog: everything died, restarting...');
        doStartListeningRef.current();
      }
    }, 8000);
    return () => clearInterval(watchdog);
  }, [isInterviewStarted, isInterviewComplete]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleEndInterview = useCallback(async () => {
    if (R.current.isInterviewComplete) return;
    const currentId = R.current.interviewId;
    if (!currentId) return;
    setIsInterviewComplete(true); R.current.isInterviewComplete = true;
    setIsEnding(true);
    setEndingProgress(5);
    setEndingStatus('Stopping interview...');

    tts.stop();
    ttsQueueRef.current = [];
    try { sileroVadRef.current?.pause(); } catch (e) {}
    pauseVAD();
    stt.stopListening();
    if (R.current.longSilenceTimer) { clearTimeout(R.current.longSilenceTimer); R.current.longSilenceTimer = null; }
    if (R.current.submissionCheckInterval) { clearInterval(R.current.submissionCheckInterval); R.current.submissionCheckInterval = null; }

    setEndingProgress(15);
    setEndingStatus('Saving conversation...');

    const progressInterval = setInterval(() => {
      setEndingProgress(prev => {
        if (prev >= 90) return prev;
        if (prev < 30) return prev + 3;
        if (prev < 60) return prev + 2;
        return prev + 1;
      });
    }, 500);

    const statusInterval = setInterval(() => {
      setEndingProgress(prev => {
        if (prev < 30) setEndingStatus('Analyzing transcript...');
        else if (prev < 50) setEndingStatus('AI is evaluating responses...');
        else if (prev < 70) setEndingStatus('Generating scores...');
        else if (prev < 85) setEndingStatus('Building interview report...');
        else setEndingStatus('Finalizing result...');
        return prev;
      });
    }, 2000);

    try {
      await Promise.race([
        interviewService.endInterview(currentId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000)),
      ]);
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      setEndingProgress(100);
      setEndingStatus('Complete! Redirecting...');
      await new Promise(r => setTimeout(r, 600));
    } catch (e) {
      console.error('End interview:', e);
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      setEndingProgress(100);
      setEndingStatus('Done! Redirecting...');
      await new Promise(r => setTimeout(r, 500));
    }

    navigate('/interview/complete');
  }, [navigate, tts, stt, pauseVAD]);

  const handleCandidateAnswer = useCallback(async (answer: string) => {
    if (!answer.trim() || !R.current.interviewId || R.current.isLoading) return;



  // ── Normalize for comparison ───────────────────────────────
  const normalized = answer.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').trim();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  let isFiller = false;  // ← declare here

  // ── Handle repeat requests — replay current question ───────
  const repeatPhrases = [
    'say again', 'say it again', 'repeat that', 'repeat please',
    'can you repeat', 'pardon', 'what did you say', 'come again',
    'could you repeat', 'please repeat', 'repeat the question',
    'what was the question', 'can you say that again',
  ];
  if (wordCount <= 7) {
    const isRepeat = repeatPhrases.some(p =>
      normalized === p || normalized.includes(p)
    );
    if (isRepeat) {
      console.log('🔁 Repeat request — replaying question');
      const lastQuestion = currentQuestionRef.current;
      if (lastQuestion) {
        stopListening();
        speakText(lastQuestion);
      }
      return;
    }
  }

  // ── Drop pure fillers silently ─────────────────────────────
  const fillerPhrases = [
    'hello', 'hi', 'hey', 'okay', 'ok', 'oh okay', 'oh ok', 'oh ok okay',
    'sure', 'yes', 'no', 'yeah', 'yep', 'nope',
    'continue', 'go on', 'go ahead', 'proceed',
    'start', 'begin', 'lets start', 'lets begin',
    'im ready', 'ready', 'i am ready',
    'one moment', 'give me a second', 'wait',
    'hmm', 'um', 'uh', 'ah', 'oh',
    'i see', 'i understand', 'got it', 'alright', 'all right',
  ];
  if (wordCount <= 5) {
    isFiller = fillerPhrases.some(p =>   // ← assign to the outer let isFiller
      normalized === p || normalized.startsWith(p + ' ')
    );
    if (isFiller) {
      console.log('💬 Filler — sending to AI without counting:', answer);
      setFinalTranscriptDisplay(answer);
      R.current.accumulatedTranscript = '';
      R.current.lastActivityTime = 0;
      // fall through with is_filler: true
    }
}

     // ── Detect early exit intent ──────────────────────────────
  const exitPhrases = [
    "can't continue", "cannot continue", "cant continue",
    "want to stop", "need to stop", "have to stop",
    "end the interview", "stop the interview", "end interview",
    "i quit", "i give up", "i want to leave",
    "not feeling well", "emergency", "have to go",
  ];
  const lowerAnswer = answer.toLowerCase();
  const wantsToExit = exitPhrases.some(phrase => lowerAnswer.includes(phrase));

  if (wantsToExit) {
  addToConversation('candidate', answer);
  stopListening();

  const closingMessage = "Thank you for letting me know. I understand, and I appreciate your time today. We'll wrap up the interview here. Take care!";
  addToConversation('ai', closingMessage);

  const currentInterviewId = R.current.interviewId;
  if (currentInterviewId) {
    const token = localStorage.getItem('access_token') || '';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    // Save candidate exit message to DB
    fetch(`${baseUrl}/api/interviews/${currentInterviewId}/add_message/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ role: 'candidate', message: answer }),
    }).catch(() => {});
    // Save AI closing message to DB
    fetch(`${baseUrl}/api/interviews/${currentInterviewId}/add_message/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ role: 'ai', message: closingMessage }),
    }).catch(() => {});
  }

  completionPendingRef.current = true;
  pendingQuestionRef.current = closingMessage;
  speakText(closingMessage);
  return;
}

    const currentInterviewId = R.current.interviewId;

    ttsQueueRef.current = [];
    stopListening();
    setIsLoading(true); R.current.isLoading = true;
    setError(null); setInterimTranscript('');
if (!isFiller) setFinalTranscriptDisplay('');

    try {
      addToConversation('candidate', answer);

      let token = localStorage.getItem('access_token') || '';
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

      let resp = await fetch(
        `${baseUrl}/api/interviews/${currentInterviewId}/send_message/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: answer, is_filler: isFiller }),
        }
      );

      if (resp.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const refreshResp = await fetch(`${baseUrl}/api/auth/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            });
            if (refreshResp.ok) {
              const data = await refreshResp.json();
              localStorage.setItem('access_token', data.access);
              token = data.access;
              resp = await fetch(
                `${baseUrl}/api/interviews/${currentInterviewId}/send_message/`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ message: answer}),
                }
              );
            }
          }
        } catch (refreshErr) { console.error('Token refresh failed:', refreshErr); }
      }

      if (!resp.ok) {
        let errorMsg = `${resp.status}: ${resp.statusText}`;
        if (resp.status === 400 || resp.status === 401) {
          try {
            const body = await resp.json();
            errorMsg = body.error || body.detail || errorMsg;
          } catch (e) {}
        }
        throw new Error(errorMsg);
      }

      const contentType = resp.headers.get('content-type') || '';

      // ── SSE streaming path ─────────────────────────────────
      if (contentType.includes('text/event-stream')) {
        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = '';
        let firstSentencePlayed = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split('\n');
          lineBuffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.type === 'sentence') {
                if (!firstSentencePlayed) {
                  setIsLoading(false); R.current.isLoading = false;
                  firstSentencePlayed = true;
                  pendingQuestionRef.current = data.text;
                  speakText(data.text);
                } else {
                  ttsQueueRef.current.push(data.text);  
                }
              }

              if (data.type === 'done') {
                addToConversation('ai', data.message);
                setQuestionNumber(data.question_number);
                if (data.is_complete) completionPendingRef.current = true;
                if (!firstSentencePlayed && data.message) {
                  setIsLoading(false); R.current.isLoading = false;
                  pendingQuestionRef.current = data.message;
                  speakText(data.message);
                }
              }

              if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (parseErr) { /* skip malformed lines */ }
          }
        }

        // Ensure loading cleared if SSE ended without a sentence event
        if (R.current.isLoading) {
          setIsLoading(false);
          R.current.isLoading = false;
        }
        return;
      }

      // ── Non-streaming fallback (JSON) ──────────────────────
      const responseData = await resp.json();
      addToConversation('ai', responseData.message);
      setQuestionNumber(responseData.question_number);
      setIsLoading(false); R.current.isLoading = false;
      pendingQuestionRef.current = responseData.message;
      if (responseData.is_complete) completionPendingRef.current = true;
      speakText(responseData.message);

    } catch (err) {
      ttsQueueRef.current = [];
      const msg = err instanceof Error ? err.message : 'Failed to send answer';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('500');

      R.current.accumulatedTranscript = '';
      R.current.lastInterimText = '';
      R.current.lastActivityTime = 0;
      setFinalTranscriptDisplay('');
      setInterimTranscript('');

      const is400 = msg.includes('not in progress') || msg.includes('already completed');
      if (is400) {
        setIsLoading(false); R.current.isLoading = false;
        handleEndInterview();
        return;
      }

      setError(isQuota ? 'AI service temporarily unavailable. Please wait and try again.' : msg);
      setIsLoading(false); R.current.isLoading = false;
      if (!isQuota) setTimeout(() => { if (!R.current.isInterviewComplete) startListening(); }, 500);
    }
  }, [speakText, stopListening, startListening, addToConversation, handleEndInterview]);

  useEffect(() => { onUserDoneSpeakingRef.current = handleCandidateAnswer; }, [handleCandidateAnswer]);

  // ============================================================
  // WEBCAM
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    getSharedWebcamStream().then((stream) => {
      if (cancelled || !stream) return;
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isVideoOn && videoRef.current && sharedStream?.active) videoRef.current.srcObject = sharedStream;
  }, [isVideoOn]);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    if (node && sharedStream?.active) { node.srcObject = sharedStream; node.play().catch(() => {}); }
  }, []);

  // ── Cleanup ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (sharedStream) { sharedStream.getTracks().forEach(t => t.stop()); sharedStream = null; }
      if (sharedAudioStream) { sharedAudioStream.getTracks().forEach(t => t.stop()); sharedAudioStream = null; }
      tts.stop();
      stt.destroy();
      try { sileroVadRef.current?.destroy(); } catch (e) {}
      if (R.current.longSilenceTimer) clearTimeout(R.current.longSilenceTimer);
      if (R.current.submissionCheckInterval) clearInterval(R.current.submissionCheckInterval);
      vad.destroy();
    };
  }, []);

  // ── Start interview ────────────────────────────────────────
  const hasStartedRef = useRef(false);
  const startAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!uuid || hasStartedRef.current) return;
    hasStartedRef.current = true;
    const resolveUUID = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const resp = await fetch(`${baseUrl}/api/interviews/by-uuid/${uuid}/`);
    if (!resp.ok) { 
  setError(resp.status === 404 ? 'Interview not found.' : 'Failed to load interview.'); 
  setIsLoading(false); 
  return; 
}
    const data = await resp.json();
    setInterviewId(data.id); R.current.interviewId = data.id;

    if (data.status === 'completed') {
      navigate('/interview/already-completed', { replace: true });
      return;
    }

  

    if (isMobileDevice()) { setNeedsUserGesture(true); setIsLoading(false); return; }
    const ac = new AbortController(); startAbortRef.current = ac;
    setTimeout(() => { if (!ac.signal.aborted) doStartInterview(data.id, ac.signal); }, 500);
  } catch (err) { setError('Failed to connect.'); setIsLoading(false); }
};
    resolveUUID();
    return () => { startAbortRef.current?.abort(); };
  }, [uuid]);

  const doStartInterview = async (intId: number, signal?: AbortSignal) => {
    if (signal?.aborted) return;
    setIsLoading(true); R.current.isLoading = true; setError(null); setNeedsUserGesture(false);

    const micStream = await getSharedAudioStream();
    sharedMicStreamRef.current = micStream;
    setSharedMicStream(micStream);

    // Pre-connect Deepgram with stream directly — bypasses setState lag
    stt.startListening(micStream || undefined).catch(() => {});

    try {
      const res: StartInterviewResponse = await interviewService.startInterview(intId);
      if (signal?.aborted) return;
      setIsInterviewStarted(true);
      setQuestionNumber(res.question_number); setTotalQuestions(res.total_questions);
      addToConversation('ai', res.message); setIsLoading(false); R.current.isLoading = false;
      pendingQuestionRef.current = res.message;
      setCurrentQuestion(res.message);
      speakText(res.message);
    } catch (err) {
      if (signal?.aborted) return;
      const msg = err instanceof Error ? err.message : 'Failed to start interview';
      setError(msg.includes('429') || msg.includes('quota') ? 'AI quota exceeded. Wait and refresh.' : msg);
      setIsLoading(false); R.current.isLoading = false;
    }
  };

  const handleMobileStart = () => { if (interviewId) doStartInterview(interviewId); };

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isInterviewStarted || isInterviewComplete) return;
    const t = setInterval(() => setElapsedTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [isInterviewStarted, isInterviewComplete]);

  // ── Screenshots every 10s ─────────────────────────────────
  const screenshotFailCount = useRef(0);
  useEffect(() => {
    if (!isInterviewStarted || isInterviewComplete) return;
    const iv = setInterval(() => captureScreenshotRef.current(), 10000);
    return () => clearInterval(iv);
  }, [isInterviewStarted, isInterviewComplete]);

  const captureScreenshot = useCallback(async () => {
    if (isCapturing || !R.current.interviewId || screenshotFailCount.current >= 3) return;
    setIsCapturing(true);
    try {
      // ── Camera off — report as integrity flag ──────────────
      if (!isVideoOn) {
        const blankCanvas = document.createElement('canvas');
        blankCanvas.width = 1; blankCanvas.height = 1;
        const blankBlob = await new Promise<Blob | null>(r => blankCanvas.toBlob(r, 'image/jpeg', 0.1));

        const fd = new FormData();
        if (blankBlob) fd.append('webcam_image', blankBlob, `camera_off_${Date.now()}.jpg`);
        fd.append('interview', R.current.interviewId.toString());
        fd.append('screenshot_number', (R.current.screenshotCount + 1).toString());
        fd.append('face_count', '0');
        fd.append('issue_type', 'camera_off');
        fd.append('is_flagged', 'true');
        fd.append('metadata', JSON.stringify({
          camera_off: true, face_count: 0,
          multiple_faces: false, phone_detected: false, looking_away: false,
        }));

        let token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
        const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/interview-screenshots/upload/`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        if (resp.ok) { setScreenshotCount(p => p + 1); screenshotFailCount.current = 0; }
        setIsCapturing(false);
        return;
      }

      // ── Normal webcam capture ──────────────────────────────
      const video = videoRef.current;
      if (!video || !video.videoWidth) { setIsCapturing(false); return; }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
      }
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.8));
      if (blob && R.current.interviewId) {
        const fd = new FormData();
        fd.append('webcam_image', blob, `webcam_${Date.now()}.jpg`);
        fd.append('interview', R.current.interviewId.toString());
        fd.append('screenshot_number', (R.current.screenshotCount + 1).toString());

        const wasPhoneDetected = phoneDetected || recentPhoneRef.current;
        const wasLookingAway = lookingAway || recentLookingAwayRef.current;
        const wasMultipleFaces = multipleFacesDetected || recentMultipleFacesRef.current;
        const maxFaces = Math.max(faceCount, recentMaxFaceCountRef.current);

        fd.append('face_count', maxFaces.toString());
        if (wasMultipleFaces) fd.append('multiple_people_detected', 'true');
        if (wasPhoneDetected) fd.append('issue_type', 'phone_detected');
        else if (wasLookingAway) fd.append('issue_type', 'looking_away');
        else if (wasMultipleFaces) fd.append('issue_type', 'multiple_faces');

        fd.append('metadata', JSON.stringify({ face_count: maxFaces, multiple_faces: wasMultipleFaces, phone_detected: wasPhoneDetected, looking_away: wasLookingAway }));
        if (wasMultipleFaces || wasPhoneDetected || wasLookingAway) fd.append('is_flagged', 'true');

        recentPhoneRef.current = false; recentLookingAwayRef.current = false;
        recentMultipleFacesRef.current = false; recentMaxFaceCountRef.current = 0;

        let token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
        let resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/interview-screenshots/upload/`, {
          method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {}, body: fd,
        });

        if (resp.status === 401) {
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const refreshResp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
              });
              if (refreshResp.ok) {
                const data = await refreshResp.json();
                localStorage.setItem('access_token', data.access);
                token = data.access;
                const retryFd = new FormData();
                retryFd.append('webcam_image', blob!, `webcam_${Date.now()}.jpg`);
                retryFd.append('interview', R.current.interviewId!.toString());
                retryFd.append('screenshot_number', (R.current.screenshotCount + 1).toString());
                resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/interview-screenshots/upload/`, {
                  method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: retryFd,
                });
              }
            }
          } catch (e) { console.error('Screenshot token refresh failed:', e); }
        }

        if (resp.ok) { setScreenshotCount(p => p + 1); screenshotFailCount.current = 0; }
        else if (resp.status === 401) screenshotFailCount.current++;
      }
    } catch (e) {} finally { setIsCapturing(false); }
  }, [isCapturing, isVideoOn, faceCount, multipleFacesDetected, phoneDetected, lookingAway]);

  const captureScreenshotRef = useRef(captureScreenshot);
  useEffect(() => { captureScreenshotRef.current = captureScreenshot; }, [captureScreenshot]);

  const toggleMute = () => {
    const m = !isMuted; setIsMuted(m); R.current.isMuted = m;
    if (m) { tts.stop(); setIsAISpeaking(false); R.current.isAISpeaking = false; pauseVAD(); try { sileroVadRef.current?.pause(); } catch (e) {} }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const liveText = finalTranscriptDisplay + (interimTranscript ? (finalTranscriptDisplay ? ' ' : '') + interimTranscript : '');

  const getInterruptLabel = () => {
    if (interruptMode === 'silero') return 'Speak to interrupt';
    if (interruptMode === 'deepgram') return 'Speak to interrupt (auto)';
    return 'Tap Skip to interrupt';
  };

  const getStatus = () => {
    if (isAISpeaking) return { color: 'bg-blue-500', text: 'AI Speaking', textColor: 'text-blue-400', hint: getInterruptLabel() };
    if (tts.isLoading) return { color: 'bg-blue-500', text: 'AI Thinking...', textColor: 'text-blue-300', hint: 'Preparing response' };
    if (isListening) return { color: 'bg-green-500', text: 'Listening', textColor: 'text-green-400', hint: vadReady ? 'VAD active • speak naturally' : 'Pause to submit' };
    if (isLoading) return { color: 'bg-amber-500', text: 'Processing', textColor: 'text-amber-400', hint: 'AI is thinking...' };
    return { color: 'bg-neutral-500', text: 'Ready', textColor: 'text-neutral-400', hint: '' };
  };
  const status = getStatus();

  // ============================================================
  // RENDER
  // ============================================================
  if (needsUserGesture && !isInterviewStarted) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h2 className="text-white text-lg sm:text-xl font-semibold mb-2">AI Interview</h2>
          <p className="text-neutral-400 text-sm mb-2">Please ensure:</p>
          <ul className="text-neutral-500 text-xs sm:text-sm mb-6 space-y-1">
            <li>✅ Camera & microphone access allowed</li>
            <li>✅ Stable internet connection</li>
            <li>✅ Quiet environment</li>
            <li>🎧 Headphones recommended</li>
          </ul>
          <button onClick={handleMobileStart}
            className="w-full px-8 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20">
            <Play className="w-5 h-5" /> Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !isInterviewStarted) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 animate-spin opacity-30" />
            <div className="absolute inset-2 rounded-full bg-[#0a0a0f] flex items-center justify-center">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-violet-400 animate-pulse" />
            </div>
          </div>
          <p className="text-white text-base sm:text-lg font-medium">Preparing your interview...</p>
          <p className="text-neutral-500 text-xs sm:text-sm mt-2">Please allow microphone & camera access</p>
        </div>
      </div>
    );
  }

  if (error && !isInterviewStarted) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="bg-[#12121a] border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-red-400 text-base sm:text-lg font-semibold mb-2">Unable to Start</h2>
          <p className="text-neutral-400 text-xs sm:text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">

      {/* End Interview Loading Overlay */}
      {isEnding && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md flex items-center justify-center">
          <div className="text-center max-w-sm w-full px-6">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="url(#progressGradient)" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - endingProgress / 100)}`}
                  className="transition-all duration-500 ease-out" />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-bold">{endingProgress}%</span>
              </div>
            </div>
            <h2 className="text-white text-lg font-semibold mb-2">Generating Your Result</h2>
            <p className="text-violet-300 text-sm mb-4 animate-pulse">{endingStatus}</p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${endingProgress}%` }} />
            </div>
            <p className="text-neutral-500 text-xs mt-4">Please don't close this page</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-xs sm:text-sm hidden sm:inline">AI Interview</span>
          <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full ${isAISpeaking || tts.isLoading ? 'bg-blue-500/15' : isListening ? 'bg-green-500/15' : isLoading ? 'bg-amber-500/15' : 'bg-white/5'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status.color} ${status.text !== 'Ready' ? 'animate-pulse' : ''}`} />
            <span className={`text-[10px] sm:text-xs font-medium ${status.textColor}`}>{status.text}</span>
          </div>
          {vadReady && isListening && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10">
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-medium">VAD</span>
            </div>
          )}
          {integrityFlags > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-[9px] text-red-400 font-medium">{integrityFlags} flag{integrityFlags > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {status.hint && <span className="text-neutral-500 text-[10px] sm:text-xs hidden md:block">{status.hint}</span>}
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="text-[10px] sm:text-xs font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {error && isInterviewStarted && (
        <div className="mx-3 sm:mx-5 mt-2 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 text-[10px] sm:text-xs flex-1">{error}</span>
          <button onClick={() => { setError(null); startListening(); }}
            className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors">Retry</button>
          <button onClick={() => setError(null)}><X className="w-3.5 h-3.5 text-red-400/60 hover:text-red-400" /></button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-4 min-w-0">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 min-h-0">

            {/* AI Interviewer panel */}
            <div className="relative bg-[#12121a] rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 min-h-[140px] sm:min-h-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-16 h-16 sm:w-28 sm:h-28 mx-auto mb-2 sm:mb-4">
                    {(isAISpeaking || tts.isLoading) && (
                      <><div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
                      <div className="absolute inset-2 rounded-full border border-violet-500/20 animate-ping" style={{ animationDelay: '300ms' }} /></>
                    )}
                    <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center transition-all duration-500 ${isAISpeaking ? 'scale-105 shadow-xl shadow-violet-500/25' : ''}`}>
                      <Bot className="w-7 h-7 sm:w-12 sm:h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-xs sm:text-sm">AI Interviewer</h3>
                  {isAISpeaking ? (
                    <div className="mt-1 sm:mt-2 space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-center gap-[3px] h-4 sm:h-5">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} className="w-[2px] sm:w-[3px] bg-violet-400 rounded-full animate-bounce"
                            style={{ height: `${10 + Math.random() * 6}px`, animationDelay: `${i * 100}ms`, animationDuration: '0.6s' }} />
                        ))}
                      </div>
                      <button onClick={skipAISpeech}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-neutral-300 text-[10px] sm:text-xs transition-colors">
                        <SkipForward className="w-3 h-3" /> Skip
                      </button>
                    </div>
                  ) : tts.isLoading ? (
                    <p className="text-blue-300/80 text-[10px] sm:text-xs mt-1 sm:mt-2">Preparing response...</p>
                  ) : (
                    <p className="text-neutral-500 text-[10px] sm:text-xs mt-1 sm:mt-2">
                      {isListening ? 'Listening to you...' : isLoading ? 'Thinking...' : 'Ready'}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 py-0.5 sm:py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                <span className="text-white text-[10px] sm:text-xs font-medium">AI Interviewer</span>
              </div>
            </div>

            {/* Candidate video panel */}
            <div className="relative bg-[#12121a] rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 min-h-[140px] sm:min-h-0">
              {isVideoOn ? (
                <>
                  <video ref={setVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                  <canvas ref={detectionCanvasRef as React.RefObject<HTMLCanvasElement>} className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: 5 }} />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#12121a] to-[#1a1a2e]">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                    <span className="text-lg sm:text-2xl text-white font-bold">You</span>
                  </div>
                </div>
              )}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 py-0.5 sm:py-1 bg-black/50 backdrop-blur-sm rounded-lg" style={{ zIndex: 10 }}>
                <span className="text-white text-[10px] sm:text-xs font-medium">You</span>
              </div>
              {multipleFacesDetected && (
                <div className="absolute inset-0 border-2 border-red-500 rounded-xl sm:rounded-2xl animate-pulse" style={{ zIndex: 15 }}>
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600/90 backdrop-blur-sm rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-[9px] sm:text-[11px] font-semibold">{faceCount} faces detected!</span>
                  </div>
                </div>
              )}
              {phoneDetected && !multipleFacesDetected && (
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-500/90 backdrop-blur-sm rounded-lg animate-pulse" style={{ zIndex: 15 }}>
                  <span className="text-white text-[9px] sm:text-[11px] font-semibold">📱 Phone Detected</span>
                </div>
              )}
              {lookingAway && !multipleFacesDetected && !phoneDetected && (
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500/90 backdrop-blur-sm rounded-lg animate-pulse" style={{ zIndex: 15 }}>
                  <span className="text-white text-[9px] sm:text-[11px] font-semibold">👁 Look at Screen</span>
                </div>
              )}
              {isListening && !isAISpeaking && !multipleFacesDetected && (
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-12 sm:right-16 flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg" style={{ zIndex: 10 }}>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-[9px] sm:text-[10px] font-medium">{vadReady ? 'Listening (VAD)...' : 'Listening...'}</span>
                </div>
              )}
              {isAISpeaking && !multipleFacesDetected && (
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg" style={{ zIndex: 10 }}>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-blue-400 text-[9px] sm:text-[10px] font-medium">
                    {interruptMode === 'silero' ? '🎙️ Speak to interrupt' :
                    interruptMode === 'deepgram' ? '🎙️ Speak to interrupt' :
                    '⏭️ Tap Skip to interrupt'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Transcript bar */}
          <div className="h-20 sm:h-28 bg-[#12121a] rounded-xl sm:rounded-2xl border border-white/5 flex flex-col overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-3 sm:px-4 pt-2 sm:pt-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isListening && !isAISpeaking ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
                <span className="text-neutral-500 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider">
                  {isListening ? 'Listening...' : isAISpeaking ? 'AI Speaking' : isLoading ? 'Processing...' : 'Transcript'}
                </span>
              </div>
              <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 overflow-y-auto">
              {liveText && !isAISpeaking ? (
                <p className="text-xs sm:text-sm leading-relaxed">
                  <span className="text-white">{finalTranscriptDisplay}</span>
                  {interimTranscript && <span className="text-green-400/60 italic"> {interimTranscript}</span>}
                  {interimTranscript && <span className="inline-block w-0.5 h-3 sm:h-4 bg-violet-400 ml-0.5 animate-pulse align-middle" />}
                </p>
              ) : isAISpeaking ? (
                <p className="text-xs sm:text-sm text-violet-300/80 leading-relaxed line-clamp-3">{currentQuestion}</p>
              ) : isLoading || tts.isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-end gap-[3px] h-5">
                    {[0,1,2,3,4,5,6].map(i => (
                      <div key={i} className="w-[3px] rounded-full bg-violet-400/70"
                        style={{
                          height: `${8 + Math.sin(i * 0.8) * 6}px`,
                          animation: 'barPulse 1.2s ease-in-out infinite',
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-violet-300/70">
                    {tts.isLoading ? 'Preparing audio...' : 'AI is thinking...'}
                  </span>
                </div>
              ) : (
                <p className="text-neutral-600 text-xs sm:text-sm italic">
                  {currentQuestion
                    ? <><span className="text-violet-300/60">{currentQuestion}</span><br/><span>Speak to respond...</span></>
                    : 'Waiting for interview to begin...'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="fixed sm:static inset-0 sm:inset-auto z-30 sm:z-auto w-full sm:w-80 bg-[#0d0d14] sm:border-l border-white/5 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-white text-sm font-semibold">Conversation</span>
              <button onClick={() => setShowChat(false)}><X className="w-5 h-5 sm:w-4 sm:h-4 text-neutral-500 hover:text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {conversation.map((entry, i) => (
                <div key={i} className={`flex flex-col gap-1 ${entry.role === 'candidate' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-neutral-600 font-mono">{entry.timestamp}</span>
                  <div className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${entry.role === 'ai' ? 'bg-violet-500/10 text-violet-200 rounded-tl-sm' : 'bg-green-500/10 text-green-200 rounded-tr-sm'}`}>{entry.message}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 bg-[#0a0a0f]/80 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={toggleMute} title={isMuted ? 'Unmute AI' : 'Mute AI'}
            className={`p-2 sm:p-2.5 rounded-xl transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsVideoOn(!isVideoOn)} title={isVideoOn ? 'Camera Off' : 'Camera On'}
            className={`p-2 sm:p-2.5 rounded-xl transition-colors ${!isVideoOn ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowChat(!showChat)} title="Chat"
            className={`p-2 sm:p-2.5 rounded-xl transition-colors ${showChat ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
            <MessageSquare className="w-4 h-4" />
          </button>
          {isAISpeaking && (
            <button onClick={skipAISpeech} title="Skip AI speech"
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={handleEndInterview} disabled={isEnding}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">{isEnding ? 'Ending...' : 'End Interview'}</span>
          <span className="sm:hidden">{isEnding ? '...' : 'End'}</span>
        </button>
      </div>
    </div>
  );
};