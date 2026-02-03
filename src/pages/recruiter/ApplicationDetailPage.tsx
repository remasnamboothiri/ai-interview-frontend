import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { applicationService, JobApplicationDetail } from '@/services/applicationService';

const statusColors = {
  pending: 'neutral',
  screening: 'warning',
  interviewing: 'info',
  rejected: 'danger',
  hired: 'success',
} as const;

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication(parseInt(id));
    }
  }, [id]);

  const loadApplication = async (applicationId: number) => {
    try {
      setLoading(true);
      const data = await applicationService.getApplication(applicationId);
      setApplication(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: JobApplicationDetail['application_status']) => {
    if (!application) return;
    
    try {
      setUpdating(true);
      await applicationService.updateApplicationStatus(application.id, newStatus);
      setApplication({ ...application, application_status: newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      await applicationService.deleteApplication(application.id);
      navigate('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  if (loading) return <Loading />;
  if (!application) return <div>Application not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/applications')}>
            Back to Applications
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            Delete Application
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Info */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={statusColors[application.application_status]}>
                  {application.application_status.charAt(0).toUpperCase() + 
                   application.application_status.slice(1)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Applied Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(application.applied_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(application.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Status Update */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
          <div className="space-y-3">
            {(['pending', 'screening', 'interviewing', 'rejected', 'hired'] as const).map((status) => (
              <Button
                key={status}
                variant={application.application_status === status ? 'primary' : 'outline'}
                onClick={() => handleStatusUpdate(status)}
                disabled={updating || application.application_status === status}
                className="w-full justify-start"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </Card>

        {/* Candidate Info */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-sm text-gray-900">
                {application.candidate.user.full_name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">
                {application.candidate.user.email}
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/candidates/${application.candidate.id}`)}
              >
                View Full Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Job Info */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Job Title</label>
              <p className="mt-1 text-sm text-gray-900">
                {application.job.title}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Company</label>
              <p className="mt-1 text-sm text-gray-900">
                {application.job.company.name}
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/jobs/${application.job.id}`)}
              >
                View Job Details
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};