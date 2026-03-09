import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Plus, Bot, Settings, Power, Trash2, Eye, X, MessageSquare, Sliders } from 'lucide-react';
import { format } from 'date-fns';
import agentService, { Agent } from '@/services/agentService';

export const AIAgentsPage = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAgent, setViewAgent] = useState<Agent | null>(null);
  const [viewQuestions, setViewQuestions] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await agentService.getAllAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }
    try {
      await agentService.deleteAgent(agentId);
      alert('Agent deleted successfully!');
      loadAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
    }
  };

  const handleViewAgent = async (agent: Agent) => {
    setViewAgent(agent);
    setViewLoading(true);
    try {
      const questions = await agentService.getAgentQuestions(agent.id);
      setViewQuestions(questions || []);
    } catch (err) {
      console.warn('Could not load questions:', err);
      setViewQuestions([]);
    } finally {
      setViewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-600">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">AI Agents</h1>
          <p className="text-neutral-600 mt-1">Configure AI interview agents and prompts</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/ai-agents/create')}>
          Create Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-1">
                      {agent.name}
                    </h3>
                    <Badge variant={agent.is_active ? 'success' : 'neutral'}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/ai-agents/${agent.id}/edit`)}>
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-neutral-700 mb-4">{agent.description}</p>

              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Agent Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Type:</span>
                    <span className="font-medium text-secondary capitalize">{agent.interview_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Language:</span>
                    <span className="font-medium text-secondary capitalize">{agent.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Agent Type:</span>
                    <Badge variant={agent.agent_type === 'global' ? 'success' : 'neutral'}>
                      {agent.agent_type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">AI Model</p>
                  <p className="text-sm font-semibold text-secondary">{agent.ai_model}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Temperature</p>
                  <p className="text-sm font-semibold text-secondary">{agent.temperature}</p>
                </div>
              </div>

              <div className="text-xs text-neutral-500 mb-4">
                Last updated: {agent.updated_at ? format(new Date(agent.updated_at), 'MMM d, yyyy') : 'N/A'}
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-200">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewAgent(agent)}>
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/ai-agents/${agent.id}/edit`)}>
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteAgent(agent.id)}
                  className="text-error hover:text-error hover:bg-error-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {agents.length === 0 && (
          <Card className="col-span-full">
            <CardContent>
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No AI agents configured yet</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* VIEW AGENT DETAIL MODAL                               */}
      {/* ══════════════════════════════════════════════════════ */}
      {viewAgent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewAgent(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary">{viewAgent.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={viewAgent.is_active ? 'success' : 'neutral'}>
                      {viewAgent.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={viewAgent.agent_type === 'global' ? 'success' : 'neutral'}>
                      {viewAgent.agent_type}
                    </Badge>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewAgent(null)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-neutral-700">{viewAgent.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Interview Type</p>
                  <p className="text-sm font-semibold text-secondary capitalize">{viewAgent.interview_type}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Language</p>
                  <p className="text-sm font-semibold text-secondary capitalize">{viewAgent.language}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">AI Model</p>
                  <p className="text-sm font-semibold text-secondary">{viewAgent.ai_model}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Temperature</p>
                  <p className="text-sm font-semibold text-secondary">{viewAgent.temperature}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Max Tokens</p>
                  <p className="text-sm font-semibold text-secondary">{viewAgent.max_tokens}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Voice Settings</p>
                  <p className="text-sm font-semibold text-secondary capitalize">{viewAgent.voice_settings?.replace('-', ' ')}</p>
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> System Prompt
                </h3>
                <div className="bg-neutral-50 rounded-lg p-4 text-sm text-neutral-700 whitespace-pre-wrap max-h-40 overflow-y-auto border border-neutral-200">
                  {viewAgent.system_prompt || 'No system prompt configured'}
                </div>
              </div>

              {/* Default Questions */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Default Interview Questions
                </h3>
                {viewLoading ? (
                  <p className="text-sm text-neutral-500">Loading questions...</p>
                ) : viewQuestions.length > 0 ? (
                  <div className="space-y-2">
                    {viewQuestions.map((q: any, index: number) => (
                      <div key={q.id || index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-sm text-neutral-700">{q.question_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 italic">No default questions configured</p>
                )}
              </div>

              {/* Timestamps */}
              <div className="flex gap-4 text-xs text-neutral-500 pt-3 border-t border-neutral-200">
                <p>Created: {viewAgent.created_at ? format(new Date(viewAgent.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}</p>
                <p>Updated: {viewAgent.updated_at ? format(new Date(viewAgent.updated_at), 'MMM d, yyyy HH:mm') : 'N/A'}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-neutral-200">
              <Button variant="primary" className="flex-1" onClick={() => { setViewAgent(null); navigate(`/ai-agents/${viewAgent.id}/edit`); }}>
                Edit Agent
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setViewAgent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};