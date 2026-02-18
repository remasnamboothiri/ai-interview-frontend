import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import {
  Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff,
  Settings, MoreVertical, Monitor, Volume2, Clock, Bot, Send
} from 'lucide-react';
import { interviewService } from '@/services/interviewService';
import type { StartInterviewResponse, SendMessageResponse } from '@/services/interviewService';

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
  const [aiMessage, setAiMessage] = useState('');
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Conversation history
  const [conversation, setConversation] = useState<Array<{
    role: 'ai' | 'candidate';
    message: string;
    timestamp: string;
  }>>([]);

  // Existing UI state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Screenshot capture refs
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
      setCurrentQuestion(response.current_question);
      setQuestionNumber(response.question_number);
      setTotalQuestions(response.total_questions);
      setAiMessage(response.message);
      
      // Add to conversation
      addToConversation('ai', response.message);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      console.error('Start interview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Send candidate answer
  const sendAnswer = async () => {
    if (!candidateAnswer.trim() || !interviewId || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add candidate answer to conversation
      addToConversation('candidate', candidateAnswer);
      
      const response: SendMessageResponse = await interviewService.sendMessage(
        interviewId,
        candidateAnswer
      );
      
      // Add AI response to conversation
      addToConversation('ai', response.message);
      
      setAiMessage(response.message);
      setQuestionNumber(response.question_number);
      
      if (response.is_complete) {
        // Interview completed
        setIsInterviewComplete(true);
        setTimeout(() => {
          handleEndInterview();
        }, 3000);
      } else {
        // More questions
        setCurrentQuestion(response.current_question || '');
      }
      
      // Clear input
      setCandidateAnswer('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send answer');
      console.error('Send answer error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // End interview
  const handleEndInterview = async () => {
    if (!interviewId) return;
    
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
          <p className="text-white text-xl">Starting interview...</p>
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
            <h1 className="text-white font-semibold">AI Interview</h1>
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
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">AI Interviewer</h3>
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Video */}
            <div className="relative bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary-500">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                {isVideoOn ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-4xl text-white font-bold">YOU</span>
                    </div>
                    <h3 className="text-white text-xl font-semibold">Candidate</h3>
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
                {currentQuestion || aiMessage}
              </p>
              <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-300" 
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} 
                />
              </div>
            </div>
          </Card>

          {/* Answer Input */}
          {!isInterviewComplete && (
            <Card className="bg-neutral-800 border-neutral-700">
              <div className="p-4">
                <label className="text-white text-sm font-semibold mb-2 block">
                  Your Answer:
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-1 bg-neutral-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendAnswer}
                    disabled={!candidateAnswer.trim() || isLoading}
                    className="self-end"
                  >
                    {isLoading ? 'Sending...' : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant={isMuted ? 'danger' : 'secondary'}
              className="w-14 h-14 rounded-full"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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
            >
              <PhoneOff className="w-7 h-7" />
            </Button>

            <Button
              variant="secondary"
              className="w-14 h-14 rounded-full"
              onClick={() => setShowChat(!showChat)}
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
                  <p className="text-sm text-neutral-300 leading-relaxed">{entry.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
