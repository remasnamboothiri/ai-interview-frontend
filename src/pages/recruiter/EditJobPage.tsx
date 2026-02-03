import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import { Briefcase, Save, X, Plus, Trash2 } from 'lucide-react';
import { ROUTES } from '@/constants';
import jobService, { Job } from '@/services/jobService';
import agentService, { Agent } from '@/services/agentService';

export const EditJobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    employment_type: 'full-time',
    experience_level: 'mid',
    work_mode: 'remote',
    description: '',
    skills_required: [] as string[],
    requirements: '',
    benefits: '',
    application_deadline: '',
    salary_range: '',
    status: 'draft',
    agent_id: '',
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadAgents();
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadAgents = async () => {
    try {
      const data = await agentService.getAllAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const loadJob = async () => {
    try {
      const job = await jobService.getJob(Number(id));
      setFormData({
        title: job.title,
        location: job.location,
        employment_type: job.employment_type,
        experience_level: job.experience_level,
        work_mode: job.work_mode,
        description: job.description,
        skills_required: job.skills_required || [],
        requirements: job.requirements,
        benefits: job.benefits || '',
        application_deadline: job.application_deadline || '',
        salary_range: job.salary_range || '',
        status: job.status,
        agent_id: job.agent_id?.toString() || '',
      });
    } catch (error) {
      console.error('Failed to load job:', error);
      alert('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const jobData: any = {
        title: formData.title,
        location: formData.location,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        work_mode: formData.work_mode,
        description: formData.description,
        skills_required: formData.skills_required,
        requirements: formData.requirements,
        benefits: formData.benefits,
        salary_range: formData.salary_range,
        status: formData.status,
      };

      if (formData.agent_id) {
        jobData.agent = parseInt(formData.agent_id);
      }

      if (formData.application_deadline) {
        jobData.application_deadline = formData.application_deadline;
      }

      await jobService.updateJob(Number(id), jobData);
      alert('Job updated successfully!');
      navigate(`/jobs/${id}`);
    } catch (error) {
      console.error('Failed to update job:', error);
      alert('Failed to update job. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-600">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Edit Job</h1>
            <p className="text-neutral-600">Update job details and requirements</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate(`/jobs/${id}`)}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Job Title *
                </label>
                <Input
                  required
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Location *
                </label>
                <Input
                  required
                  placeholder="e.g., Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Employment Type *
                </label>
                <Select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Experience Level *
                </label>
                <Select
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Principal</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Work Mode *
                </label>
                <Select
                  value={formData.work_mode}
                  onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Application Deadline
                </label>
                <Input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Salary Range
                </label>
                <Input
                  placeholder="e.g., $120,000 - $180,000"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Skills Required
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., React, Node.js, Python"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                  />
                  <Button type="button" size="lg" onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_required.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="neutral"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-error"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Benefits
              </label>
              <Textarea
                rows={3}
                placeholder="e.g., Health insurance, 401k, Flexible hours, Remote work..."
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Job Description *
              </label>
              <Textarea
                required
                rows={4}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Requirements *
              </label>
              <Textarea
                required
                rows={4}
                placeholder="List the required skills, qualifications, and experience..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Status *
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/jobs/${id}`)}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Update Job
          </Button>
        </div>
      </form>
    </div>
  );
};
