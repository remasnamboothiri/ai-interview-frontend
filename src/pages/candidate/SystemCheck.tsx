import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { CheckCircle, XCircle, Video, Mic, Wifi, Monitor } from 'lucide-react';

export const SystemCheck = () => {
  const [checks, setChecks] = useState({
    camera: 'checking',
    microphone: 'checking',
    internet: 'checking',
    browser: 'checking',
  });

  useEffect(() => {
    setTimeout(() => {
      setChecks({
        camera: 'success',
        microphone: 'success',
        internet: 'success',
        browser: 'success',
      });
    }, 2000);
  }, []);

  const checkItems = [
    { key: 'camera', label: 'Camera', icon: Video },
    { key: 'microphone', label: 'Microphone', icon: Mic },
    { key: 'internet', label: 'Internet Connection', icon: Wifi },
    { key: 'browser', label: 'Browser Compatibility', icon: Monitor },
  ];

  const allChecked = Object.values(checks).every((status) => status === 'success');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold text-secondary mb-2 text-center">System Check</h1>
          <p className="text-neutral-600 mb-8 text-center">
            Let's make sure everything is working properly before your interview
          </p>

          <div className="space-y-4 mb-8">
            {checkItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-6 h-6 text-primary-600" />
                  <span className="font-medium text-secondary">{item.label}</span>
                </div>
                <div>
                  {checks[item.key as keyof typeof checks] === 'checking' && (
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {checks[item.key as keyof typeof checks] === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {checks[item.key as keyof typeof checks] === 'error' && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {allChecked && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-900">All Systems Ready!</h3>
              </div>
              <p className="text-sm text-green-700">
                Your device and connection are ready for the interview.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Link to="/interview/waiting-room" className="flex-1">
              <Button variant="primary" className="w-full" disabled={!allChecked}>
                Continue to Waiting Room
              </Button>
            </Link>
            <Button variant="outline" className="flex-1">
              Run Check Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
