import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Bot, Volume2, VolumeX, MessageSquare
} from 'lucide-react';
import { interviewService } from '@/services/interviewService';
import type { StartInterviewResponse, SendMessageResponse } from '@/services/interviewService';

// Speech Recognition types
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

export const InterviewRoomPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Interview state
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Voice state
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Conversation history
  const [conversation, setConversation] = useState<Array<{
    role: 'ai' | 'candidate';
    message: string;
    timestamp: string;
  }>>([]);

  // UI state
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isInterviewStarted || isInterviewComplete) return;
    
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterviewStarted, isInterviewComplete]);

  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error('Failed to access webcam:', error);
      }
    };
    
    initWebcam();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Screenshot capture every 10 seconds
  useEffect(() => {
    if (!isInterviewStarted || isInterviewComplete) return;
    
    const captureInterval = setInterval(() => {
      captureAndUploadScreenshot();
    }, 10000);
    
    return () => clearInterval(captureInterval);
  }, [isInterviewStarted, isInterviewComplete, screenshotCount]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
        
        if (final) {
          setTranscript(final);
          setInterimTranscript('');
          handleCandidateAnswer(final);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    } else {
      console.warn('Speech Recognition not supported in this browser');
    }

    // Initialize Speech Synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Start interview on mount
  useEffect(() => {
    if (id) {
      const interviewIdNum = parseInt(id, 10);
      setInterviewId(interviewIdNum);
      startInterview(interviewIdNum);
    }
  }, [id]);

  // Start interview
  const startInterview = async (interviewId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: StartInterviewResponse = await interviewService.startInterview(interviewId);
      
      setIsInterviewStarted(true);
      setCurrentQuestion(response.message);
      setQuestionNumber(response.question_number);
      setTotalQuestions(response.total_questions);
      
      // Add to conversation
      addToConversation('ai', response.message);
      
      // AI speaks the greeting
      speakText(response.message);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      console.error('Start interview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // AI speaks text
  const speakText = (text: string) => {
    if (!synthRef.current || isMuted) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsAISpeaking(true);
    };

    utterance.onend = () => {
      setIsAISpeaking(false);
      // After AI finishes speaking, start listening
      if (!isInterviewComplete) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  // Start listening to candidate
  const startListening = () => {
    if (!recognitionRef.current || isListening || isAISpeaking) return;

    try {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  // Handle candidate answer
  const handleCandidateAnswer = async (answer: string) => {
    if (!answer.trim() || !interviewId || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    stopListening();
    
    try {
      // Add candidate answer to conversation
      addToConversation('candidate', answer);
      
      const response: SendMessageResponse = await interviewService.sendMessage(
        interviewId,
        answer
      );
      
      // Add AI response to conversation
      addToConversation('ai', response.message);
      
      setCurrentQuestion(response.message);
      setQuestionNumber(response.question_number);
      
      if (response.is_complete) {
        // Interview completed
        setIsInterviewComplete(true);
        speakText(response.message);
        setTimeout(() => {
          handleEndInterview();
        }, 5000);
      } else {
        // AI speaks next question
        speakText(response.message);
      }
      
      setTranscript('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send answer');
      console.error('Send answer error:', err);
      // Restart listening on error
      setTimeout(() => {
        if (!isInterviewComplete) {
          startListening();
        }
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // End interview
  const handleEndInterview = async () => {
    if (!interviewId) return;
    
    // Stop all speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    try {
      await interviewService.endInterview(interviewId);
      navigate('/interview/complete');
    } catch (err) {
      console.error('End interview error:', err);
      navigate('/interview/complete');
    }
  };

  // Add message to conversation
  const addToConversation = (role: 'ai' | 'candidate', message: string) => {
    setConversation(prev => [...prev, {
      role,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && synthRef.current) {
      synthRef.current.cancel();
      setIsAISpeaking(false);
    }
  };

  // Screenshot functions
  const captureAndUploadScreenshot = useCallback(async () => {
    if (isCapturing || !interviewId) return;
    
    setIsCapturing(true);
    
    try {
      const webcamBlob = await captureWebcamPhoto();
      if (webcamBlob) {
        await uploadScreenshot(webcamBlob);
        setScreenshotCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, interviewId, screenshotCount]);

  const captureWebcamPhoto = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      
      if (!video || !video.videoWidth) {
        resolve(null);
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    });
  };

  const uploadScreenshot = async (webcamBlob: Blob) => {
    if (!interviewId) return;
    
    try {
      const formData = new FormData();
      formData.append('webcam_image', webcamBlob, `webcam_${Date.now()}.jpg`);
      formData.append('interview', interviewId.toString());
      formData.append('screenshot_number', (screenshotCount + 1).toString());
      
      await fetch('http://localhost:8000/api/interview-screenshots/upload/', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading && !isInterviewStarted) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-primary-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-xl">Starting voice interview...</p>
          <p className="text-neutral-400 text-sm mt-2">Please allow microphone access</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isInterviewStarted) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <Card className="bg-neutral-800 border-red-500 p-8 max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-4">Error</h2>
          <p className="text-white mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col">
      {/* Hidden video for webcam */}
      <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />

      {/* Header */}
      <div className="bg-neutral-800 px-6 py-3 flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary-400" />
            <h1 className="text-white font-semibold">AI Voice Interview</h1>
          </div>
          <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">Recording</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-neutral-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* AI Interviewer */}
            <div className="relative bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-300 ${isAISpeaking ? 'scale-110 shadow-lg shadow-primary-500/50 animate-pulse' : ''}`}>
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">AI Interviewer</h3>
                  <div className="flex items-center justify-center gap-2">
                    {isAISpeaking ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-semibold">Speaking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Volume2 className="w-4 h-4" />
                        <span className="text-sm">Listening</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Video */}
            <div className="relative bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary-500">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                {isVideoOn ? (
                  <div className="text-center">
                    <div className={`w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-300 ${isListening ? 'scale-110 shadow-lg shadow-green-500/50 animate-pulse' : ''}`}>
                      <span className="text-4xl text-white font-bold">YOU</span>
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">Candidate</h3>
                    <div className="flex items-center justify-center gap-2">
                      {isListening ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <Mic className="w-4 h-4 animate-pulse" />
                          <span className="text-sm font-semibold">Listening...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Mic className="w-4 h-4" />
                          <span className="text-sm">Waiting</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 text-neutral-500 mb-4 mx-auto" />
                    <p className="text-neutral-400">Camera Off</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Question Card */}
          <Card className="bg-neutral-800 border-neutral-700 mb-4">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">
                  Question {questionNumber}/{totalQuestions}
                </h3>
                {isInterviewComplete && (
                  <span className="text-green-400 text-sm font-semibold">Interview Complete!</span>
                )}
              </div>
              <p className="text-neutral-300 text-lg leading-relaxed mb-4">
                {currentQuestion}
              </p>
              
              {/* Live Transcript */}
              {(isListening || interimTranscript) && (
                <div className="mt-4 p-3 bg-neutral-700/50 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-green-400 animate-pulse" />
                    <span className="text-green-400 text-sm font-semibold">You're speaking...</span>
                  </div>
                  <p className="text-neutral-300 text-sm italic">
                    {interimTranscript || 'Listening...'}
                  </p>
                </div>
              )}
              
              <div className="h-1 bg-neutral-700 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-300" 
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} 
                />
              </div>
            </div>
          </Card>

          {/* Voice Status Card */}
          <Card className="bg-neutral-800 border-neutral-700 mb-4">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {isAISpeaking ? (
                      <>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-blue-400 text-sm font-semibold">AI is speaking...</span>
                      </>
                    ) : isListening ? (
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm font-semibold">Listening to you...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-neutral-500 rounded-full" />
                        <span className="text-neutral-400 text-sm">Waiting...</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-neutral-400 text-xs">
                  Voice-based interview • Speak naturally
                </div>
              </div>
            </div>
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isMuted ? 'danger' : 'secondary'}
              className="w-14 h-14 rounded-full"
              onClick={toggleMute}
              title={isMuted ? 'Unmute AI' : 'Mute AI'}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>

            <Button
              variant={isVideoOn ? 'secondary' : 'danger'}
              className="w-14 h-14 rounded-full"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>

            <Button
              variant="danger"
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
              onClick={handleEndInterview}
              title="End Interview"
            >
              <PhoneOff className="w-7 h-7" />
            </Button>

            <Button
              variant="secondary"
              className="w-14 h-14 rounded-full"
              onClick={() => setShowChat(!showChat)}
              title="Show Conversation"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-96 bg-neutral-800 border-l border-neutral-700 flex flex-col">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="text-white font-semibold">Conversation History</h3>
              <p className="text-neutral-400 text-xs mt-1">Full transcript of your interview</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.map((entry, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono">{entry.timestamp}</span>
                    <span className={`text-xs font-semibold ${
                      entry.role === 'ai' ? 'text-primary-400' : 'text-green-400'
                    }`}>
                      {entry.role === 'ai' ? 'AI Interviewer' : 'You'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-700/30 p-3 rounded-lg">
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
