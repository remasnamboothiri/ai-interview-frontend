import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { Clock, CheckCircle } from 'lucide-react';

export const WaitingRoom = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(10); //change to 120
  const [statusChecked, setStatusChecked] = useState(false);

  // ✅ Check interview status — redirect if already completed
  useEffect(() => {
    if (!uuid) return;
    const checkStatus = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const resp = await fetch(`${baseUrl}/api/interviews/by-uuid/${uuid}/`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.status === 'completed') {
            navigate('/interview/already-completed', { replace: true });
            return;
          }
        }
      } catch (e) {}
      setStatusChecked(true);
    };
    checkStatus();
  }, [uuid, navigate]);

  useEffect(() => {
    if (!statusChecked || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, statusChecked]);

  if (!statusChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

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
          <p className="text-neutral-600 mb-8">Your interview will begin in</p>
          <div className="text-6xl font-bold text-primary-600 mb-8">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="bg-neutral-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-secondary mb-4">Last Minute Reminders</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-neutral-700">Stay calm and be yourself.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-neutral-700">Speak clearly and take your time.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-neutral-700">The interview will be recorded for evaluation.</p>
              </div>
            </div>
          </div>
          <Link to={`/interview-room/${uuid}`}>
            <Button variant="primary" className="w-full" disabled={timeLeft > 0}>
              {timeLeft > 0 ? 'Please Wait...' : 'Join Interview'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};