import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Select } from '@/components/ui';
import { Plus, Video, Calendar, Clock, User, Briefcase, Play } from 'lucide-react';
import { mockInterviews, mockCandidates, mockJobs } from '@/data/mockData';
import { format } from 'date-fns';
import { INTERVIEW_STATUSES, INTERVIEW_LEVEL_LABELS } from '@/constants';

export const InterviewsPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInterviews = mockInterviews.filter(interview => {
    return statusFilter === 'all' || interview.status === statusFilter;
  });

  const getCandidate = (candidateId: string) => {
    return mockCandidates.find(c => c.id === candidateId);
  };

  const getJob = (jobId: string) => {
    return mockJobs.find(j => j.id === jobId);
  };

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
        {filteredInterviews.map((interview) => {
          const candidate = getCandidate(interview.candidate_id);
          const job = getJob(interview.job_id);

          return (
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
                          {candidate?.full_name}
                        </h3>
                        <p className="text-sm text-neutral-600">{job?.title}</p>
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
                        <p className="text-xs text-neutral-500 mb-1">Level</p>
                        <p className="text-sm font-medium text-secondary">
                          {INTERVIEW_LEVEL_LABELS[interview.level]}
                        </p>
                      </div>
                      {interview.scheduled_at && (
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Scheduled</p>
                          <p className="text-sm font-medium text-secondary">
                            {format(new Date(interview.scheduled_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      )}
                      {interview.duration_minutes && (
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Duration</p>
                          <p className="text-sm font-medium text-secondary">
                            {interview.duration_minutes} min
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{candidate?.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{job?.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {interview.status === 'in_progress' && (
                      <Button variant="primary" size="sm" leftIcon={<Play className="w-4 h-4" />} onClick={() => navigate(`/interview/${interview.id}`)}>
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
          );
        })}

        {filteredInterviews.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No interviews found matching your filters</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
