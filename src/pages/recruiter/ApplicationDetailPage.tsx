import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button, Badge } from '@/components/ui';
import { Loading } from '@/components/ui';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Calendar, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Share2,
  Edit,
  Trash2,
  MessageSquare,
  Video,
  UserCheck,
  Search
} from 'lucide-react';
import { applicationService, JobApplicationDetail } from '@/services/applicationService';
import { format } from 'date-fns';

const statusConfig = {
  pending: { 
    color: 'neutral', 
    icon: Clock, 
    label: 'Pending',
    bgColor: 'bg-neutral-50',
    textColor: 'text-neutral-700',
    description: 'Application received and awaiting review'
  },
  screening: { 
    color: 'warning', 
    icon: Search, 
    label: 'Screening',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    description: 'Application is being screened by recruiters'
  },
  interviewing: { 
    color: 'primary', 
    icon: UserCheck, 
    label: 'Interviewing',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    description: 'Candidate is in the interview process'
  },
  rejected: { 
    color: 'danger', 
    icon: XCircle, 
    label: 'Rejected',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    description: 'Application has been rejected'
  },
  hired: { 
    color: 'success', 
    icon: CheckCircle, 
    label: 'Hired',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    description: 'Candidate has been hired for this position'
  },
} as const;

export const ApplicationDetailPage = () => {
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
      setError(null);
      const data = await applicationService.getApplication(applicationId);
      setApplication(data);
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
    if (!confirm(`Are you sure you want to delete the application from ${application.candidate.user.full_name}?`)) return;
    
    try {
      await applicationService.deleteApplication(application.id);
      navigate('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  const handleScheduleInterview = () => {
    if (!application) return;
    navigate('/interviews/schedule', {
      state: {
        candidateId: application.candidate.id,
        jobId: application.job.id
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
        <Loading text="Loading application details..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">Application not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatus = statusConfig[application.application_status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-secondary">Application Details</h1>
            <p className="text-neutral-600">
              {application.candidate.user.full_name} • {application.job.title}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
            Share
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            Delete
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

      {/* Status Overview */}
      <Card className={currentStatus.bgColor}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${currentStatus.bgColor} rounded-xl flex items-center justify-center border-2 border-white`}>
                <StatusIcon className={`w-8 h-8 ${currentStatus.textColor}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-1">
                  {currentStatus.label}
                </h2>
                <p className={`${currentStatus.textColor} text-sm`}>
                  {currentStatus.description}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-neutral-600 mb-1">Applied</p>
              <p className="text-lg font-semibold text-secondary">
                {format(new Date(application.applied_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary">
                    {application.candidate.user.full_name}
                  </h3>
                  <div className="flex items-center gap-4 text-neutral-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{application.candidate.user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <Button 
                  variant="primary"
                  leftIcon={<User className="w-4 h-4" />}
                  onClick={() => navigate(`/candidates/${application.candidate.id}`)}
                >
                  View Full Profile
                </Button>
                <Button 
                  variant="outline"
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary">
                    {application.job.title}
                  </h3>
                  <p className="text-neutral-600 mt-1">
                    {application.job.company.name}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <Button 
                  variant="primary"
                  leftIcon={<Briefcase className="w-4 h-4" />}
                  onClick={() => navigate(`/jobs/${application.job.id}`)}
                >
                  View Job Details
                </Button>
                <Button 
                  variant="outline"
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  Job Description
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Application Submitted</p>
                    <p className="text-sm text-neutral-600">
                      {format(new Date(application.applied_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <StatusIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Current Status: {currentStatus.label}</p>
                    <p className="text-sm text-neutral-600">
                      Last updated: {format(new Date(application.updated_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.application_status === 'screening' && (
                <Button 
                  variant="primary" 
                  className="w-full"
                  leftIcon={<Video className="w-4 h-4" />}
                  onClick={handleScheduleInterview}
                >
                  Schedule Interview
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Send Message
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                leftIcon={<FileText className="w-4 h-4" />}
              >
                View Resume
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Documents
              </Button>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(statusConfig).map(([status, config]) => {
                const Icon = config.icon;
                const isCurrentStatus = application.application_status === status;
                
                return (
                  <Button
                    key={status}
                    variant={isCurrentStatus ? 'primary' : 'outline'}
                    onClick={() => handleStatusUpdate(status as JobApplicationDetail['application_status'])}
                    disabled={updating || isCurrentStatus}
                    className="w-full justify-start"
                    leftIcon={<Icon className="w-4 h-4" />}
                  >
                    {config.label}
                    {isCurrentStatus && <CheckCircle className="w-4 h-4 ml-auto" />}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-neutral-600">Application ID</label>
                <p className="text-sm text-secondary font-mono">#{application.id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-600">Applied Date</label>
                <p className="text-sm text-secondary">
                  {format(new Date(application.applied_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-600">Last Updated</label>
                <p className="text-sm text-secondary">
                  {format(new Date(application.updated_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-600">Current Status</label>
                <div className="mt-1">
                  <Badge variant={currentStatus.color}>
                    {currentStatus.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};