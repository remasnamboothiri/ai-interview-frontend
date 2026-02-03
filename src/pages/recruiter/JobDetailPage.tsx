import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Edit, Users, Calendar, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jobService, { Job } from '@/services/jobService';

export const JobDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const data = await jobService.getJob(Number(id));
      setJob(data);
    } catch (error) {
      console.error('Failed to load job:', error);
      alert('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobService.deleteJob(job.id);
        alert('Job deleted successfully');
        navigate('/jobs');
      } catch (error) {
        console.error('Failed to delete job:', error);
        alert('Failed to delete job');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-600">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-600">Job not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(`/jobs/${job.id}/edit`)}
          >
            Edit Job
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleDelete}
          >
            Delete Job
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary mb-2">{job.title}</h1>
              <div className="flex items-center gap-3 text-neutral-600">
                <span>{job.location}</span>
                <span>•</span>
                <span className="capitalize">{job.employment_type}</span>
                <span>•</span>
                <span className="capitalize">{job.experience_level} Level</span>
              </div>
              {job.created_at && (
                <p className="text-sm text-neutral-500 mt-2">
                  Posted {format(new Date(job.created_at), 'MMMM dd, yyyy')}
                </p>
              )}
            </div>
            <Badge variant={job.status === 'active' ? 'success' : 'neutral'} className="text-base px-4 py-2">
              {job.status}
            </Badge>
          </div>
          {job.salary_range && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-neutral-600">Salary Range</p>
              <p className="text-xl font-bold text-primary-600">{job.salary_range}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
          </CardContent>
        </Card>
      </div>

      {job.skills_required && job.skills_required.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.skills_required.map((skill, index) => (
                <Badge key={index} variant="neutral">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {job.benefits && (
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Applications</CardTitle>
            <Button size="sm" onClick={() => navigate('/applications')}>View All Applications</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600">No applications yet for this job</p>
            <p className="text-sm text-neutral-500 mt-1">Applications will appear here once candidates apply</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
