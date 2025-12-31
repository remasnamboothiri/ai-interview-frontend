import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Mail, Phone, Calendar, Shield, Edit, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const mockUser = {
  id: '1',
  full_name: 'Jane Smith',
  email: 'jane.smith@techcorp.com',
  phone: '+1 (555) 987-6543',
  role: 'recruiter',
  company: 'TechCorp Inc.',
  status: 'active',
  email_verified: true,
  created_at: new Date('2024-01-15'),
  last_login: new Date('2024-12-23T09:30:00'),
  stats: {
    jobs_posted: 12,
    candidates_added: 45,
    interviews_conducted: 38,
    hires_made: 8,
  },
};

export const UserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
            Edit User
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Ban className="w-4 h-4" />}>
            Suspend
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
              {mockUser.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary">{mockUser.full_name}</h1>
                <Badge variant={mockUser.status === 'active' ? 'success' : 'error'}>
                  {mockUser.status}
                </Badge>
                {mockUser.email_verified && (
                  <Badge variant="info" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-neutral-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {mockUser.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {mockUser.phone}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="primary" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {mockUser.role}
                </Badge>
                <span className="text-neutral-600">Company: {mockUser.company}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Jobs Posted</p>
            <p className="text-3xl font-bold text-secondary">{mockUser.stats.jobs_posted}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Candidates</p>
            <p className="text-3xl font-bold text-secondary">{mockUser.stats.candidates_added}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Interviews</p>
            <p className="text-3xl font-bold text-secondary">{mockUser.stats.interviews_conducted}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Hires Made</p>
            <p className="text-3xl font-bold text-secondary">{mockUser.stats.hires_made}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Account Created</p>
              <p className="font-semibold text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(mockUser.created_at, 'MMMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Last Login</p>
              <p className="font-semibold text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(mockUser.last_login, 'MMMM dd, yyyy • hh:mm a')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border-2 border-neutral-100 rounded-lg">
              <p className="font-medium text-secondary">Created job posting</p>
              <p className="text-sm text-neutral-600">Senior Software Engineer • 2 hours ago</p>
            </div>
            <div className="p-3 border-2 border-neutral-100 rounded-lg">
              <p className="font-medium text-secondary">Scheduled interview</p>
              <p className="text-sm text-neutral-600">John Doe • 5 hours ago</p>
            </div>
            <div className="p-3 border-2 border-neutral-100 rounded-lg">
              <p className="font-medium text-secondary">Added candidate</p>
              <p className="text-sm text-neutral-600">Sarah Wilson • Yesterday</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
