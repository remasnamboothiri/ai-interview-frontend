import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { applicationService, JobApplication } from '@/services/applicationService';
import { Link } from 'react-router-dom';

const statusColors = {
  pending: 'neutral',
  screening: 'warning',
  interviewing: 'info',
  rejected: 'danger',
  hired: 'success',
} as const;

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');

  useEffect(() => {
    loadApplications();
  }, [searchTerm, statusFilter, sortBy]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getApplications({
        search: searchTerm || undefined,
        application_status: statusFilter || undefined,
        ordering: sortBy,
      });
      setApplications(response.results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: JobApplication['application_status']) => {
    try {
      await applicationService.updateApplicationStatus(id, newStatus);
      loadApplications(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      await applicationService.deleteApplication(id);
      loadApplications(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="screening">Screening</option>
            <option value="interviewing">Interviewing</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="-applied_at">Latest Applied</option>
            <option value="applied_at">Earliest Applied</option>
            <option value="candidate_name">Candidate Name</option>
            <option value="job_title">Job Title</option>
          </Select>
          <Button onClick={loadApplications} variant="outline">
            Refresh
          </Button>
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">No applications found</p>
            </div>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {application.candidate_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.candidate_email}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">
                        {application.job_title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.company_name}
                      </p>
                    </div>
                    <div className="text-center">
                      <Badge variant={statusColors[application.application_status]}>
                        {application.application_status.charAt(0).toUpperCase() + 
                         application.application_status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Applied</p>
                      <p className="text-sm font-medium">
                        {new Date(application.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select
                    value={application.application_status}
                    onChange={(e) => handleStatusUpdate(
                      application.id, 
                      e.target.value as JobApplication['application_status']
                    )}
                    className="text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="screening">Screening</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </Select>
                  
                  <Link to={`/applications/${application.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(application.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};