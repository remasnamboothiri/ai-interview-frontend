import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Loading } from '@/components/ui';
import { ArrowLeft, Calendar, User, Briefcase, Bot, Clock, Video, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { interviewService } from '@/services/interviewService';

export const InterviewDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInterviewDetails();
    }
  }, [id]);

  const loadInterviewDetails = async () => {
    try {
      setLoading(true);
      const data = await interviewService.getInterview(Number(id));
      console.log('Interview data:', data);
      setInterview(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async () => {
    if (!interview || !window.confirm('Are you sure you want to cancel this interview?')) return;
    
    try {
      await interviewService.cancelInterview(interview.id, 'Cancelled by recruiter');
      navigate('/interviews');
    } catch (err) {
      alert('Failed to cancel interview');
    }
  };

  const handleCopyLink = () => {
    const link = interview?.meeting_link || interview?.interview_link;
    if (link) {
      navigator.clipboard.writeText(link);
      alert('Interview link copied to clipboard!');
    }
  };

  if (loading) return <Loading />;

  if (error || !interview) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Interviews
        </Button>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-red-600">{error || 'Interview not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data with proper fallbacks
  const candidateName = interview.candidate?.user?.full_name || 
                        interview.candidate?.user?.email?.split('@')[0] || 
                        'Unknown Candidate';
  const candidateEmail = interview.candidate?.user?.email || 'No email provided';
  const jobTitle = interview.job?.title || 'Unknown Job';
  const companyName = interview.job?.company?.name || 'Unknown Company';
  const agentName = interview.agent?.name || 'AI Interview Agent';
  const interviewLink = interview.meeting_link || interview.interview_link;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Interviews
        </Button>
        <div className="flex gap-2">
          {interview.status === 'scheduled' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => navigate(`/interviews/${interview.id}/reschedule`)}
              >
                Reschedule
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Trash2 className="w-4 h-4 text-error" />}
                onClick={handleCancelInterview}
              >
                Cancel Interview
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary mb-2">Interview Details</h1>
              <p className="text-neutral-600">{jobTitle}</p>
            </div>
            <Badge
              variant={
                interview.status === 'scheduled' ? 'warning' :
                interview.status === 'completed' ? 'success' :
                interview.status === 'in_progress' ? 'warning' :
                interview.status === 'cancelled' ? 'danger' : 'neutral'
              }
              className="text-base px-4 py-2"
            >
              {interview.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-neutral-600 mt-1" />
              <div>
                <p className="text-sm text-neutral-600">Date & Time</p>
                <p className="font-semibold text-secondary">
                  {format(new Date(interview.scheduled_at), 'MMMM dd, yyyy')}
                </p>
                <p className="text-neutral-700">
                  {format(new Date(interview.scheduled_at), 'hh:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-neutral-600 mt-1" />
              <div>
                <p className="text-sm text-neutral-600">Duration</p>
                <p className="font-semibold text-secondary">{interview.duration_minutes} minutes</p>
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
              <p className="font-semibold text-secondary">{candidateName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Email</p>
              <p className="font-semibold text-secondary">{candidateEmail}</p>
            </div>
            {interview.candidate?.id && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/candidates/${interview.candidate.id}`)}
              >
                View Full Profile
              </Button>
            )}
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
              <p className="font-semibold text-secondary">{jobTitle}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Company</p>
              <p className="font-semibold text-secondary">{companyName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Interview Type</p>
              <p className="font-semibold text-secondary">{interview.interview_type.replace('_', ' ')}</p>
            </div>
            {interview.job?.id && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-6"
                onClick={() => navigate(`/jobs/${interview.job.id}`)}
              >
                View Job Details
              </Button>
            )}
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
              <p className="font-semibold text-secondary">{agentName}</p>
              <p className="text-sm text-neutral-600">AI-powered interviewer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {interviewLink && (
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
                  value={interviewLink}
                  readOnly
                  className="flex-1 px-4 py-2 border-2 border-neutral-200 rounded-lg bg-white"
                />
                <Button variant="outline" onClick={handleCopyLink}>Copy Link</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {interview.instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700">{interview.instructions}</p>
          </CardContent>
        </Card>
      )}

      {interview.status === 'scheduled' && (
        <div className="flex justify-center">
          <Button 
            size="lg" 
            leftIcon={<Video className="w-5 h-5" />}
            onClick={() => navigate(`/interview/${interview.uuid}`)}
          >
            Start Interview Now
          </Button>
        </div>
      )}

      {interview.status === 'completed' && (
        <div className="flex justify-center">
          <Button 
            size="lg" 
            variant="primary"
            onClick={() => navigate(`/results/${interview.id}`)}
          >
            View Interview Results
          </Button>
        </div>
      )}
    </div>
  );
};
