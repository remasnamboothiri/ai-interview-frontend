import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { Shield, RefreshCw } from 'lucide-react';

export const OTPVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-3">
            Enter Verification Code
          </h1>
          <p className="text-neutral-600 mb-8">
            We've sent a 6-digit code to your phone<br />
            <span className="font-semibold">+1 (555) ***-**89</span>
          </p>
          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-semibold border-2 border-neutral-300 rounded-lg focus:border-primary-600 focus:outline-none transition-colors"
              />
            ))}
          </div>
          <Button variant="primary" className="w-full mb-4">
            Verify Code
          </Button>
          <div className="text-sm text-neutral-600">
            {countdown > 0 ? (
              <p>Resend code in {countdown}s</p>
            ) : (
              <button
                onClick={handleResend}
                className="text-primary-600 font-medium hover:underline flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Resend Code
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
