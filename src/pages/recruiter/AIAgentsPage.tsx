import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Plus, Bot, Settings, BarChart3, Power, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import agentService, { Agent } from '@/services/agentService';

export const AIAgentsPage = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

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
      loadAgents(); // Reload the list
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
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
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                  Agent Details
                </h4>
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
                  <p className="text-sm font-semibold text-secondary">
                    {agent.ai_model}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Temperature</p>
                  <p className="text-sm font-semibold text-secondary">
                    {agent.temperature}
                  </p>
                </div>
              </div>

              <div className="text-xs text-neutral-500 mb-4">
                Last updated: {agent.updated_at ? format(new Date(agent.updated_at), 'MMM d, yyyy') : 'N/A'}
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-200">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/ai-agents/${agent.id}/edit`)}>
                  Edit Configuration
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => alert(`System Prompt:\n\n${agent.system_prompt}`)}>
                  View Prompt
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
    </div>
  );
};
