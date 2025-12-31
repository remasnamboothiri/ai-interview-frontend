import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { CheckCircle, Clock, Mail } from 'lucide-react';

export const InterviewComplete = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-secondary mb-4">
            Interview Completed!
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Thank you for completing your interview with TechCorp
          </p>

          <div className="bg-neutral-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-secondary mb-4">What Happens Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium text-secondary mb-1">AI Analysis</p>
                  <p className="text-sm text-neutral-600">
                    Our AI will analyze your responses and generate a comprehensive evaluation report.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium text-secondary mb-1">Recruiter Review</p>
                  <p className="text-sm text-neutral-600">
                    The hiring team will review your interview results within 3-5 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium text-secondary mb-1">Next Steps</p>
                  <p className="text-sm text-neutral-600">
                    We'll contact you via email regarding the next steps in the hiring process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-blue-900">
              <strong>Check your email:</strong> We've sent a confirmation email with your interview details and expected timeline for results.
            </p>
          </div>

          <div className="flex gap-4">
            <Link to="/" className="flex-1">
              <Button variant="primary" className="w-full">
                Go to Homepage
              </Button>
            </Link>
            <Button variant="outline" className="flex-1">
              View My Applications
            </Button>
          </div>

          <p className="text-sm text-neutral-500 mt-6">
            Questions? <a href="mailto:support@techcorp.com" className="text-primary-600 hover:underline">Contact Support</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
