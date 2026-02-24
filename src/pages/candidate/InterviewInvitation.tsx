import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { Calendar, Clock, Video, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

// Define the interview data structure
interface InterviewData {
  id: number;
  job: {
    title: string;
    company: {
      name: string;
    };
  };
  candidate: {
    user: {
      full_name: string;
      email: string;
    };
  };
  scheduled_at: string;
  duration_minutes: number;
  interview_type: string;
  instructions: string;
  status: string;
}

export const InterviewInvitation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch interview data when component mounts
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://ai-interview-backend-6672.onrender.com/api/interviews/${id}/`
        );
        setInterview(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching interview:', err);
        if (err.response?.status === 404) {
          setError('Interview not found. The link may be invalid or expired.');
        } else {
          setError('Failed to load interview details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInterviewData();
    }
  }, [id]);

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    };
    
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions),
    };
  };

  // Format interview type for display
  const formatInterviewType = (type: string) => {
    const types: { [key: string]: string } = {
      'ai_only': 'AI Video Interview',
      'ai_assisted': 'AI-Assisted Interview',
      'human_only': 'Human Interview',
    };
    return types[type] || 'Video Interview';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-secondary mb-2">
              Interview Not Found
            </h1>
            <p className="text-neutral-600 mb-6">
              {error || 'Unable to load interview details.'}
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get formatted date and time
  const { date, time } = formatDateTime(interview.scheduled_at);

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
                {interview.job.company.name} would like to interview you for the position of
              </p>
              <p className="text-xl font-semibold text-primary-600 mt-2">
                {interview.job.title}
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-secondary mb-4">Interview Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Date</p>
                    <p className="font-medium text-secondary">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Time</p>
                    <p className="font-medium text-secondary">
                      {time} ({interview.duration_minutes} minutes)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Format</p>
                    <p className="font-medium text-secondary">
                      {formatInterviewType(interview.interview_type)}
                    </p>
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

            {interview.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-secondary mb-3">
                  Special Instructions
                </h3>
                <p className="text-sm text-neutral-700 whitespace-pre-line">
                  {interview.instructions}
                </p>
              </div>
            )}

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
              <Link to={`/interview/system-check/${id}`} className="flex-1">
                <Button variant="primary" className="w-full">
                  Accept & Prepare
                </Button>
              </Link>
              <Button variant="outline" className="flex-1">
                Request Reschedule
              </Button>
            </div>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Questions? Contact us at{' '}
              <a 
                href={`mailto:${interview.job.company.name.toLowerCase().replace(/\s+/g, '')}@support.com`} 
                className="text-primary-600 hover:underline"
              >
                support@{interview.job.company.name.toLowerCase().replace(/\s+/g, '')}.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
