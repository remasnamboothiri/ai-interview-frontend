import { useState, useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import {
  Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff,
  Settings, MoreVertical, Monitor, Volume2, Clock, Bot
} from 'lucide-react';

export const InterviewRoomPage = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const mockTranscript = [
    { speaker: 'AI Interviewer', text: 'Welcome! Let\'s start with a brief introduction. Can you tell me about yourself?', time: '00:15' },
    { speaker: 'Candidate', text: 'Sure! I\'m a software engineer with 5 years of experience...', time: '00:32' },
    { speaker: 'AI Interviewer', text: 'That\'s great! Now, can you explain how you would approach designing a scalable system?', time: '01:45' },
    { speaker: 'Candidate', text: 'I would start by identifying the key components...', time: '02:10' },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col">
      <div className="bg-neutral-800 px-6 py-3 flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary-400" />
            <h1 className="text-white font-semibold">AI Interview - Senior Software Engineer</h1>
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
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="relative bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">AI Interviewer</h3>
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Speaking...</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-neutral-900/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                <span className="text-white text-sm font-medium">AI Interviewer</span>
              </div>
            </div>

            <div className="relative bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary-500">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                {isVideoOn ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-4xl text-white font-bold">JD</span>
                    </div>
                    <h3 className="text-white text-xl font-semibold">You</h3>
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 text-neutral-500 mb-4 mx-auto" />
                    <p className="text-neutral-400">Camera Off</p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 bg-neutral-900/80 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-2">
                <span className="text-white text-sm font-medium">You</span>
                {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
              </div>
            </div>
          </div>

          <Card className="bg-neutral-800 border-neutral-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Current Question ({currentQuestion}/10)</h3>
                <span className="text-xs text-neutral-400">Auto-transcription enabled</span>
              </div>
              <p className="text-neutral-300 text-lg leading-relaxed mb-4">
                "Can you describe a challenging technical problem you've solved recently and walk me through your approach?"
              </p>
              <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(currentQuestion / 10) * 100}%` }} />
              </div>
            </div>
          </Card>

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

            <Button variant="secondary" className="w-14 h-14 rounded-full">
              <Monitor className="w-6 h-6" />
            </Button>

            <Button variant="secondary" className="w-14 h-14 rounded-full">
              <Settings className="w-6 h-6" />
            </Button>

            <Button variant="secondary" className="w-14 h-14 rounded-full">
              <MoreVertical className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {showChat && (
          <div className="w-96 bg-neutral-800 border-l border-neutral-700 flex flex-col">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="text-white font-semibold">Live Transcript</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockTranscript.map((entry, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono">{entry.time}</span>
                    <span className="text-xs font-semibold text-primary-400">{entry.speaker}</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-700">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full bg-neutral-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
