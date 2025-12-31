import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { Clock, CheckCircle } from 'lucide-react';

export const WaitingRoom = () => {
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-primary-600" />
          </div>

          <h1 className="text-3xl font-bold text-secondary mb-4">Waiting Room</h1>
          <p className="text-neutral-600 mb-8">
            Your interview will begin in
          </p>

          <div className="text-6xl font-bold text-primary-600 mb-8">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>

          <div className="bg-neutral-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-secondary mb-4">Last Minute Reminders</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-neutral-700">
                  Stay calm and be yourself. The AI interviewer is here to understand your skills and experience.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-neutral-700">
                  Speak clearly and take your time to think before answering.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-neutral-700">
                  The interview will be recorded for evaluation purposes.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-neutral-700">
                  You can leave and rejoin if you experience technical difficulties.
                </p>
              </div>
            </div>
          </div>

          <Link to="/interview-room">
            <Button
              variant="primary"
              className="w-full"
              disabled={timeLeft > 0}
            >
              {timeLeft > 0 ? 'Please Wait...' : 'Join Interview'}
            </Button>
          </Link>

          <p className="text-sm text-neutral-500 mt-6">
            Having technical issues? <a href="#" className="text-primary-600 hover:underline">Contact Support</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
