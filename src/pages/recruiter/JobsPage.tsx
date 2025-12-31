import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select } from '@/components/ui';
import { Plus, Search, MapPin, Briefcase, Users, Calendar } from 'lucide-react';
import { mockJobs, mockCandidates } from '@/data/mockData';
import { formatRelativeTime } from '@/utils/format';
import { JOB_STATUSES } from '@/constants';

export const JobsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getJobCandidateCount = (jobId: string) => {
    return mockCandidates.filter(c => c.job_id === jobId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Jobs</h1>
          <p className="text-neutral-600 mt-1">Manage your job postings and requirements</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/jobs/create')}>
          Create Job
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search jobs by title or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            >
              <option value="all">All Statuses</option>
              <option value={JOB_STATUSES.ACTIVE}>Active</option>
              <option value={JOB_STATUSES.PAUSED}>Paused</option>
              <option value={JOB_STATUSES.CLOSED}>Closed</option>
              <option value={JOB_STATUSES.DRAFT}>Draft</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-secondary">{job.title}</h3>
                    <Badge
                      variant={
                        job.status === 'active' ? 'success' :
                        job.status === 'paused' ? 'warning' :
                        job.status === 'closed' ? 'danger' : 'neutral'
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{getJobCandidateCount(job.id)} candidates</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Posted {formatRelativeTime(new Date(job.created_at))}</span>
                    </div>
                  </div>

                  <p className="text-neutral-700 mb-4">{job.description}</p>

                  {job.requirements && (
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-neutral-700 mb-1">Requirements:</p>
                      <p className="text-sm text-neutral-600">{job.requirements}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${job.id}/edit`)}>
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No jobs found matching your filters</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
