import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Building, Mail, Phone, Globe, Calendar, Users, Briefcase, Edit, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react'; // <-- Add this
import { adminService, Company } from '@/services/adminService'; // <-- 

// const mockCompany = {
//   id: '1',
//   name: 'TechCorp Inc.',
//   email: 'contact@techcorp.com',
//   phone: '+1 (555) 100-2000',
//   website: 'www.techcorp.com',
//   industry: 'Technology',
//   size: '500-1000',
//   status: 'active',
//   subscription: 'Enterprise',
//   created_at: new Date('2024-01-10'),
//   stats: {
//     recruiters: 8,
//     jobs_active: 12,
//     jobs_total: 45,
//     candidates: 234,
//     interviews_conducted: 189,
//   },
// };

export const CompanyDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // 1. Create a variable to hold the real company data
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  // 2. Fetch the data when the page loads
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (id) {
          const data = await adminService.getCompany(Number(id)); // Ask backend for data
          setCompany(data); // Save it to our variable
        }
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);
  // 3. Show a loading message while waiting
  if (loading) return <div>Loading...</div>;
  if (!company) return <div>Company not found</div>;
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/companies')} >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          leftIcon={<Edit className="w-4 h-4" />}
          onClick={() => navigate(`/admin/companies/${id}/edit`)}
        >
          Edit Company
        </Button>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-xl flex items-center justify-center">
              <Building className="w-12 h-12 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary">{company.name}</h1>
                <Badge variant={company.status === 'active' ? 'success' : 'danger'}>
                  {company.status}
                </Badge>
                {/* <Badge variant="neutral">{company.subscription}</Badge> */}
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {company.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {company.website}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {/* Joined {format(company.created_at, 'MMMM yyyy')} */}
                  Joined {company.created_at ? format(new Date(company.created_at), 'MMMM yyyy') : 'N/A'}
                </div>
              </div>
              <div className="flex gap-3">
                <Badge variant="neutral">{company.industry}</Badge>
                <Badge variant="neutral">{company.size} employees</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary-600" />
              <p className="text-sm text-neutral-600">Recruiters</p>
            </div>
            {/* <p className="text-3xl font-bold text-secondary">{company.stats.recruiters}</p> */}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-neutral-600">Active Jobs</p>
            </div>
            {/* <p className="text-3xl font-bold text-secondary">{company.stats.jobs_active}</p> */}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Total Jobs</p>
            {/* <p className="text-3xl font-bold text-secondary">{company.stats.jobs_total}</p> */}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Candidates</p>
            {/* <p className="text-3xl font-bold text-secondary">{company.stats.candidates}</p> */}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Interviews</p>
            {/* <p className="text-3xl font-bold text-secondary">{company.stats.interviews_conducted}</p> */}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recruiters</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate(`/admin/companies/${id}/recruiters`)}>
                View All
              </Button>
              <Button size="sm" onClick={() => navigate(`/admin/companies/${id}/add-recruiter`)}>
                <UserPlus className="w-4 h-4 mr-1" />
                Add Recruiter
              </Button>
            </div>

            {/* <Button size="sm" onClick={() => navigate(`/admin/companies/${id}/recruiters`)}>
              View All
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Jane Smith', 'John Doe', 'Sarah Wilson'].map((name, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border-2 border-neutral-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{name}</p>
                    <p className="text-sm text-neutral-600">{name.toLowerCase().replace(' ', '.')}@techcorp.com</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
