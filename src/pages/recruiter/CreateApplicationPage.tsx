import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { ArrowLeft, Plus, Save, AlertCircle } from 'lucide-react';
import { applicationService, CreateJobApplicationData } from '@/services/applicationService';
import candidateService from '@/services/candidateService';
import jobService from '@/services/jobService';

export const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<CreateJobApplicationData>({
    job: 0,
    candidate: 0,
    application_status: 'pending'
  });

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      setLoadingData(true);
      const [candidatesRes, jobsRes] = await Promise.all([
        candidateService.getAllCandidates(),
        jobService.getAllJobs()
      ]);
      setCandidates(candidatesRes || []);
      setJobs(jobsRes || []);
    } catch (err) {
      setError('Failed to load candidates and jobs');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.job || !formData.candidate) {
      setError('Please select both a candidate and a job');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newApplication = await applicationService.createApplication(formData);
      navigate(`/applications/${newApplication.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateJobApplicationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loadingData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-neutral-600">Loading form data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate('/applications')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-secondary">Create Application</h1>
          <p className="text-neutral-600">Manually create a new job application</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Select Candidate *
              </label>
              <Select
                required
                value={formData.candidate}
                onChange={(e) => handleInputChange('candidate', parseInt(e.target.value))}
              >
                <option value={0}>Choose a candidate</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.user?.full_name || candidate.full_name || 'Unknown'} - {candidate.user?.email || candidate.email || ''}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Select Job *
              </label>
              <Select
                required
                value={formData.job}
                onChange={(e) => handleInputChange('job', parseInt(e.target.value))}
              >
                <option value={0}>Choose a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.company?.name || 'Unknown Company'}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Initial Status
              </label>
              <Select
                value={formData.application_status}
                onChange={(e) => handleInputChange('application_status', e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="screening">Screening</option>
                <option value="interviewing">Interviewing</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/applications')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {loading ? 'Creating...' : 'Create Application'}
          </Button>
        </div>
      </form>
    </div>
  );
};