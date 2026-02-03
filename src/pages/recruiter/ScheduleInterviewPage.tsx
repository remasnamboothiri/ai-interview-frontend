import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Textarea } from '@/components/ui';
import { interviewService } from '@/services/interviewService';
import { candidateService } from '@/services/candidateService';
import jobService from '@/services/jobService';
import agentService from '@/services/agentService';
import { Video, Save, X, Calendar } from 'lucide-react';



export const ScheduleInterviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    candidate_id: '',
    job_id: '',
    agent_id: '',
    interview_date: '',
    interview_time: '',
    duration: '30',
    instructions: '',
    send_notification: true,
  });

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [candidatesRes, jobsRes, agentsRes] = await Promise.all([
        candidateService.getAllCandidates(),
        jobService.getAllJobs(),
        agentService.getAllAgents(),
      ]);
      setCandidates(candidatesRes || []);
      setJobs(jobsRes || []);
      setAgents(agentsRes || []);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.candidate_id || !formData.job_id || !formData.interview_date || !formData.interview_time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const scheduledAt = `${formData.interview_date}T${formData.interview_time}:00`;

      await interviewService.createInterview({
        job: parseInt(formData.job_id),
        candidate: parseInt(formData.candidate_id),
        agent: formData.agent_id ? parseInt(formData.agent_id) : undefined,
        scheduled_at: scheduledAt,
        duration_minutes: parseInt(formData.duration),
        interview_type: 'ai_only',
        instructions: formData.instructions || undefined,
      });

      navigate('/interviews');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Video className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Schedule Interview</h1>
            <p className="text-neutral-600">Set up a new AI interview session</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/interviews')}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Candidate *
              </label>
              <Select
                required
                value={formData.candidate_id}
                onChange={(e) => setFormData({ ...formData, candidate_id: e.target.value })}
              >
                <option value="">Select a candidate</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.user?.full_name || candidate.full_name || 'Unknown'} - {candidate.user?.email || candidate.email || ''}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Job Position *
              </label>
              <Select
                required
                value={formData.job_id}
                onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                AI Interview Agent *
              </label>
              <Select
                required
                value={formData.agent_id}
                onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
              >
                <option value="">Select an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Date *
                </label>
                <Input
                  required
                  type="date"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Time *
                </label>
                <Input
                  required
                  type="time"
                  value={formData.interview_time}
                  onChange={(e) => setFormData({ ...formData, interview_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Duration (minutes) *
              </label>
              <Select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Special Instructions
              </label>
              <Textarea
                rows={3}
                placeholder="Any special instructions or notes for the candidate..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 p-4 bg-primary-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.send_notification}
                onChange={(e) => setFormData({ ...formData, send_notification: e.target.checked })}
                className="w-4 h-4"
                id="send-notification"
              />
              <label htmlFor="send-notification" className="text-sm text-secondary cursor-pointer">
                Send email invitation to candidate
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/interviews')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        </div>
      </form>
    </div>
  );
};

