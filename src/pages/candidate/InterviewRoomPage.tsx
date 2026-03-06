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

// ── Speech Recognition types ─────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

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

const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
  const [vadReady, setVadReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Integrity Detection (faces + phone + gaze) ─────────────
  const {
    faceCount,
    multipleFacesDetected,
    phoneDetected,
    lookingAway,
    totalFlags: integrityFlags,
    isModelLoaded: detectionModelsLoaded,
    canvasRef: detectionCanvasRef,
  } = useIntegrityDetection({
    videoRef,
    interviewId,
    enabled: isInterviewStarted && isVideoOn && !isInterviewComplete,
    intervalMs: 2500,
  });

  // ── Recent detection memory (survives between 10s screenshot intervals) ──
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
    aiSpokenText: '',
    silenceTimer: null as ReturnType<typeof setTimeout> | null,
    vadSpeechActive: false,
    longSilenceTimer: null as ReturnType<typeof setTimeout> | null,
    speechStartTime: 0,
    lastFinalChunkTime: 0,
    // ✅ FIX: Track whether recognition restart is already scheduled
    restartScheduled: false,
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
  // VAD
  // ============================================================
  const vadRef = useRef<any>(null);
  const vadInitializedRef = useRef(false);

  const initVAD = useCallback(async () => {
    if (vadInitializedRef.current || vadRef.current) return;
    vadInitializedRef.current = true;
    try {
      // ✅ FIX: Load onnxruntime-web from CDN FIRST so it's available globally
      // before VAD tries to use it. The CDN bundle sets window.ort which VAD picks up.
      // This avoids the ortConfig approach entirely (which fails on old VAD bundle versions).
      if (!(window as any).ort) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.min.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load onnxruntime-web'));
          document.head.appendChild(s);
        });
        // Set wasm paths to our local public/ files
        if ((window as any).ort?.env?.wasm) {
          (window as any).ort.env.wasm.numThreads = 1;
          (window as any).ort.env.wasm.wasmPaths = {
            'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm',
            'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
            'ort-wasm.wasm': '/ort-wasm.wasm',
          };
        }
      }

      // Load VAD bundle from CDN
      if (!(window as any).__vadLoaded) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.19/dist/bundle.min.js';
          s.onload = () => { (window as any).__vadLoaded = true; resolve(); };
          s.onerror = () => reject(new Error('Failed to load VAD CDN bundle'));
          document.head.appendChild(s);
        });
      }

      const MicVAD = (window as any).vad?.MicVAD;
      if (!MicVAD) { vadInitializedRef.current = false; return; }
      const vad = await MicVAD.new({
        workletURL: '/vad.worklet.bundle.min.js',
        modelURL: '/silero_vad_legacy.onnx',
        positiveSpeechThreshold: 0.75,
        negativeSpeechThreshold: 0.3,
        minSpeechFrames: 8,
        redemptionFrames: 25,
        preSpeechPadFrames: 3,

        onSpeechStart: () => {
          R.current.isSpeaking = true;
          R.current.speechStartTime = Date.now();
          if (R.current.longSilenceTimer) { clearTimeout(R.current.longSilenceTimer); R.current.longSilenceTimer = null; }
          // Cancel any pending silence submit — user is still talking
          if (R.current.silenceTimer) { clearTimeout(R.current.silenceTimer); R.current.silenceTimer = null; }
          if (R.current.isAISpeaking) {
            setTimeout(() => {
              if (R.current.isSpeaking && R.current.isAISpeaking) {
                if (synthRef.current) synthRef.current.cancel();
                setIsAISpeaking(false); R.current.isAISpeaking = false; R.current.aiSpokenText = '';
                setTimeout(() => { if (!R.current.isInterviewComplete) doStartListeningRef.current(); }, 150);
              }
            }, 800);
          }
        },

        onSpeechEnd: () => {
          R.current.isSpeaking = false;
          if (R.current.isAISpeaking || R.current.isLoading || R.current.isInterviewComplete) return;
          if (R.current.silenceTimer) clearTimeout(R.current.silenceTimer);
          R.current.silenceTimer = setTimeout(() => {
            const fullText = R.current.accumulatedTranscript.trim();
            const wordCount = fullText.split(/\s+/).length;
            if (fullText && wordCount >= 3 && !R.current.isLoading && !R.current.isAISpeaking) {
              R.current.accumulatedTranscript = '';
              onUserDoneSpeakingRef.current(fullText);
            }
          }, 1500);
        },

        onVADMisfire: () => {},
      });
      vadRef.current = vad;
      setVadReady(true);
      console.log('✅ VAD initialized successfully');
    } catch (err) {
      console.error('❌ VAD init failed:', err);
      vadInitializedRef.current = false;
    }
  }, []);

  const startVAD = useCallback(() => { try { vadRef.current?.start(); } catch (e) {} }, []);
  const pauseVAD = useCallback(() => { try { vadRef.current?.pause(); } catch (e) {} }, []);

  // ── Hardware AEC ──────────────────────────────────────────
  const aecStreamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
      .then(s => { aecStreamRef.current = s; })
      .catch(() => {});
    return () => { aecStreamRef.current?.getTracks().forEach(t => t.stop()); aecStreamRef.current = null; };
  }, []);

  useEffect(() => {
    initVAD();
    return () => { try { vadRef.current?.destroy(); } catch (e) {} vadRef.current = null; vadInitializedRef.current = false; };
  }, [initVAD]);

  // ============================================================
  // SPEECH RECOGNITION
  // ============================================================
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const getRecognition = useCallback((): SpeechRecognition | null => {
    if (recognitionRef.current) return recognitionRef.current;
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) return null;
    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new API();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (R.current.isAISpeaking) return;
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        if (event.results[i].isFinal) {
          if (confidence > 0.4 || confidence === 0) finalChunk += text;
        } else interim += text;
      }
      if (interim) setInterimTranscript(interim);
      if (finalChunk) {
        if (R.current.longSilenceTimer) { clearTimeout(R.current.longSilenceTimer); R.current.longSilenceTimer = null; }
        // Cancel any pending silence submit — more speech is coming
        if (R.current.silenceTimer) { clearTimeout(R.current.silenceTimer); R.current.silenceTimer = null; }
        R.current.lastFinalChunkTime = Date.now();
        R.current.accumulatedTranscript += (R.current.accumulatedTranscript ? ' ' : '') + finalChunk;
        setFinalTranscriptDisplay(R.current.accumulatedTranscript);
        setInterimTranscript('');
        // if (!vadRef.current) 
        {
          // No VAD — use silence timer to detect when candidate is done speaking
          R.current.silenceTimer = setTimeout(() => {
            const fullText = R.current.accumulatedTranscript.trim();
            if (fullText && fullText.split(/\s+/).length >= 3 && !R.current.isLoading && !R.current.isAISpeaking) {
              R.current.accumulatedTranscript = '';
              onUserDoneSpeakingRef.current(fullText);
            }
          }, 3000); // 3 seconds of silence before submitting answer
        }
      }
    };

    recognition.onerror = (event: any) => {
      const err = event.error || 'unknown';
      if (err === 'aborted') return;
      setIsListening(false); R.current.isListening = false;

      // ✅ FIX: Only restart if not already scheduled and conditions are right
      if (!R.current.isInterviewComplete && !R.current.isLoading && !R.current.isAISpeaking && !R.current.restartScheduled) {
        R.current.restartScheduled = true;
        setTimeout(() => {
          R.current.restartScheduled = false;
          if (!R.current.isLoading && !R.current.isAISpeaking && !R.current.isInterviewComplete) {
            doStartListeningRef.current();
          }
        }, err === 'no-speech' ? 500 : 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false); R.current.isListening = false;

      // Always restart quickly — never leave a gap where speech is lost
      // The silence timer (3s) handles answer submission independently
      if (!R.current.isInterviewComplete && !R.current.isLoading && !R.current.isAISpeaking && !R.current.restartScheduled) {
        R.current.restartScheduled = true;
        setTimeout(() => {
          R.current.restartScheduled = false;
          if (!R.current.isLoading && !R.current.isAISpeaking && !R.current.isInterviewComplete) {
            doStartListeningRef.current();
          }
        }, 300); // Always 300ms — fast restart, no speech lost
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  const synthRef = useRef<SpeechSynthesis>(typeof window !== 'undefined' ? window.speechSynthesis : (null as any));

  // ============================================================
  // START / STOP LISTENING
  // ============================================================
  const startListening = useCallback(() => {
    const recognition = getRecognition();
    if (!recognition) return;
    if (R.current.isInterviewComplete || R.current.isLoading || R.current.isAISpeaking) return;

    // ✅ FIX: Clear the restart scheduled flag so future onend can schedule another restart
    R.current.restartScheduled = false;

    // ⚠️ DO NOT reset accumulatedTranscript here!
    // Chrome's speech recognition fires onend/restart frequently (network blips, pauses).
    // Resetting here would wipe everything the candidate said mid-sentence.
    // Transcript is only reset when:
    //   1. AI starts speaking (speakText clears it)
    //   2. Answer is submitted (handleCandidateAnswer clears it)

    try {
      recognition.start();
      setIsListening(true); R.current.isListening = true;

      // Long silence check-in — only if NO transcript accumulated at all
      if (R.current.longSilenceTimer) clearTimeout(R.current.longSilenceTimer);
      R.current.longSilenceTimer = setTimeout(() => {
        if (!R.current.isLoading && !R.current.isAISpeaking && !R.current.isInterviewComplete && !R.current.accumulatedTranscript.trim()) {
          const msgs = [
            "Are you still there? Take your time and answer whenever you're ready.",
            "I notice some silence. Can you hear me clearly? Please go ahead when you're ready.",
            "Just checking in — are you able to hear my question? No rush at all.",
            "Take your time. I'm still here whenever you're ready to answer.",
          ];
          doSpeakCheckInRef.current(msgs[Math.floor(Math.random() * msgs.length)]);
        }
      }, 25000);
    } catch (e: any) {
      if (e.message?.includes('already started')) { setIsListening(true); R.current.isListening = true; return; }
      // ✅ FIX: Only schedule restart if not already scheduled
      if (!R.current.restartScheduled) {
        R.current.restartScheduled = true;
        setTimeout(() => {
          R.current.restartScheduled = false;
          if (!R.current.isListening && !R.current.isAISpeaking && !R.current.isInterviewComplete) {
            startListening();
          }
        }, 1000);
      }
    }
  }, [getRecognition, startVAD]);

  const stopListening = useCallback(() => {
    if (R.current.longSilenceTimer) { clearTimeout(R.current.longSilenceTimer); R.current.longSilenceTimer = null; }
    if (R.current.silenceTimer) { clearTimeout(R.current.silenceTimer); R.current.silenceTimer = null; }
    // ✅ FIX: Cancel any pending restart when explicitly stopping
    R.current.restartScheduled = true; // Block auto-restart while we deliberately stop
    try { recognitionRef.current?.stop(); } catch (e) {}
    setIsListening(false); R.current.isListening = false; R.current.isSpeaking = false;
    setInterimTranscript(''); pauseVAD();
    // Allow future restarts after a brief window
    setTimeout(() => { R.current.restartScheduled = false; }, 300);
  }, [pauseVAD]);

  // ============================================================
  // SPEAK TEXT
  // ============================================================
  const speakText = useCallback((text: string) => {
    R.current.aiSpokenText = text;
    if (R.current.silenceTimer) { clearTimeout(R.current.silenceTimer); R.current.silenceTimer = null; }
    // Reset transcript when AI speaks — clean slate for next candidate answer
    R.current.accumulatedTranscript = ''; setInterimTranscript(''); setFinalTranscriptDisplay('');
    if (!synthRef.current || R.current.isMuted) {
      R.current.aiSpokenText = '';
      if (!R.current.isInterviewComplete) setTimeout(() => startListening(), 200);
      return;
    }
    stopListening();
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; utterance.pitch = 1; utterance.volume = 1;
    utterance.onstart = () => { setIsAISpeaking(true); R.current.isAISpeaking = true; startVAD(); };
    utterance.onend = () => {
      setIsAISpeaking(false); R.current.isAISpeaking = false; R.current.aiSpokenText = ''; pauseVAD();
      if (!R.current.isInterviewComplete) setTimeout(() => { if (!R.current.isInterviewComplete && !R.current.isLoading) startListening(); }, 600);
    };
    utterance.onerror = () => {
      setIsAISpeaking(false); R.current.isAISpeaking = false; R.current.aiSpokenText = ''; pauseVAD();
      if (!R.current.isInterviewComplete) setTimeout(() => startListening(), 600);
    };
    synthRef.current.speak(utterance);
  }, [startListening, stopListening, startVAD, pauseVAD]);

  const skipAISpeech = useCallback(() => {
    synthRef.current?.cancel();
    setIsAISpeaking(false); R.current.isAISpeaking = false; R.current.aiSpokenText = ''; pauseVAD();
    if (!R.current.isInterviewComplete) setTimeout(() => startListening(), 200);
  }, [startListening, pauseVAD]);

  useEffect(() => { doStartListeningRef.current = startListening; }, [startListening]);
  useEffect(() => { doSpeakCheckInRef.current = (msg: string) => { addToConversation('ai', msg); speakText(msg); }; }, [speakText]);

  const addToConversation = useCallback((role: 'ai' | 'candidate', message: string) => {
    setConversation(prev => [...prev, { role, message, timestamp: new Date().toLocaleTimeString() }]);
  }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleEndInterview = useCallback(async () => {
    const currentId = R.current.interviewId;
    if (!currentId) return;
    synthRef.current?.cancel(); pauseVAD();
    try { recognitionRef.current?.abort(); } catch (e) {}
    if (R.current.longSilenceTimer) { clearTimeout(R.current.longSilenceTimer); R.current.longSilenceTimer = null; }
    if (R.current.silenceTimer) { clearTimeout(R.current.silenceTimer); R.current.silenceTimer = null; }
    setIsInterviewComplete(true); R.current.isInterviewComplete = true;
    try { await interviewService.endInterview(currentId); } catch (e) {}
    navigate('/interview/complete');
  }, [navigate, pauseVAD]);

  const handleCandidateAnswer = useCallback(async (answer: string) => {
    if (!answer.trim() || !R.current.interviewId || R.current.isLoading) return;
    const currentInterviewId = R.current.interviewId;
    stopListening(); setIsLoading(true); R.current.isLoading = true;
    setError(null); setInterimTranscript(''); setFinalTranscriptDisplay('');
    try {
      addToConversation('candidate', answer);
      const response: SendMessageResponse = await interviewService.sendMessage(currentInterviewId, answer);
      addToConversation('ai', response.message);
      setCurrentQuestion(response.message); setQuestionNumber(response.question_number);
      setIsLoading(false); R.current.isLoading = false;
      if (response.is_complete) {
        setIsInterviewComplete(true); R.current.isInterviewComplete = true;
        speakText(response.message);
        setTimeout(() => handleEndInterview(), 8000);
      } else speakText(response.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send answer';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('500');
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

  useEffect(() => {
    return () => {
      if (sharedStream) { sharedStream.getTracks().forEach(t => t.stop()); sharedStream = null; }
      aecStreamRef.current?.getTracks().forEach(t => t.stop()); aecStreamRef.current = null;
      synthRef.current?.cancel();
      try { recognitionRef.current?.abort(); } catch (e) {}
      if (R.current.silenceTimer) clearTimeout(R.current.silenceTimer);
      if (R.current.longSilenceTimer) clearTimeout(R.current.longSilenceTimer);
      try { vadRef.current?.destroy(); } catch (e) {} vadRef.current = null;
    };
  }, []);

  useEffect(() => { if (!getRecognition()) setError('Speech Recognition not supported. Use Chrome or Edge.'); }, [getRecognition]);

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
        if (!resp.ok) { setError(resp.status === 404 ? 'Interview not found.' : 'Failed to load interview.'); setIsLoading(false); return; }
        const data = await resp.json();
        setInterviewId(data.id); R.current.interviewId = data.id;
        if (isMobileDevice()) { setNeedsUserGesture(true); setIsLoading(false); return; }
        const ac = new AbortController(); startAbortRef.current = ac;
        setTimeout(() => { if (!ac.signal.aborted) doStartInterview(data.id, ac.signal); }, 500);
      } catch (err) { setError('Failed to connect.'); setIsLoading(false); }
    };
    resolveUUID();
    // ⚠️ Don't reset hasStartedRef on cleanup — prevents StrictMode double-start
    return () => { startAbortRef.current?.abort(); };
  }, [uuid]);

  const doStartInterview = async (intId: number, signal?: AbortSignal) => {
    if (signal?.aborted) return;
    setIsLoading(true); R.current.isLoading = true; setError(null); setNeedsUserGesture(false);
    try {
      const res: StartInterviewResponse = await interviewService.startInterview(intId);
      if (signal?.aborted) return;
      setIsInterviewStarted(true); setCurrentQuestion(res.message);
      setQuestionNumber(res.question_number); setTotalQuestions(res.total_questions);
      addToConversation('ai', res.message); setIsLoading(false); R.current.isLoading = false;
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
      const video = videoRef.current;
      if (!video || !video.videoWidth) { setIsCapturing(false); return; }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
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

        fd.append('metadata', JSON.stringify({
          face_count: maxFaces,
          multiple_faces: wasMultipleFaces,
          phone_detected: wasPhoneDetected,
          looking_away: wasLookingAway,
        }));

        const isFlagged = wasMultipleFaces || wasPhoneDetected || wasLookingAway;
        if (isFlagged) fd.append('is_flagged', 'true');

        recentPhoneRef.current = false;
        recentLookingAwayRef.current = false;
        recentMultipleFacesRef.current = false;
        recentMaxFaceCountRef.current = 0;

        const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
        const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/interview-screenshots/upload/`, {
          method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {}, body: fd,
        });
        if (resp.ok) { setScreenshotCount(p => p + 1); screenshotFailCount.current = 0; }
        else if (resp.status === 401) screenshotFailCount.current++;
      }
    } catch (e) {} finally { setIsCapturing(false); }
  }, [isCapturing, faceCount, multipleFacesDetected, phoneDetected, lookingAway]);

  const captureScreenshotRef = useRef(captureScreenshot);
  useEffect(() => { captureScreenshotRef.current = captureScreenshot; }, [captureScreenshot]);

  const toggleMute = () => {
    const m = !isMuted; setIsMuted(m); R.current.isMuted = m;
    if (m) { synthRef.current?.cancel(); setIsAISpeaking(false); R.current.isAISpeaking = false; pauseVAD(); }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const liveText = finalTranscriptDisplay + (interimTranscript ? (finalTranscriptDisplay ? ' ' : '') + interimTranscript : '');

  const getStatus = () => {
    if (isAISpeaking) return { color: 'bg-blue-500', text: 'AI Speaking', textColor: 'text-blue-400', hint: 'Speak to interrupt' };
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

      <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-xs sm:text-sm hidden sm:inline">AI Interview</span>
          <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full ${
            isAISpeaking ? 'bg-blue-500/15' : isListening ? 'bg-green-500/15' : isLoading ? 'bg-amber-500/15' : 'bg-white/5'
          }`}>
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

            <div className="relative bg-[#12121a] rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 min-h-[140px] sm:min-h-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-16 h-16 sm:w-28 sm:h-28 mx-auto mb-2 sm:mb-4">
                    {isAISpeaking && (
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

            <div className="relative bg-[#12121a] rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 min-h-[140px] sm:min-h-0">
              {isVideoOn ? (
                <>
                  <video ref={setVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <canvas
                    ref={detectionCanvasRef as React.RefObject<HTMLCanvasElement>}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ zIndex: 5 }}
                  />
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
                  <span className="text-blue-400 text-[9px] sm:text-[10px] font-medium">🔇 Mic paused • Speak to interrupt</span>
                </div>
              )}
            </div>
          </div>

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
              {liveText ? (
                <p className="text-xs sm:text-sm leading-relaxed">
                  <span className="text-white">{finalTranscriptDisplay}</span>
                  {interimTranscript && <span className="text-green-400/60 italic"> {interimTranscript}</span>}
                  {interimTranscript && <span className="inline-block w-0.5 h-3 sm:h-4 bg-violet-400 ml-0.5 animate-pulse align-middle" />}
                </p>
              ) : isAISpeaking ? (
                <p className="text-xs sm:text-sm text-violet-300/80 leading-relaxed line-clamp-3">{currentQuestion}</p>
              ) : isLoading ? (
                <div className="flex items-center gap-2 text-amber-400/60">
                  <div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />)}</div>
                  <span className="text-[10px] sm:text-xs">AI is thinking...</span>
                </div>
              ) : (
                <p className="text-neutral-600 text-xs sm:text-sm italic">{currentQuestion ? 'Speak to respond...' : 'Waiting for interview to begin...'}</p>
              )}
            </div>
          </div>
        </div>

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
                  <div className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    entry.role === 'ai' ? 'bg-violet-500/10 text-violet-200 rounded-tl-sm' : 'bg-green-500/10 text-green-200 rounded-tr-sm'
                  }`}>{entry.message}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>

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
        <button onClick={handleEndInterview}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors">
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">End Interview</span>
          <span className="sm:hidden">End</span>
        </button>
      </div>
    </div>
  );
};