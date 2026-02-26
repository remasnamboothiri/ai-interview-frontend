import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import {
  Video, VideoOff, PhoneOff, Clock, Bot, Volume2, VolumeX,
  MessageSquare, SkipForward, AlertCircle, X
} from 'lucide-react';
import { useMicVAD, utils } from '@ricky0123/vad-react';
import { interviewService } from '@/services/interviewService';
import type { StartInterviewResponse, SendMessageResponse } from '@/services/interviewService';

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

// ── Shared webcam ────────────────────────────────────────────
let sharedStream: MediaStream | null = null;
let streamPromise: Promise<MediaStream | null> | null = null;

async function getSharedWebcamStream(): Promise<MediaStream | null> {
  if (sharedStream?.active) return sharedStream;
  if (streamPromise) return streamPromise;
  streamPromise = navigator.mediaDevices
    .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
    .then((s) => { sharedStream = s; streamPromise = null; return s; })
    .catch((e) => { console.error('Webcam:', e); streamPromise = null; return null; });
  return streamPromise;
}

// ============================================================
// COMPONENT
// ============================================================
export const InterviewRoomPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────
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
    role: 'ai' | 'candidate';
    message: string;
    timestamp: string;
  }>>([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // ── Refs ──────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis>(
    typeof window !== 'undefined' ? window.speechSynthesis : (null as any)
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // ── Mutable refs (stale closure fix) ──────────────────────
  const R = useRef({
    isAISpeaking: false,
    isListening: false,
    isInterviewComplete: false,
    isLoading: false,
    isMuted: false,
    interviewId: null as number | null,
    screenshotCount: 0,
    accumulatedTranscript: '',
    silenceTimer: null as ReturnType<typeof setTimeout> | null,
    // ✅ VAD: tracks if VAD detected speech start
    vadSpeechActive: false,
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

  // ============================================================
  // ✅ VAD — Voice Activity Detection
  // This is the KEY improvement over the old volume monitor.
  // VAD uses AI to detect REAL human speech, not just any sound.
  // So it ignores the AI's voice from speakers automatically!
  // ============================================================
  const vad = useMicVAD({
    // Only start VAD when AI is speaking (for interrupt detection)
    // VAD will be paused when candidate should be speaking normally
    // because we use Speech Recognition for that
    startOnLoad: false,

    // ✅ Called when VAD detects candidate STARTED speaking
    onSpeechStart: () => {
      // Only care if AI is currently speaking
      if (!R.current.isAISpeaking) return;
      if (R.current.isInterviewComplete) return;

      console.log('🎤 VAD: Candidate started speaking — interrupting AI');

      // Stop AI speech immediately
      if (synthRef.current) synthRef.current.cancel();
      setIsAISpeaking(false);
      R.current.isAISpeaking = false;
      R.current.vadSpeechActive = true;
    },

    // ✅ Called when VAD detects candidate STOPPED speaking
    // audio contains the recorded speech as Float32Array
    onSpeechEnd: (audio: Float32Array) => {
      if (!R.current.vadSpeechActive) return;
      if (R.current.isInterviewComplete) return;

      R.current.vadSpeechActive = false;
      console.log('🎤 VAD: Candidate finished speaking, converting to text...');

      // Convert VAD audio to WAV and send to speech recognition
      // For now, just start normal listening to capture what they said
      setTimeout(() => {
        if (!R.current.isInterviewComplete && !R.current.isLoading) {
          doStartListeningRef.current();
        }
      }, 100);
    },

    // ✅ VAD settings
    positiveSpeechThreshold: 0.8,   // High = less false positives
    negativeSpeechThreshold: 0.6,   // When speech ends
                 
                
    
  });

  // ── Start/stop VAD based on AI speaking ───────────────────
  useEffect(() => {
    if (isAISpeaking) {
      // AI is speaking → start VAD to detect if candidate interrupts
      try { vad.start(); } catch (e) {}
    } else {
      // AI stopped → pause VAD (Speech Recognition handles listening)
      try { vad.pause(); } catch (e) {}
    }
  }, [isAISpeaking]);

  // ============================================================
  // SPEECH RECOGNITION — for capturing candidate's actual words
  // ============================================================
  const getRecognition = useCallback((): SpeechRecognition | null => {
    if (recognitionRef.current) return recognitionRef.current;
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) return null;

    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new API();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // ✅ If AI is speaking, ignore all speech recognition results
      // VAD handles interrupt detection during AI speech
      if (R.current.isAISpeaking) return;

      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += text;
        else interim += text;
      }

      if (interim) setInterimTranscript(interim);
      if (finalChunk) {
        R.current.accumulatedTranscript +=
          (R.current.accumulatedTranscript ? ' ' : '') + finalChunk;
        setFinalTranscriptDisplay(R.current.accumulatedTranscript);
        setInterimTranscript('');

        // Reset silence timer on each new word
        if (R.current.silenceTimer) clearTimeout(R.current.silenceTimer);
        R.current.silenceTimer = setTimeout(() => {
          const fullText = R.current.accumulatedTranscript.trim();
          if (fullText && !R.current.isLoading && !R.current.isAISpeaking) {
            R.current.accumulatedTranscript = '';
            onUserDoneSpeakingRef.current(fullText);
          }
        }, 1500); // 1.5 second silence = done speaking
      }
    };

    recognition.onerror = (event: any) => {
      const err = event.error || 'unknown';
      if (err === 'aborted') return;
      setIsListening(false);
      R.current.isListening = false;
      if (!R.current.isInterviewComplete && !R.current.isLoading && !R.current.isAISpeaking) {
        setTimeout(() => doStartListeningRef.current(), err === 'no-speech' ? 300 : 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      R.current.isListening = false;
      // Only restart if candidate should be speaking (not during AI speech)
      if (!R.current.isInterviewComplete && !R.current.isLoading && !R.current.isAISpeaking) {
        setTimeout(() => doStartListeningRef.current(), 300);
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  const startListening = useCallback(() => {
    const recognition = getRecognition();
    if (!recognition) return;
    // ✅ Never start mic during AI speech — VAD handles that
    if (R.current.isAISpeaking || R.current.isInterviewComplete || R.current.isLoading) return;

    R.current.accumulatedTranscript = '';
    if (R.current.silenceTimer) {
      clearTimeout(R.current.silenceTimer);
      R.current.silenceTimer = null;
    }
    setInterimTranscript('');
    setFinalTranscriptDisplay('');

    try {
      recognition.start();
      setIsListening(true);
      R.current.isListening = true;
    } catch (e: any) {
      if (e.message?.includes('already started')) {
        setIsListening(true);
        R.current.isListening = true;
        return;
      }
      setTimeout(() => { if (!R.current.isListening) startListening(); }, 1000);
    }
  }, [getRecognition]);

  const stopListening = useCallback(() => {
    if (R.current.silenceTimer) {
      clearTimeout(R.current.silenceTimer);
      R.current.silenceTimer = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
    R.current.isListening = false;
    setInterimTranscript('');
  }, []);

  // ============================================================
  // SPEAK TEXT — AI speaks, mic is OFF, VAD watches for interrupt
  // ============================================================
  const speakText = useCallback((text: string) => {
    if (R.current.silenceTimer) {
      clearTimeout(R.current.silenceTimer);
      R.current.silenceTimer = null;
    }
    R.current.accumulatedTranscript = '';
    setInterimTranscript('');
    setFinalTranscriptDisplay('');

    // ✅ Stop mic BEFORE AI speaks
    stopListening();

    if (!synthRef.current || R.current.isMuted) {
      if (!R.current.isInterviewComplete) setTimeout(() => startListening(), 200);
      return;
    }

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsAISpeaking(true);
      R.current.isAISpeaking = true;
      // VAD automatically starts via useEffect watching isAISpeaking
    };

    utterance.onend = () => {
      setIsAISpeaking(false);
      R.current.isAISpeaking = false;
      // VAD automatically pauses via useEffect
      if (!R.current.isInterviewComplete) {
        // ✅ Wait 500ms for echo to die down then start listening
        setTimeout(() => {
          if (!R.current.isInterviewComplete && !R.current.isLoading) {
            startListening();
          }
        }, 500);
      }
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
      R.current.isAISpeaking = false;
      if (!R.current.isInterviewComplete) {
        setTimeout(() => startListening(), 500);
      }
    };

    synthRef.current.speak(utterance);
  }, [startListening, stopListening]);

  const skipAISpeech = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    setIsAISpeaking(false);
    R.current.isAISpeaking = false;
    if (!R.current.isInterviewComplete) {
      setTimeout(() => startListening(), 300);
    }
  }, [startListening]);

  useEffect(() => { doStartListeningRef.current = startListening; }, [startListening]);

  const addToConversation = useCallback((role: 'ai' | 'candidate', message: string) => {
    setConversation(prev => [
      ...prev,
      { role, message, timestamp: new Date().toLocaleTimeString() }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleEndInterview = useCallback(async () => {
    const currentId = R.current.interviewId;
    if (!currentId) return;
    synthRef.current?.cancel();
    try { recognitionRef.current?.abort(); } catch (e) {}
    try { vad.pause(); } catch (e) {}
    setIsInterviewComplete(true);
    R.current.isInterviewComplete = true;
    try { await interviewService.endInterview(currentId); } catch (e) {}
    navigate('/interview/complete');
  }, [navigate, vad]);

  const handleCandidateAnswer = useCallback(async (answer: string) => {
    if (!answer.trim() || !R.current.interviewId || R.current.isLoading) return;
    const currentInterviewId = R.current.interviewId;
    stopListening();
    setIsLoading(true);
    R.current.isLoading = true;
    setError(null);
    setInterimTranscript('');
    setFinalTranscriptDisplay('');

    try {
      addToConversation('candidate', answer);
      const response: SendMessageResponse = await interviewService.sendMessage(
        currentInterviewId, answer
      );
      addToConversation('ai', response.message);
      setCurrentQuestion(response.message);
      setQuestionNumber(response.question_number);
      setIsLoading(false);
      R.current.isLoading = false;

      if (response.is_complete) {
        setIsInterviewComplete(true);
        R.current.isInterviewComplete = true;
        speakText(response.message);
        setTimeout(() => handleEndInterview(), 6000);
      } else {
        speakText(response.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send answer';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('500');
      setError(
        isQuota
          ? 'AI service temporarily unavailable. Please wait and try again.'
          : msg
      );
      setIsLoading(false);
      R.current.isLoading = false;
      if (!isQuota) {
        setTimeout(() => {
          if (!R.current.isInterviewComplete) startListening();
        }, 500);
      }
    }
  }, [speakText, stopListening, startListening, addToConversation, handleEndInterview]);

  useEffect(() => {
    onUserDoneSpeakingRef.current = handleCandidateAnswer;
  }, [handleCandidateAnswer]);

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
    if (isVideoOn && videoRef.current && sharedStream?.active) {
      videoRef.current.srcObject = sharedStream;
    }
  }, [isVideoOn]);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    if (node && sharedStream?.active) {
      node.srcObject = sharedStream;
      node.play().catch(() => {});
    }
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (sharedStream) {
        sharedStream.getTracks().forEach((t) => t.stop());
        sharedStream = null;
      }
      synthRef.current?.cancel();
      try { recognitionRef.current?.abort(); } catch (e) {}
      try { vad.pause(); } catch (e) {}
      if (R.current.silenceTimer) clearTimeout(R.current.silenceTimer);
    };
  }, []);

  useEffect(() => {
    if (!getRecognition()) {
      setError('Speech Recognition not supported. Use Chrome or Edge.');
    }
  }, [getRecognition]);

  // ── Start interview ───────────────────────────────────────
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!id || hasStartedRef.current) return;
    hasStartedRef.current = true;
    const num = parseInt(id, 10);
    setInterviewId(num);
    R.current.interviewId = num;

    const abortController = new AbortController();
    const timer = setTimeout(() => {
      if (!abortController.signal.aborted) doStartInterview(num, abortController.signal);
    }, 500);

    return () => {
      clearTimeout(timer);
      abortController.abort();
      hasStartedRef.current = false;
    };
  }, [id]);

  const doStartInterview = async (intId: number, signal?: AbortSignal) => {
    if (signal?.aborted) return;
    setIsLoading(true);
    R.current.isLoading = true;
    setError(null);

    try {
      const res: StartInterviewResponse = await interviewService.startInterview(intId);
      if (signal?.aborted) return;
      setIsInterviewStarted(true);
      setCurrentQuestion(res.message);
      setQuestionNumber(res.question_number);
      setTotalQuestions(res.total_questions);
      addToConversation('ai', res.message);
      setIsLoading(false);
      R.current.isLoading = false;
      speakText(res.message);
    } catch (err) {
      if (signal?.aborted) return;
      const msg = err instanceof Error ? err.message : 'Failed to start interview';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('500');
      setError(isQuota ? 'AI service quota exceeded. Please wait and refresh.' : msg);
      setIsLoading(false);
      R.current.isLoading = false;
    }
  };

  // ── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isInterviewStarted || isInterviewComplete) return;
    const t = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [isInterviewStarted, isInterviewComplete]);

  // ── Screenshots ───────────────────────────────────────────
  const screenshotFailCount = useRef(0);
  useEffect(() => {
    if (!isInterviewStarted || isInterviewComplete) return;
    const iv = setInterval(() => captureScreenshot(), 10000);
    return () => clearInterval(iv);
  }, [isInterviewStarted, isInterviewComplete]);

  const captureScreenshot = useCallback(async () => {
    if (isCapturing || !R.current.interviewId || screenshotFailCount.current >= 3) return;
    setIsCapturing(true);
    try {
      const video = videoRef.current;
      if (!video || !video.videoWidth) { setIsCapturing(false); return; }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.8));
      if (blob && R.current.interviewId) {
        const fd = new FormData();
        fd.append('webcam_image', blob, `webcam_${Date.now()}.jpg`);
        fd.append('interview', R.current.interviewId.toString());
        fd.append('screenshot_number', (R.current.screenshotCount + 1).toString());
        const token =
          localStorage.getItem('access_token') || localStorage.getItem('token') || '';
        const resp = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/interview-screenshots/upload/`,
          {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          }
        );
        if (resp.ok) {
          setScreenshotCount((p) => p + 1);
          screenshotFailCount.current = 0;
        } else if (resp.status === 401) {
          screenshotFailCount.current++;
        }
      }
    } catch (e) {
      console.error('Screenshot:', e);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  const toggleMute = () => {
    const m = !isMuted;
    setIsMuted(m);
    R.current.isMuted = m;
    if (m) {
      synthRef.current?.cancel();
      setIsAISpeaking(false);
      R.current.isAISpeaking = false;
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const liveText =
    finalTranscriptDisplay +
    (interimTranscript
      ? (finalTranscriptDisplay ? ' ' : '') + interimTranscript
      : '');

  const getStatus = () => {
    if (isAISpeaking) return {
      color: 'bg-blue-500',
      text: 'AI Speaking',
      textColor: 'text-blue-400',
      hint: 'Speak to interrupt'
    };
    if (isListening) return {
      color: 'bg-green-500',
      text: 'Listening',
      textColor: 'text-green-400',
      hint: 'Pause 1.5s to submit'
    };
    if (isLoading) return {
      color: 'bg-amber-500',
      text: 'Processing',
      textColor: 'text-amber-400',
      hint: 'AI is thinking...'
    };
    return { color: 'bg-neutral-500', text: 'Ready', textColor: 'text-neutral-400', hint: '' };
  };
  const status = getStatus();

  // ── Loading screen ────────────────────────────────────────
  if (isLoading && !isInterviewStarted) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 animate-spin opacity-30" />
            <div className="absolute inset-2 rounded-full bg-[#0a0a0f] flex items-center justify-center">
              <Bot className="w-10 h-10 text-violet-400 animate-pulse" />
            </div>
          </div>
          <p className="text-white text-lg font-medium">Preparing your interview...</p>
          <p className="text-neutral-500 text-sm mt-2">Please allow microphone & camera access</p>
        </div>
      </div>
    );
  }

  if (error && !isInterviewStarted) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="bg-[#12121a] border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-red-400 text-lg font-semibold mb-2">Unable to Start</h2>
          <p className="text-neutral-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">AI Interview</span>
          <div className={`flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full ${
            isAISpeaking ? 'bg-blue-500/15' :
            isListening ? 'bg-green-500/15' :
            isLoading ? 'bg-amber-500/15' : 'bg-white/5'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status.color} ${
              status.text !== 'Ready' ? 'animate-pulse' : ''
            }`} />
            <span className={`text-xs font-medium ${status.textColor}`}>{status.text}</span>
          </div>
          {/* ✅ VAD indicator */}
          {isAISpeaking && vad.listening && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/15 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] text-purple-400">VAD Active</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {status.hint && (
            <span className="text-neutral-500 text-xs hidden sm:block">{status.hint}</span>
          )}
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && isInterviewStarted && (
        <div className="mx-5 mt-2 flex items-center gap-3 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 text-xs flex-1">{error}</span>
          <button
            onClick={() => { setError(null); startListening(); }}
            className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Retry
          </button>
          <button onClick={() => setError(null)}>
            <X className="w-3.5 h-3.5 text-red-400/60 hover:text-red-400" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4 gap-4 min-w-0">

          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">

            {/* AI Panel */}
            <div className="relative bg-[#12121a] rounded-2xl overflow-hidden border border-white/5">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    {isAISpeaking && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
                        <div className="absolute inset-2 rounded-full border border-violet-500/20 animate-ping"
                          style={{ animationDelay: '300ms' }} />
                      </>
                    )}
                    <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center transition-all duration-500 ${
                      isAISpeaking ? 'scale-105 shadow-xl shadow-violet-500/25' : ''
                    }`}>
                      <Bot className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-sm">AI Interviewer</h3>
                  {isAISpeaking ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-center gap-[3px] h-5">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} className="w-[3px] bg-violet-400 rounded-full animate-bounce"
                            style={{
                              height: `${12 + Math.random() * 8}px`,
                              animationDelay: `${i * 100}ms`,
                              animationDuration: '0.6s'
                            }} />
                        ))}
                      </div>
                      <button onClick={skipAISpeech}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-neutral-300 text-xs transition-colors">
                        <SkipForward className="w-3 h-3" /> Skip
                      </button>
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-xs mt-2">
                      {isListening ? 'Listening to you...' : isLoading ? 'Thinking...' : 'Ready'}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                <span className="text-white text-xs font-medium">AI Interviewer</span>
              </div>
            </div>

            {/* Candidate Panel */}
            <div className="relative bg-[#12121a] rounded-2xl overflow-hidden border border-white/5">
              {isVideoOn ? (
                <video ref={setVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#12121a] to-[#1a1a2e]">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <VideoOff className="w-8 h-8 text-neutral-600" />
                    </div>
                    <p className="text-neutral-500 text-xs">Camera off</p>
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                <span className="text-white text-xs font-medium">You</span>
              </div>
              <div className="absolute top-3 right-3">
                {isListening && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 backdrop-blur-sm rounded-lg">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-green-400">Listening</span>
                  </div>
                )}
                {isAISpeaking && vad.listening && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 backdrop-blur-sm rounded-lg">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-purple-400">VAD</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="h-32 bg-[#12121a] rounded-2xl border border-white/5 flex flex-col overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                {isListening && <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                {isAISpeaking && <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />}
                {isLoading && <div className="w-3 h-3 border-[1.5px] border-amber-400 border-t-transparent rounded-full animate-spin" />}
                <span className="text-neutral-400 text-xs font-medium uppercase tracking-wider">
                  {isListening ? 'Listening...' : isAISpeaking ? 'AI Speaking' : isLoading ? 'Processing...' : 'Transcript'}
                </span>
              </div>
              <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="flex-1 px-4 py-2.5 overflow-y-auto">
              {liveText ? (
                <p className="text-sm leading-relaxed">
                  <span className="text-white">{finalTranscriptDisplay}</span>
                  {interimTranscript && (
                    <span className="text-green-400/60 italic"> {interimTranscript}</span>
                  )}
                </p>
              ) : isAISpeaking ? (
                <p className="text-sm text-violet-300/80 leading-relaxed">{currentQuestion}</p>
              ) : isLoading ? (
                <div className="flex items-center gap-2 text-amber-400/60">
                  <div className="flex gap-1">
                    {[0, 200, 400].map(d => (
                      <div key={d} className="w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                  <span className="text-xs">AI is preparing the next question...</span>
                </div>
              ) : (
                <p className="text-neutral-600 text-sm italic">
                  {currentQuestion ? 'Speak to respond...' : 'Waiting for interview to begin...'}
                </p>
              )}
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-center gap-3 py-2 shrink-0">
            <button onClick={toggleMute} title={isMuted ? 'Unmute AI' : 'Mute AI'}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isMuted
                  ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
              }`}>
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                !isVideoOn
                  ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
              }`}>
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button onClick={handleEndInterview}
              className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all duration-200 shadow-lg shadow-red-600/20">
              <PhoneOff className="w-6 h-6" />
            </button>

            <button onClick={() => setShowChat(!showChat)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                showChat
                  ? 'bg-violet-500/15 text-violet-400 hover:bg-violet-500/25'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
              }`}>
              <MessageSquare className="w-5 h-5" />
            </button>

            {isAISpeaking && (
              <button onClick={skipAISpeech}
                className="w-12 h-12 rounded-2xl bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all duration-200">
                <SkipForward className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-[#12121a] border-l border-white/5 flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-white text-sm font-semibold">Transcript</span>
              <button onClick={() => setShowChat(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {conversation.map((entry, i) => (
                <div key={i} className={`flex flex-col gap-1 ${
                  entry.role === 'candidate' ? 'items-end' : 'items-start'
                }`}>
                  <span className="text-[10px] text-neutral-600 font-mono">{entry.timestamp}</span>
                  <div className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    entry.role === 'ai'
                      ? 'bg-violet-500/10 text-violet-200 rounded-tl-sm'
                      : 'bg-green-500/10 text-green-200 rounded-tr-sm'
                  }`}>
                    {entry.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};