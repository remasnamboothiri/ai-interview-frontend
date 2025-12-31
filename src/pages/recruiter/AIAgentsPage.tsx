import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Plus, Bot, Settings, BarChart3, Power } from 'lucide-react';
import { mockAIAgents } from '@/data/mockData';
import { format } from 'date-fns';

export const AIAgentsPage = () => {
  const navigate = useNavigate();

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
        {mockAIAgents.map((agent) => (
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
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Evaluation Criteria
                </h4>
                <div className="space-y-2">
                  {Object.entries(agent.evaluation_criteria).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 w-10 text-right">
                          {(value * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Temperature</p>
                  <p className="text-sm font-semibold text-secondary">
                    {agent.model_parameters.temperature}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">Max Tokens</p>
                  <p className="text-sm font-semibold text-secondary">
                    {agent.model_parameters.max_tokens}
                  </p>
                </div>
              </div>

              <div className="text-xs text-neutral-500 mb-4">
                Last updated: {format(new Date(agent.updated_at), 'MMM d, yyyy')}
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-200">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/ai-agents/${agent.id}/edit`)}>
                  Edit Configuration
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => alert(`System Prompt:\n\n${agent.system_prompt}`)}>
                  View Prompt
                </Button>
                <Button variant="ghost" size="sm" onClick={() => alert(`Toggling agent ${agent.is_active ? 'off' : 'on'}...`)}>
                  <Power className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {mockAIAgents.length === 0 && (
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
