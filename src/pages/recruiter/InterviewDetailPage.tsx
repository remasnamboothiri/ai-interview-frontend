import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Calendar, User, Briefcase, Bot, Clock, Video, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const mockInterview = {
  id: '1',
  candidate: {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  },
  job: {
    id: '1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
  },
  agent: {
    id: '1',
    name: 'Senior Technical Interviewer',
  },
  scheduled_date: new Date('2024-12-25T10:00:00'),
  duration: 45,
  status: 'scheduled',
  interview_link: 'https://platform.com/interview/abc123',
  instructions: 'Please ensure you have a stable internet connection and a quiet environment.',
  created_at: new Date('2024-12-20'),
};

export const InterviewDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Interviews
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
            Reschedule
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Trash2 className="w-4 h-4 text-error" />}>
            Cancel Interview
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary mb-2">Interview Details</h1>
              <p className="text-neutral-600">{mockInterview.job.title}</p>
            </div>
            <Badge
              variant={
                mockInterview.status === 'scheduled' ? 'warning' :
                mockInterview.status === 'completed' ? 'success' : 'neutral'
              }
              className="text-base px-4 py-2"
            >
              {mockInterview.status}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-neutral-600 mt-1" />
              <div>
                <p className="text-sm text-neutral-600">Date & Time</p>
                <p className="font-semibold text-secondary">
                  {format(mockInterview.scheduled_date, 'MMMM dd, yyyy')}
                </p>
                <p className="text-neutral-700">
                  {format(mockInterview.scheduled_date, 'hh:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-neutral-600 mt-1" />
              <div>
                <p className="text-sm text-neutral-600">Duration</p>
                <p className="font-semibold text-secondary">{mockInterview.duration} minutes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Candidate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Name</p>
              <p className="font-semibold text-secondary">{mockInterview.candidate.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Email</p>
              <p className="font-semibold text-secondary">{mockInterview.candidate.email}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Phone</p>
              <p className="font-semibold text-secondary">{mockInterview.candidate.phone}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/candidates/${mockInterview.candidate.id}`)}
            >
              View Full Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Position</p>
              <p className="font-semibold text-secondary">{mockInterview.job.title}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Department</p>
              <p className="font-semibold text-secondary">{mockInterview.job.department}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-6"
              onClick={() => navigate(`/jobs/${mockInterview.job.id}`)}
            >
              View Job Details
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Interview Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-secondary">{mockInterview.agent.name}</p>
              <p className="text-sm text-neutral-600">AI-powered technical interviewer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-600 mb-2">Share this link with the candidate:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={mockInterview.interview_link}
                readOnly
                className="flex-1 px-4 py-2 border-2 border-neutral-200 rounded-lg bg-white"
              />
              <Button variant="outline">Copy Link</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {mockInterview.instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700">{mockInterview.instructions}</p>
          </CardContent>
        </Card>
      )}

      {mockInterview.status === 'scheduled' && (
        <div className="flex justify-center">
          <Button size="lg" leftIcon={<Video className="w-5 h-5" />}>
            Start Interview Now
          </Button>
        </div>
      )}
    </div>
  );
};
