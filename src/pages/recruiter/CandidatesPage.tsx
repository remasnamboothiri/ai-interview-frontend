import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input, Loading } from '@/components/ui';
import { Plus, Search, Mail, Phone, Briefcase, Calendar, Trash2} from 'lucide-react';
import { candidateService, Candidate } from '@/services/candidateService';
import { formatRelativeTime } from '@/utils/format';

export const CandidatesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteCandidate = async (candidateId: number) => {
    if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }

    try {
      await candidateService.deleteCandidate(candidateId.toString());
      alert('Candidate deleted successfully!');
      loadCandidates(); // Reload the list
    } catch (err) {
      alert('Failed to delete candidate. Please try again.');
      console.error('Delete error:', err);
    }
  };


  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      (candidate.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <Button variant="outline" size="sm" onClick={loadCandidates} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

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
                    {candidate.full_name || 'No Name'}
                  </h3>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{candidate.email || 'No email'}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.current_company && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{candidate.current_company}</span>
                  </div>
                )}
                {candidate.created_at && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Added {formatRelativeTime(new Date(candidate.created_at))}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  View Profile
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => handleDeleteCandidate(candidate.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCandidates.length === 0 && !isLoading && (
          <Card className="col-span-full">
            <CardContent>
              <div className="text-center py-12">
                <Plus className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No candidates found</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/candidates/add')}
                >
                  Add First Candidate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
