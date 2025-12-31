import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { Calendar, Clock, Video, MapPin, CheckCircle } from 'lucide-react';

export const InterviewInvitation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-12 h-12 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-secondary mb-2">
                You're Invited to an Interview!
              </h1>
              <p className="text-neutral-600">
                TechCorp would like to interview you for the position of
              </p>
              <p className="text-xl font-semibold text-primary-600 mt-2">
                Senior Software Engineer
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-secondary mb-4">Interview Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Date</p>
                    <p className="font-medium text-secondary">Monday, December 30, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Time</p>
                    <p className="font-medium text-secondary">2:00 PM - 2:45 PM (45 minutes)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Format</p>
                    <p className="font-medium text-secondary">AI Video Interview</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Location</p>
                    <p className="font-medium text-secondary">Remote (Online)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Preparation Tips
              </h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• Test your camera and microphone before the interview</li>
                <li>• Ensure you have a stable internet connection</li>
                <li>• Find a quiet, well-lit space for the interview</li>
                <li>• Have your resume and relevant documents ready</li>
                <li>• Arrive 5-10 minutes early to complete the system check</li>
              </ul>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-secondary mb-3">Technical Requirements</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• Modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                <li>• Working webcam and microphone</li>
                <li>• Minimum 5 Mbps internet speed</li>
                <li>• Allow camera and microphone permissions</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Link to="/interview/system-check" className="flex-1">
                <Button variant="primary" className="w-full">
                  Accept & Prepare
                </Button>
              </Link>
              <Button variant="outline" className="flex-1">
                Request Reschedule
              </Button>
            </div>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Questions? Contact us at <a href="mailto:support@techcorp.com" className="text-primary-600 hover:underline">support@techcorp.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
