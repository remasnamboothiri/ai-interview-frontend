import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button, Input, Select, Badge } from '@/components/ui';
import { Loading } from '@/components/ui';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  XCircle
} from 'lucide-react';
import { applicationService, JobApplication } from '@/services/applicationService';
import { format } from 'date-fns';

const statusConfig = {
  pending: { 
    color: 'neutral', 
    icon: Clock, 
    label: 'Pending',
    bgColor: 'bg-neutral-50',
    textColor: 'text-neutral-700'
  },
  screening: { 
    color: 'warning', 
    icon: Search, 
    label: 'Screening',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  interviewing: { 
    color: 'primary', 
    icon: UserCheck, 
    label: 'Interviewing',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  rejected: { 
    color: 'danger', 
    icon: XCircle, 
    label: 'Rejected',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  hired: { 
    color: 'success', 
    icon: CheckCircle, 
    label: 'Hired',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
} as const;

export const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [totalCount, setTotalCount] = useState(0);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadApplications();
  }, [searchTerm, statusFilter, sortBy]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationService.getApplications({
        search: searchTerm || undefined,
        application_status: statusFilter || undefined,
        ordering: sortBy,
      });
      setApplications(response.results);
      setTotalCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: JobApplication['application_status']) => {
    try {
      setUpdating(id);
      await applicationService.updateApplicationStatus(id, newStatus);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === id 
            ? { ...app, application_status: newStatus }
            : app
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: number, candidateName: string) => {
    if (!confirm(`Are you sure you want to delete the application from ${candidateName}?`)) return;
    
    try {
      await applicationService.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  const getStatusStats = () => {
    const stats = applications.reduce((acc, app) => {
      acc[app.application_status] = (acc[app.application_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const statusStats = getStatusStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Job Applications</h1>
            <p className="text-neutral-600 mt-1">Loading applications...</p>
          </div>
        </div>
        <Loading text="Loading applications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Job Applications</h1>
          <p className="text-neutral-600 mt-1">
            Manage and track candidate applications ({totalCount} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={loadApplications}>
            Refresh
          </Button>
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Overview Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = statusStats[status] || 0;
          const Icon = config.icon;
          
          return (
            <Card key={status} className={`${config.bgColor} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.textColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{count}</p>
                    <p className={`text-sm ${config.textColor}`}>{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                placeholder="Search by candidate or job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
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
            
            <Button 
              variant="outline" 
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setSortBy('-created_at');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600 text-lg mb-2">No applications found</p>
                <p className="text-neutral-500">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your filters to see more results'
                    : 'Applications will appear here when candidates apply to jobs'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => {
            const statusInfo = statusConfig[application.application_status];
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      {/* Candidate Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary text-lg">
                            {application.candidate_name || 'Unknown Candidate'}
                          </h3>
                          <p className="text-neutral-600 text-sm">
                            {application.candidate_email || 'No email'}
                          </p>
                        </div>
                      </div>

                      {/* Job Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-neutral-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary">
                            {application.job_title || 'Unknown Job'}
                          </p>
                          <p className="text-neutral-600 text-sm">
                            {application.company_name || 'Unknown Company'}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${statusInfo.textColor}`} />
                        <Badge variant={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar className="w-4 h-4" />
                        <div className="text-sm">
                          <p className="font-medium">Applied</p>
                          <p>{format(new Date(application.applied_at), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Select
                        value={application.application_status}
                        onChange={(e) => handleStatusUpdate(
                          application.id, 
                          e.target.value as JobApplication['application_status']
                        )}
                        disabled={updating === application.id}
                        className="min-w-[120px]"
                      >
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <option key={status} value={status}>{config.label}</option>
                        ))}
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => navigate(`/applications/${application.id}`)}
                      >
                        View
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(application.id, application.candidate_name || 'this candidate')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination could be added here if needed */}
      {applications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <p>Showing {applications.length} of {totalCount} applications</p>
              {applications.length < totalCount && (
                <Button variant="outline" size="sm">
                  Load More
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};