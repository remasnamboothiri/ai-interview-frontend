import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input, Select } from '@/components/ui';
import { Plus, Search, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { mockCandidates, mockJobs } from '@/data/mockData';
import { formatRelativeTime } from '@/utils/format';
import { CANDIDATE_STATUSES } from '@/constants';

export const CandidatesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch = candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getJobTitle = (jobId?: string) => {
    return mockJobs.find(j => j.id === jobId)?.title || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Candidates</h1>
          <p className="text-neutral-600 mt-1">Manage candidate profiles and applications</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/candidates/add')}>
          Add Candidate
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            >
              <option value="all">All Statuses</option>
              <option value={CANDIDATE_STATUSES.NEW}>New</option>
              <option value={CANDIDATE_STATUSES.INVITED}>Invited</option>
              <option value={CANDIDATE_STATUSES.IN_PROGRESS}>In Progress</option>
              <option value={CANDIDATE_STATUSES.COMPLETED}>Completed</option>
              <option value={CANDIDATE_STATUSES.REJECTED}>Rejected</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary mb-1">
                    {candidate.full_name}
                  </h3>
                  <Badge
                    variant={
                      candidate.status === 'completed' ? 'success' :
                      candidate.status === 'rejected' ? 'danger' :
                      candidate.status === 'in_progress' || candidate.status === 'invited' ? 'warning' :
                      'neutral'
                    }
                  >
                    {candidate.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.job_id && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{getJobTitle(candidate.job_id)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Applied {formatRelativeTime(new Date(candidate.created_at))}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/candidates/${candidate.id}`)}>
                  View Profile
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate('/interviews/schedule')}>
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCandidates.length === 0 && (
          <Card className="col-span-full">
            <CardContent>
              <div className="text-center py-12">
                <Plus className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No candidates found matching your filters</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
