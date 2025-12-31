import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Textarea } from '@/components/ui';
import { Video, Save, X, Calendar } from 'lucide-react';

export const ScheduleInterviewPage = () => {
  const navigate = useNavigate();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/interviews');
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
                <option value="1">John Doe - Senior Software Engineer</option>
                <option value="2">Sarah Wilson - Product Manager</option>
                <option value="3">Mike Johnson - UX Designer</option>
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
                <option value="1">Senior Software Engineer</option>
                <option value="2">Product Manager</option>
                <option value="3">UX Designer</option>
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
                <option value="1">Senior Technical Interviewer</option>
                <option value="2">Product Management Interviewer</option>
                <option value="3">Behavioral Interviewer</option>
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
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </form>
    </div>
  );
};
