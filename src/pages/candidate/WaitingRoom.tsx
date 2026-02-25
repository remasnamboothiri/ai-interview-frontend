import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const WaitingRoom = () => {
  const { id } = useParams<{ id: string }>();
  const [timeLeft, setTimeLeft] = useState(10);

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
            Your interview will begin shortly. Please read the reminders below carefully.
          </p>

          {timeLeft > 0 && (
            <div className="text-6xl font-bold text-primary-600 mb-8">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
          )}

          {/* ✅ IMPORTANT WARNING BOX */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-800 mb-1">Important — Read Before Joining</p>
                <p className="text-sm text-red-700">
                  This is a <strong>one-time interview link</strong>. Once you start, 
                  you must complete the interview in one session. 
                  If you close the browser or lose connection, 
                  <strong> the link will not work again.</strong> Contact your 
                  recruiter immediately if any issue occurs.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-secondary mb-4">Last Minute Reminders</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-neutral-700">
                  Stay calm and be yourself. The AI interviewer is here to understand your skills and experience.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-neutral-700">
                  Speak clearly and take your time to think before answering.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-neutral-700">
                  The interview will be recorded for evaluation purposes.
                </p>
              </div>
              <div className="flex items-start gap-3">
                {/* ✅ FIXED: Removed wrong "you can rejoin" message */}
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-neutral-700">
                  Ensure your internet connection is stable throughout the entire interview.
                  Do not close or refresh this browser tab.
                </p>
              </div>
            </div>
          </div>

          <Link to={`/interview-room/${id}`}>
            <Button
              variant="primary"
              className="w-full"
              disabled={timeLeft > 0}
            >
              {timeLeft > 0 ? `Starting in ${seconds}s...` : 'Join Interview Now →'}
            </Button>
          </Link>

          <p className="text-sm text-neutral-500 mt-6">
            Having technical issues? Contact your recruiter directly via email immediately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};