import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input, Select } from '@/components/ui';
import { Plus, Search, MapPin, Briefcase, Users, Calendar, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '@/utils/format';
import { JOB_STATUSES } from '@/constants';
import jobService, { Job } from '@/services/jobService';

export const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await jobService.getAllJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: number, jobTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      try {
        await jobService.deleteJob(jobId);
        alert('Job deleted successfully');
        loadJobs(); // Reload the list
      } catch (error) {
        console.error('Failed to delete job:', error);
        alert('Failed to delete job');
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-600">Loading jobs...</p>
      </div>
    );
  }

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
                placeholder="Search jobs by title or location..."
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
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
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
                      <span className="capitalize">{job.employment_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="capitalize">{job.experience_level} Level</span>
                    </div>
                    {job.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {formatRelativeTime(new Date(job.created_at))}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-neutral-700 mb-4 line-clamp-2">{job.description}</p>

                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills_required.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="neutral" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills_required.length > 5 && (
                        <Badge variant="neutral" className="text-xs">
                          +{job.skills_required.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {job.salary_range && (
                    <div className="bg-neutral-50 rounded-lg p-3 inline-block">
                      <p className="text-sm font-medium text-neutral-700">
                        💰 {job.salary_range}
                      </p>
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
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(job.id, job.title);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
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
                <p className="text-neutral-600">
                  {jobs.length === 0 
                    ? 'No jobs created yet. Create your first job posting!' 
                    : 'No jobs found matching your filters'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
