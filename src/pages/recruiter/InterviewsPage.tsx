import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Select, Loading } from '@/components/ui';
import { Plus, Video, Calendar, Clock, User, Briefcase, Play } from 'lucide-react';
import { format } from 'date-fns';
import { INTERVIEW_STATUSES, INTERVIEW_LEVEL_LABELS } from '@/constants';
import { interviewService, Interview } from '@/services/interviewService';


export const InterviewsPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadInterviews();
  }, [statusFilter]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getInterviews({
        status: statusFilter === 'all' ? undefined : statusFilter,
        ordering: '-scheduled_at',
      });
      setInterviews(response.results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Interviews</h1>
          <p className="text-neutral-600 mt-1">Schedule and monitor AI interviews</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/interviews/schedule')}>
          Schedule Interview
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardContent>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-neutral-700">Filter by status:</span>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            >
              <option value="all">All Statuses</option>
              <option value={INTERVIEW_STATUSES.SCHEDULED}>Scheduled</option>
              <option value={INTERVIEW_STATUSES.IN_PROGRESS}>In Progress</option>
              <option value={INTERVIEW_STATUSES.COMPLETED}>Completed</option>
              <option value={INTERVIEW_STATUSES.CANCELLED}>Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {interviews.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No interviews found matching your filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-secondary">
                          {interview.candidate_name || 'Unknown Candidate'}
                        </h3>
                        <p className="text-sm text-neutral-600">{interview.job_title || 'Unknown Job'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Status</p>
                        <Badge
                          variant={
                            interview.status === 'completed' ? 'success' :
                            interview.status === 'in_progress' ? 'warning' :
                            interview.status === 'cancelled' ? 'danger' :
                            'neutral'
                          }
                        >
                          {interview.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Type</p>
                        <p className="text-sm font-medium text-secondary">
                          {interview.interview_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Scheduled</p>
                        <p className="text-sm font-medium text-secondary">
                          {format(new Date(interview.scheduled_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Duration</p>
                        <p className="text-sm font-medium text-secondary">
                          {interview.duration_minutes} min
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{interview.candidate_email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{interview.company_name || 'Unknown Company'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {interview.status === 'in_progress' && (
                      <Button variant="primary" size="sm" leftIcon={<Play className="w-4 h-4" />} onClick={() => navigate(`/interview/${interview.uuid}`)}>
                        Join
                      </Button>
                    )}
                    {interview.status === 'scheduled' && (
                      <Button variant="outline" size="sm" leftIcon={<Calendar className="w-4 h-4" />} onClick={() => navigate(`/interviews/${interview.id}`)}>
                        Reschedule
                      </Button>
                    )}
                    {interview.status === 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/results/${interview.id}`)}>
                        View Results
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/interviews/${interview.id}`)}>
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
