import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import { Briefcase, Plus, Trash2, Save, X, Bot } from 'lucide-react';
import { ROUTES } from '@/constants';
import jobService from '@/services/jobService';
import agentService, { Agent } from '@/services/agentService';
import { useAuth } from '@/contexts/AuthContext';  // ✅ ADD THIS LINE

interface CustomQuestion {
  id: string;
  question: string;
  isRequired: boolean;
}

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  // ✅ ADD THIS LINE - Get logged-in user
  const [agents, setAgents] = useState<Agent[]>([]);
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
    company: 1,      // ✅ TEMPORARY - Change to actual company ID
    recruiter: 1,    // ✅ TEMPORARY - Change to actual user ID
  });

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
    { id: '1', question: '', isRequired: true }
  ]);

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await agentService.getAllAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const addQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      { id: Date.now().toString(), question: '', isRequired: false }
    ]);
  };

  const removeQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof CustomQuestion, value: string | boolean) => {
    setCustomQuestions(customQuestions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
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

    if (!formData.title || !formData.location || !formData.description || !formData.requirements) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.agent_id) {
      alert('Please select an AI Interview Agent');
      return;
    }

    try {
      const jobData = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        work_mode: formData.work_mode,
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        skills_required: formData.skills_required,
        benefits: formData.benefits.trim(),
        salary_range: formData.salary_range.trim(),
        status: formData.status,
        company: 1,      // ✅ CHANGE THIS to actual company ID from your database
        recruiter:  1,    // ✅ CHANGE THIS to actual user ID from your database
        agent: parseInt(formData.agent_id),
        ...(formData.application_deadline && { application_deadline: formData.application_deadline })
      };

      console.log('Creating job with data:', jobData);

      const createdJob = await jobService.createJob(jobData);
      
      console.log('Job created successfully:', createdJob);

      const validQuestions = customQuestions.filter(q => q.question.trim() !== '');
      
      if (validQuestions.length > 0) {
        const questionPromises = validQuestions.map(q => 
          jobService.createCustomQuestion({
            job: createdJob.id,
            question_text: q.question.trim(),
            is_mandatory: q.isRequired,
          })
        );

        await Promise.all(questionPromises);
        console.log('Custom questions created');
      }

      alert('Job created successfully!');
      navigate(ROUTES.JOBS);
    } catch (error: any) {
      console.error('Error creating job:', error);
      
      if (error.response) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response status:', error.response.status);
        
        if (error.response.data?.errors) {
          const errors = error.response.data.errors;
          const errorMessages = Object.entries(errors)
            .map(([field, messages]: [string, any]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('\n');
          
          alert(`Validation errors:\n\n${errorMessages}`);
        } else {
          const errorMsg = error.response.data?.message || 
                          error.response.data?.error ||
                          'Unknown error occurred';
          alert(`Failed to create job: ${errorMsg}`);
        }
      } else {
        alert('Failed to create job. Please check your connection and try again.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Create New Job</h1>
            <p className="text-neutral-600">Define job details and interview questions</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate(ROUTES.JOBS)}>
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-600" />
                <CardTitle>AI Interview Agent</CardTitle>
              </div>
              <Badge variant="danger">Required</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Select an AI agent to conduct interviews for this position.
            </p>
            <div className="space-y-3">
              {agents.map((agent) => (
                <label
                  key={agent.id}
                  className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors"
                  style={{
                    borderColor: formData.agent_id === agent.id.toString() ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)'
                  }}
                >
                  <input
                    type="radio"
                    name="agent"
                    value={agent.id}
                    checked={formData.agent_id === agent.id.toString()}
                    onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-secondary">{agent.name}</p>
                    <p className="text-sm text-neutral-600 capitalize">{agent.interview_type} Interview Specialist</p>
                  </div>
                  {formData.agent_id === agent.id.toString() && (
                    <Badge variant="success">Selected</Badge>
                  )}
                </label>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate(ROUTES.AI_AGENTS)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New AI Agent
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Custom Interview Questions</CardTitle>
              <Button type="button" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              Add role-specific questions that must be asked during interviews for this job.
            </p>

            {customQuestions.map((question, index) => (
              <div key={question.id} className="p-4 border-2 border-neutral-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">
                    Question {index + 1}
                  </span>
                  {customQuestions.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 text-error" />
                    </Button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Question Text *
                  </label>
                  <Textarea
                    required
                    rows={2}
                    placeholder="e.g., Describe your experience with microservices architecture..."
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.isRequired}
                      onChange={(e) => updateQuestion(question.id, 'isRequired', e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm font-medium text-secondary">Mandatory Question</span>
                  </label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.JOBS)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formData.agent_id}>
            <Save className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </form>
    </div>
  );
};
