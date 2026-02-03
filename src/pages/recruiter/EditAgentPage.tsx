import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import { Bot, Plus, Trash2, Save, X, Sliders } from 'lucide-react';
import { ROUTES } from '@/constants';
import agentService from '@/services/agentService';
import { adminService } from '@/services/adminService';

interface CustomQuestion {
  id: string;
  question: string;
  category: string;
  evaluationCriteria: string;
  weight: number;
}

interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
}

export const EditAgentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();  // Get agent ID from URL
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interview_type: 'technical',
    ai_model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000,
    system_prompt: '',
    language: 'english',
    voice_settings: 'professional-male',
    is_active: true,
    agent_type: 'private',
    company_id: '',
  });

  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria[]>([
    { id: '1', name: 'Technical Knowledge', weight: 30 },
    { id: '2', name: 'Problem Solving', weight: 25 },
    { id: '3', name: 'Communication', weight: 20 },
    { id: '4', name: 'Experience', weight: 15 },
    { id: '5', name: 'Culture Fit', weight: 10 },
  ]);

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
    {
      id: '1',
      question: '',
      category: 'technical',
      evaluationCriteria: 'Technical Knowledge',
      weight: 1
    }
  ]);

  useEffect(() => {
    loadCompanies();
    loadAgentData();
  }, [id]);

  const loadCompanies = async () => {
    try {
      const data = await adminService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const loadAgentData = async () => {
    if (!id) return;
    
    try {
      const agent = await agentService.getAgent(parseInt(id));
      
      // Populate form with existing data
      setFormData({
        name: agent.name,
        description: agent.description,
        interview_type: agent.interview_type,
        ai_model: agent.ai_model,
        temperature: agent.temperature,
        max_tokens: agent.max_tokens,
        system_prompt: agent.system_prompt,
        language: agent.language,
        voice_settings: agent.voice_settings,
        is_active: agent.is_active,
        agent_type: agent.agent_type,
        company_id: agent.company_id ? agent.company_id.toString() : '',
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load agent:', error);
      alert('Failed to load agent data');
      navigate(ROUTES.AI_AGENTS);
    }
  };

  const addCriteria = () => {
    setEvaluationCriteria([
      ...evaluationCriteria,
      { id: Date.now().toString(), name: '', weight: 0 }
    ]);
  };

  const removeCriteria = (id: string) => {
    setEvaluationCriteria(evaluationCriteria.filter(c => c.id !== id));
  };

  const updateCriteria = (id: string, field: keyof EvaluationCriteria, value: string | number) => {
    setEvaluationCriteria(evaluationCriteria.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const addQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      {
        id: Date.now().toString(),
        question: '',
        category: 'technical',
        evaluationCriteria: evaluationCriteria[0]?.name || '',
        weight: 1
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof CustomQuestion, value: string | number) => {
    setCustomQuestions(customQuestions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const totalWeight = evaluationCriteria.reduce((sum, c) => sum + c.weight, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      alert('Evaluation criteria weights must total 100%');
      return;
    }

    if (!id) return;

    try {
      const agentData: any = {
        name: formData.name,
        description: formData.description,
        interview_type: formData.interview_type,
        ai_model: formData.ai_model,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        system_prompt: formData.system_prompt,
        language: formData.language,
        voice_settings: formData.voice_settings,
        is_active: formData.is_active,
        agent_type: formData.agent_type,
      };

      if (formData.agent_type === 'private' && formData.company_id) {
        agentData.company_id = parseInt(formData.company_id);
      } else {
        agentData.company_id = null;
      }
      
      await agentService.updateAgent(parseInt(id), agentData);
      alert('Agent updated successfully!');
      navigate(ROUTES.AI_AGENTS);
    } catch (error) {
      console.error('Failed to update agent:', error);
      alert('Failed to update agent. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-600">Loading agent data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Edit AI Interview Agent</h1>
            <p className="text-neutral-600">Update agent configuration and settings</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate(ROUTES.AI_AGENTS)}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Same form fields as CreateAgentPage but with pre-filled data */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Agent Name *
                </label>
                <Input
                  required
                  placeholder="e.g., Senior Technical Interviewer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Interview Type *
                </label>
                <Select
                  value={formData.interview_type}
                  onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="product">Product</option>
                  <option value="design">Design</option>
                  <option value="general">General</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Description *
              </label>
              <Textarea
                required
                rows={3}
                placeholder="Describe the agent's purpose and interview style..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                System Prompt *
              </label>
              <Textarea
                required
                rows={5}
                placeholder="Define the agent's personality, tone, and interview approach..."
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Language *
                </label>
                <Select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                >
                  <option value="english">English</option>
                  <option value="malayalam">Malayalam</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Voice Settings *
                </label>
                <Select
                  value={formData.voice_settings}
                  onChange={(e) => setFormData({ ...formData, voice_settings: e.target.value })}
                >
                  <option value="professional-male">Professional Male</option>
                  <option value="professional-female">Professional Female</option>
                  <option value="friendly-male">Friendly Male</option>
                  <option value="friendly-female">Friendly Female</option>
                  <option value="neutral">Neutral</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Status *
              </label>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Agent Type Card - Same as Create */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors"
                style={{
                  borderColor: formData.agent_type === 'global' ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)'
                }}>
                <input
                  type="radio"
                  name="agentType"
                  value="global"
                  checked={formData.agent_type === 'global'}
                  onChange={(e) => setFormData({ ...formData, agent_type: e.target.value, company_id: '' })}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-secondary">Global</p>
                  <p className="text-sm text-neutral-600">Available to all companies</p>
                </div>
                {formData.agent_type === 'global' && (
                  <Badge variant="success">Selected</Badge>
                )}
              </label>

              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors"
                style={{
                  borderColor: formData.agent_type === 'private' ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)'
                }}>
                <input
                  type="radio"
                  name="agentType"
                  value="private"
                  checked={formData.agent_type === 'private'}
                  onChange={(e) => setFormData({ ...formData, agent_type: e.target.value })}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-secondary">Private</p>
                  <p className="text-sm text-neutral-600">Only for a specific company</p>
                </div>
                {formData.agent_type === 'private' && (
                  <Badge variant="success">Selected</Badge>
                )}
              </label>
            </div>

            {formData.agent_type === 'private' && (
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Select Company *
                </label>
                <Select
                  required
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                >
                  <option value="">Choose a company...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Parameters - Same as Create */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary-600" />
              <CardTitle>Model Parameters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                AI Model *
              </label>
              <Select
                value={formData.ai_model}
                onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
              >
                <option value="gpt-4">GPT-4 (Most Capable)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                <option value="claude-3">Claude 3 (Alternative)</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Temperature: {formData.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Max Tokens *
              </label>
              <Input
                type="number"
                min="500"
                max="4000"
                step="100"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.AI_AGENTS)}>
            Cancel
          </Button>
          <Button type="submit" disabled={totalWeight !== 100}>
            <Save className="w-4 h-4 mr-2" />
            Update Agent
          </Button>
        </div>
      </form>
    </div>
  );
};
