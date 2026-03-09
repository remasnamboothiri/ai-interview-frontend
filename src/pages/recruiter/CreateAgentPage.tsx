import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import { Bot, Plus, Trash2, Save, X, Sliders } from 'lucide-react';
import { ROUTES } from '@/constants';
import agentService from '@/services/agentService';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/contexts/AuthContext';

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

export const CreateAgentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin';

  const [companies, setCompanies] = useState<any[]>([]);
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
    // Recruiter can only create private agents
    agent_type: isAdmin ? 'private' : 'private',
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
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await adminService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
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
        // Include questions for backend to save
        default_questions: customQuestions
          .filter(q => q.question.trim())
          .map(q => ({ question_text: q.question.trim() })),
      };

      if (formData.agent_type === 'private' && formData.company_id) {
        agentData.company_id = parseInt(formData.company_id);
      } else {
        agentData.company_id = null;
      }
      
      await agentService.createAgent(agentData);
      alert('Agent created successfully!');
      navigate(ROUTES.AI_AGENTS);
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert('Failed to create agent. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Create AI Interview Agent</h1>
            <p className="text-neutral-600">Configure agent personality and evaluation criteria</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate(ROUTES.AI_AGENTS)}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              <p className="text-xs text-neutral-500 mt-1">
                This prompt defines how the AI will behave during interviews
              </p>
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

        {/* ── Agent Type — Admin sees both, Recruiter sees only Private ── */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Global option — only visible to admin */}
              {isAdmin && (
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
                    <p className="text-sm text-neutral-600">Available to all companies on the platform</p>
                  </div>
                  {formData.agent_type === 'global' && (
                    <Badge variant="success">Selected</Badge>
                  )}
                </label>
              )}

              {/* Private option — visible to both */}
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

              {/* Info for recruiter */}
              {!isAdmin && (
                <p className="text-xs text-neutral-500 italic">
                  Recruiters can only create private agents for their company.
                </p>
              )}
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
              <p className="text-xs text-neutral-500 mt-1">
                Lower = More focused and deterministic, Higher = More creative and varied
              </p>
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
              <p className="text-xs text-neutral-500 mt-1">
                Maximum length of AI responses (500-4000)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Evaluation Criteria</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={totalWeight === 100 ? 'success' : 'warning'}>
                  Total: {totalWeight}%
                </Badge>
                <Button type="button" size="sm" onClick={addCriteria}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Criteria
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              Define how the AI will evaluate candidates. Weights must total 100%.
            </p>

            {evaluationCriteria.map((criteria, index) => (
              <div key={criteria.id} className="flex items-center gap-3 p-3 border-2 border-neutral-200 rounded-lg">
                <span className="text-sm font-medium text-neutral-500 w-8">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <Input
                    required
                    placeholder="e.g., Technical Knowledge"
                    value={criteria.name}
                    onChange={(e) => updateCriteria(criteria.id, 'name', e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      required
                      placeholder="0"
                      value={criteria.weight}
                      onChange={(e) => updateCriteria(criteria.id, 'weight', parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-neutral-600">%</span>
                  </div>
                </div>
                {evaluationCriteria.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCriteria(criteria.id)}
                  >
                    <Trash2 className="w-4 h-4 text-error" />
                  </Button>
                )}
              </div>
            ))}

            {totalWeight !== 100 && (
              <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="text-sm text-warning-800">
                  Weights must total 100%. Current total: {totalWeight}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Default Interview Questions</CardTitle>
              <Button type="button" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              Define standard questions this agent will ask. Can be customized per job.
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
                    placeholder="e.g., Can you walk me through your approach to system design?"
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.AI_AGENTS)}>
            Cancel
          </Button>
          <Button type="submit" disabled={totalWeight !== 100}>
            <Save className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </form>
    </div>
  );
};



// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select, Badge } from '@/components/ui';
// import { Bot, Plus, Trash2, Save, X, Sliders } from 'lucide-react';
// import { ROUTES } from '@/constants';
// import agentService from '@/services/agentService';
// import { adminService } from '@/services/adminService';

// interface CustomQuestion {
//   id: string;
//   question: string;
//   category: string;
//   evaluationCriteria: string;
//   weight: number;
// }

// interface EvaluationCriteria {
//   id: string;
//   name: string;
//   weight: number;
// }

// export const CreateAgentPage = () => {
//   const navigate = useNavigate();
//   const [companies, setCompanies] = useState<any[]>([]);
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     interview_type: 'technical',
//     ai_model: 'gpt-4',
//     temperature: 0.7,
//     max_tokens: 2000,
//     system_prompt: '',
//     language: 'english',
//     voice_settings: 'professional-male',
//     is_active: true,
//     agent_type: 'private',
//     company_id: '',
//   });

//   const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria[]>([
//     { id: '1', name: 'Technical Knowledge', weight: 30 },
//     { id: '2', name: 'Problem Solving', weight: 25 },
//     { id: '3', name: 'Communication', weight: 20 },
//     { id: '4', name: 'Experience', weight: 15 },
//     { id: '5', name: 'Culture Fit', weight: 10 },
//   ]);

//   const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
//     {
//       id: '1',
//       question: '',
//       category: 'technical',
//       evaluationCriteria: 'Technical Knowledge',
//       weight: 1
//     }
//   ]);

//   useEffect(() => {
//     loadCompanies();
//   }, []);

//   const loadCompanies = async () => {
//     try {
//       const data = await adminService.getAllCompanies();
//       setCompanies(data);
//     } catch (error) {
//       console.error('Failed to load companies:', error);
//     }
//   };

//   const addCriteria = () => {
//     setEvaluationCriteria([
//       ...evaluationCriteria,
//       { id: Date.now().toString(), name: '', weight: 0 }
//     ]);
//   };

//   const removeCriteria = (id: string) => {
//     setEvaluationCriteria(evaluationCriteria.filter(c => c.id !== id));
//   };

//   const updateCriteria = (id: string, field: keyof EvaluationCriteria, value: string | number) => {
//     setEvaluationCriteria(evaluationCriteria.map(c =>
//       c.id === id ? { ...c, [field]: value } : c
//     ));
//   };

//   const addQuestion = () => {
//     setCustomQuestions([
//       ...customQuestions,
//       {
//         id: Date.now().toString(),
//         question: '',
//         category: 'technical',
//         evaluationCriteria: evaluationCriteria[0]?.name || '',
//         weight: 1
//       }
//     ]);
//   };

//   const removeQuestion = (id: string) => {
//     setCustomQuestions(customQuestions.filter(q => q.id !== id));
//   };

//   const updateQuestion = (id: string, field: keyof CustomQuestion, value: string | number) => {
//     setCustomQuestions(customQuestions.map(q =>
//       q.id === id ? { ...q, [field]: value } : q
//     ));
//   };

//   const totalWeight = evaluationCriteria.reduce((sum, c) => sum + c.weight, 0);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (totalWeight !== 100) {
//       alert('Evaluation criteria weights must total 100%');
//       return;
//     }

//     try {
//       // Prepare agent data with proper type handling
//       const agentData: any = {
//         name: formData.name,
//         description: formData.description,
//         interview_type: formData.interview_type,
//         ai_model: formData.ai_model,
//         temperature: formData.temperature,
//         max_tokens: formData.max_tokens,
//         system_prompt: formData.system_prompt,
//         language: formData.language,
//         voice_settings: formData.voice_settings,
//         is_active: formData.is_active,
//         agent_type: formData.agent_type,
//       };

//       // Only add company_id if agent_type is 'private' and company_id exists
//       if (formData.agent_type === 'private' && formData.company_id) {
//         agentData.company_id = parseInt(formData.company_id);
//       } else {
//         agentData.company_id = null;
//       }
      
//       await agentService.createAgent(agentData);
//       alert('Agent created successfully!');
//       navigate(ROUTES.AI_AGENTS);
//     } catch (error) {
//       console.error('Failed to create agent:', error);
//       alert('Failed to create agent. Please try again.');
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
//             <Bot className="w-6 h-6 text-primary-600" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-secondary">Create AI Interview Agent</h1>
//             <p className="text-neutral-600">Configure agent personality and evaluation criteria</p>
//           </div>
//         </div>
//         <Button variant="ghost" onClick={() => navigate(ROUTES.AI_AGENTS)}>
//           <X className="w-4 h-4 mr-2" />
//           Cancel
//         </Button>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Basic Configuration</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-secondary mb-2">
//                   Agent Name *
//                 </label>
//                 <Input
//                   required
//                   placeholder="e.g., Senior Technical Interviewer"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-secondary mb-2">
//                   Interview Type *
//                 </label>
//                 <Select
//                   value={formData.interview_type}
//                   onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
//                 >
//                   <option value="technical">Technical</option>
//                   <option value="behavioral">Behavioral</option>
//                   <option value="product">Product</option>
//                   <option value="design">Design</option>
//                   <option value="general">General</option>
//                 </Select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-secondary mb-2">
//                 Description *
//               </label>
//               <Textarea
//                 required
//                 rows={3}
//                 placeholder="Describe the agent's purpose and interview style..."
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-secondary mb-2">
//                 System Prompt *
//               </label>
//               <Textarea
//                 required
//                 rows={5}
//                 placeholder="Define the agent's personality, tone, and interview approach..."
//                 value={formData.system_prompt}
//                 onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
//               />
//               <p className="text-xs text-neutral-500 mt-1">
//                 This prompt defines how the AI will behave during interviews
//               </p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-secondary mb-2">
//                   Language *
//                 </label>
//                 <Select
//                   value={formData.language}
//                   onChange={(e) => setFormData({ ...formData, language: e.target.value })}
//                 >
//                   <option value="english">English</option>
//                   <option value="malayalam">Malayalam</option>
//                 </Select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-secondary mb-2">
//                   Voice Settings *
//                 </label>
//                 <Select
//                   value={formData.voice_settings}
//                   onChange={(e) => setFormData({ ...formData, voice_settings: e.target.value })}
//                 >
//                   <option value="professional-male">Professional Male</option>
//                   <option value="professional-female">Professional Female</option>
//                   <option value="friendly-male">Friendly Male</option>
//                   <option value="friendly-female">Friendly Female</option>
//                   <option value="neutral">Neutral</option>
//                 </Select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-secondary mb-2">
//                 Status *
//               </label>
//               <Select
//                 value={formData.is_active ? 'active' : 'inactive'}
//                 onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
//               >
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Agent Type</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-3">
//               <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors"
//                 style={{
//                   borderColor: formData.agent_type === 'global' ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)'
//                 }}>
//                 <input
//                   type="radio"
//                   name="agentType"
//                   value="global"
//                   checked={formData.agent_type === 'global'}
//                   onChange={(e) => setFormData({ ...formData, agent_type: e.target.value, company_id: '' })}
//                   className="w-4 h-4 text-primary-600"
//                 />
//                 <div className="ml-3 flex-1">
//                   <p className="font-semibold text-secondary">Global</p>
//                   <p className="text-sm text-neutral-600">Available to all companies on the platform</p>
//                 </div>
//                 {formData.agent_type === 'global' && (
//                   <Badge variant="success">Selected</Badge>
//                 )}
//               </label>

//               <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors"
//                 style={{
//                   borderColor: formData.agent_type === 'private' ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)'
//                 }}>
//                 <input
//                   type="radio"
//                   name="agentType"
//                   value="private"
//                   checked={formData.agent_type === 'private'}
//                   onChange={(e) => setFormData({ ...formData, agent_type: e.target.value })}
//                   className="w-4 h-4 text-primary-600"
//                 />
//                 <div className="ml-3 flex-1">
//                   <p className="font-semibold text-secondary">Private</p>
//                   <p className="text-sm text-neutral-600">Only for a specific company</p>
//                 </div>
//                 {formData.agent_type === 'private' && (
//                   <Badge variant="success">Selected</Badge>
//                 )}
//               </label>
//             </div>

//             {formData.agent_type === 'private' && (
//               <div>
//                 <label className="block text-sm font-medium text-secondary mb-2">
//                   Select Company *
//                 </label>
//                 <Select
//                   required
//                   value={formData.company_id}
//                   onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
//                 >
//                   <option value="">Choose a company...</option>
//                   {companies.map((company) => (
//                     <option key={company.id} value={company.id}>
//                       {company.name}
//                     </option>
//                   ))}
//                 </Select>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <Sliders className="w-5 h-5 text-primary-600" />
//               <CardTitle>Model Parameters</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-secondary mb-2">
//                 AI Model *
//               </label>
//               <Select
//                 value={formData.ai_model}
//                 onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
//               >
//                 <option value="gpt-4">GPT-4 (Most Capable)</option>
//                 <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
//                 <option value="claude-3">Claude 3 (Alternative)</option>
//               </Select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-secondary mb-2">
//                 Temperature: {formData.temperature}
//               </label>
//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.1"
//                 value={formData.temperature}
//                 onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
//                 className="w-full"
//               />
//               <p className="text-xs text-neutral-500 mt-1">
//                 Lower = More focused and deterministic, Higher = More creative and varied
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-secondary mb-2">
//                 Max Tokens *
//               </label>
//               <Input
//                 type="number"
//                 min="500"
//                 max="4000"
//                 step="100"
//                 value={formData.max_tokens}
//                 onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
//               />
//               <p className="text-xs text-neutral-500 mt-1">
//                 Maximum length of AI responses (500-4000)
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle>Evaluation Criteria</CardTitle>
//               <div className="flex items-center gap-2">
//                 <Badge variant={totalWeight === 100 ? 'success' : 'warning'}>
//                   Total: {totalWeight}%
//                 </Badge>
//                 <Button type="button" size="sm" onClick={addCriteria}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add Criteria
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <p className="text-sm text-neutral-600">
//               Define how the AI will evaluate candidates. Weights must total 100%.
//             </p>

//             {evaluationCriteria.map((criteria, index) => (
//               <div key={criteria.id} className="flex items-center gap-3 p-3 border-2 border-neutral-200 rounded-lg">
//                 <span className="text-sm font-medium text-neutral-500 w-8">
//                   {index + 1}.
//                 </span>
//                 <div className="flex-1">
//                   <Input
//                     required
//                     placeholder="e.g., Technical Knowledge"
//                     value={criteria.name}
//                     onChange={(e) => updateCriteria(criteria.id, 'name', e.target.value)}
//                   />
//                 </div>
//                 <div className="w-32">
//                   <div className="flex items-center gap-2">
//                     <Input
//                       type="number"
//                       min="0"
//                       max="100"
//                       required
//                       placeholder="0"
//                       value={criteria.weight}
//                       onChange={(e) => updateCriteria(criteria.id, 'weight', parseInt(e.target.value) || 0)}
//                     />
//                     <span className="text-sm text-neutral-600">%</span>
//                   </div>
//                 </div>
//                 {evaluationCriteria.length > 1 && (
//                   <Button
//                     type="button"
//                     size="sm"
//                     variant="ghost"
//                     onClick={() => removeCriteria(criteria.id)}
//                   >
//                     <Trash2 className="w-4 h-4 text-error" />
//                   </Button>
//                 )}
//               </div>
//             ))}

//             {totalWeight !== 100 && (
//               <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
//                 <p className="text-sm text-warning-800">
//                   Weights must total 100%. Current total: {totalWeight}%
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle>Default Interview Questions</CardTitle>
//               <Button type="button" size="sm" onClick={addQuestion}>
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Question
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <p className="text-sm text-neutral-600">
//               Define standard questions this agent will ask. Can be customized per job.
//             </p>

//             {customQuestions.map((question, index) => (
//               <div key={question.id} className="p-4 border-2 border-neutral-200 rounded-xl space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-secondary">
//                     Question {index + 1}
//                   </span>
//                   {customQuestions.length > 1 && (
//                     <Button
//                       type="button"
//                       size="sm"
//                       variant="ghost"
//                       onClick={() => removeQuestion(question.id)}
//                     >
//                       <Trash2 className="w-4 h-4 text-error" />
//                     </Button>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-secondary mb-2">
//                     Question Text *
//                   </label>
//                   <Textarea
//                     required
//                     rows={2}
//                     placeholder="e.g., Can you walk me through your approach to system design?"
//                     value={question.question}
//                     onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
//                   />
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         <div className="flex items-center justify-end gap-3">
//           <Button type="button" variant="outline" onClick={() => navigate(ROUTES.AI_AGENTS)}>
//             Cancel
//           </Button>
//           <Button type="submit" disabled={totalWeight !== 100}>
//             <Save className="w-4 h-4 mr-2" />
//             Create Agent
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };
