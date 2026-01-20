import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input } from '@/components/ui';
import { ArrowLeft, Search, UserPlus, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';

export const CompanyRecruitersPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // State to store the list of recruiters
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch recruiters when the page loads
  useEffect(() => {
  const fetchRecruiters = async () => {
    try {
      console.log('Fetching recruiters for company:', id); // DEBUG
      
      // Get all users from the backend
      const usersData = await adminService.getAllUsers();
      console.log('All users:', usersData); // DEBUG
      
      // Filter to get only recruiters for this specific company
      const companyRecruiters = usersData.filter((user) => {
        console.log(`User: ${user.full_name}, company_id: ${user.company_id}, role: ${user.role}`); // DEBUG
        return user.company_id === Number(id) && user.role === 'recruiter';
        //     ↑ FIXED! Using direct field company_id
      });
      
      console.log('Found recruiters:', companyRecruiters); // DEBUG
      
      // Save the recruiters to state
      setRecruiters(companyRecruiters);
    } catch (error) {
      console.error('Failed to fetch recruiters:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchRecruiters();
}, [id]);


  // Filter recruiters based on search term
  const filteredRecruiters = recruiters.filter((recruiter) =>
    recruiter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading message while fetching data
  if (loading) {
    return <div className="p-8 text-center">Loading recruiters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/admin/companies/${id}`)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company
          </Button>
          <h1 className="text-3xl font-bold text-secondary">Company Recruiters</h1>
          <p className="text-neutral-600 mt-1">Manage recruiters for this company</p>
        </div>
        <Button 
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => navigate(`/admin/companies/${id}/add-recruiter`)}
        >
          Add Recruiter
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input 
              placeholder="Search recruiters..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredRecruiters.length === 0 ? (
              <p className="text-center text-neutral-500 py-8">
                {searchTerm 
                  ? 'No recruiters match your search' 
                  : 'No recruiters found for this company. Click "Add Recruiter" to add one.'}
              </p>
            ) : (
              filteredRecruiters.map((recruiter) => (
                <div
                  key={recruiter.id}
                  className="p-4 border-2 border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-lg font-bold text-primary-600">
                        {recruiter.full_name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary mb-1">{recruiter.full_name}</h3>
                        <div className="space-y-1 text-sm text-neutral-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {recruiter.email}
                          </div>
                          {recruiter.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {recruiter.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={recruiter.status === 'active' ? 'success' : 'neutral'}>
                        {recruiter.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/admin/users/${recruiter.id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
