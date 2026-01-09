import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import { Briefcase, Plus, Trash2, Save, X, Bot } from 'lucide-react';
import { ROUTES } from '@/constants';

interface CustomQuestion {
  id: string;
  question: string;
  category: string;
  isRequired: boolean;
}

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    
    location: '',
    type: 'full-time',
    experienceLevel: 'mid',
    workMode: 'remote',
    description: '',
    skillsRequired: [] as string[],
    requirements: '',
    benefits: '',                    
    applicationDeadline: '',
    salary: '',
    status: 'draft',
    agentId: '',
  });

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
    { id: '1', question: '', category: 'technical', isRequired: true }
  ]);

  const [skillInput, setSkillInput] = useState('');

  const aiAgents = [
    { id: '1', name: 'Senior Technical Interviewer', type: 'Technical' },
    { id: '2', name: 'Product Management Interviewer', type: 'Product' },
    { id: '3', name: 'Behavioral Interviewer', type: 'Behavioral' },
  ];

  const addQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      { id: Date.now().toString(), question: '', category: 'technical', isRequired: false }
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

    if (skillInput.trim() && !formData.skillsRequired.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skillsRequired: [...formData.skillsRequired, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skillsRequired: formData.skillsRequired.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };


  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.JOBS);
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
              {/* <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Department *
                </label>
                <Input
                  required
                  placeholder="e.g., Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div> */}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Employment Type *
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Principal</option>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Work Mode *
                </label>
                <Select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Application Deadline
                </label>
                <Input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
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
                {formData.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsRequired.map((skill, index) => (
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
                Salary Range
              </label>
              <Input
                placeholder="e.g., $120,000 - $180,000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
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
              <Badge variant="neutral">Required</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Select an AI agent to conduct interviews for this position, or create a new one.
            </p>
            <div className="space-y-3">
              {aiAgents.map((agent) => (
                <label
                  key={agent.id}
                  className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors"
                  style={{
                    borderColor: formData.agentId === agent.id ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)'
                  }}
                >
                  <input
                    type="radio"
                    name="agent"
                    value={agent.id}
                    checked={formData.agentId === agent.id}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-secondary">{agent.name}</p>
                    <p className="text-sm text-neutral-600">{agent.type} Interview Specialist</p>
                  </div>
                  {formData.agentId === agent.id && (
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
              Add role-specific questions that the AI agent will ask during interviews.
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

                <div className="grid md:grid-cols-2 gap-3">
                  {/* <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Category *
                    </label>
                    <Select
                      value={question.category}
                      onChange={(e) => updateQuestion(question.id, 'category', e.target.value)}
                    >
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="situational">Situational</option>
                      <option value="experience">Experience</option>
                      <option value="culture-fit">Culture Fit</option>
                    </Select>
                  </div> */}
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={(e) => updateQuestion(question.id, 'isRequired', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm font-medium text-secondary">Required Question</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.JOBS)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formData.agentId}>
            <Save className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </form>
    </div>
  );
};
