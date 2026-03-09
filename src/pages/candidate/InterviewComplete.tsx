import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { CheckCircle, Clock, Mail } from 'lucide-react';

export const InterviewComplete = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 to-neutral-100 p-4 flex items-center justify-center overflow-hidden">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-2">
            Interview Completed!
          </h1>
          <p className="text-sm text-neutral-600 mb-5">
            Thank you for completing your interview. Your responses have been recorded.
          </p>
          <div className="bg-neutral-50 rounded-lg p-4 mb-4 text-left">
            <h3 className="font-semibold text-secondary text-sm mb-3">What Happens Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-secondary text-sm">AI Analysis</p>
                  <p className="text-xs text-neutral-600">Our AI will analyze your responses and generate an evaluation report.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-secondary text-sm">Recruiter Review</p>
                  <p className="text-xs text-neutral-600">The hiring team will review your results within 3-5 business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-secondary text-sm">Next Steps</p>
                  <p className="text-xs text-neutral-600">We'll contact you via email regarding the next steps.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-900">
              <strong>Check your email:</strong> We've sent a confirmation with your interview details.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="flex-1">
              <Button variant="primary" className="w-full text-sm">Go to Homepage</Button>
            </Link>
            <Button variant="outline" className="flex-1 text-sm">View My Applications</Button>
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            Questions? <a href="mailto:support@techcorp.com" className="text-primary-600 hover:underline">Contact Support</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};