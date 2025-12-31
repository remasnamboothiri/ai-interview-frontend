import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Input } from '@/components/ui';
import { ArrowLeft, Search, UserPlus, Mail, Phone } from 'lucide-react';

const mockRecruiters = [
  { id: '1', name: 'Jane Smith', email: 'jane.smith@techcorp.com', phone: '+1 (555) 111-2222', status: 'active', jobs: 12, interviews: 45 },
  { id: '2', name: 'John Doe', email: 'john.doe@techcorp.com', phone: '+1 (555) 222-3333', status: 'active', jobs: 8, interviews: 32 },
  { id: '3', name: 'Sarah Wilson', email: 'sarah.wilson@techcorp.com', phone: '+1 (555) 333-4444', status: 'active', jobs: 15, interviews: 58 },
  { id: '4', name: 'Mike Johnson', email: 'mike.johnson@techcorp.com', phone: '+1 (555) 444-5555', status: 'inactive', jobs: 3, interviews: 12 },
];

export const CompanyRecruitersPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/admin/companies/${id}`)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company
          </Button>
          <h1 className="text-3xl font-bold text-secondary">Company Recruiters</h1>
          <p className="text-neutral-600 mt-1">Manage recruiters for TechCorp Inc.</p>
        </div>
        <Button leftIcon={<UserPlus className="w-4 h-4" />}>
          Add Recruiter
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input placeholder="Search recruiters..." className="pl-10" />
          </div>

          <div className="space-y-3">
            {mockRecruiters.map((recruiter) => (
              <div
                key={recruiter.id}
                className="p-4 border-2 border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-lg font-bold text-primary-600">
                      {recruiter.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary mb-1">{recruiter.name}</h3>
                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {recruiter.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {recruiter.phone}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-neutral-600">
                          <span className="font-semibold">{recruiter.jobs}</span> Jobs
                        </span>
                        <span className="text-neutral-600">
                          <span className="font-semibold">{recruiter.interviews}</span> Interviews
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={recruiter.status === 'active' ? 'success' : 'neutral'}>
                      {recruiter.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
