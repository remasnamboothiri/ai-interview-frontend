import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Edit, Users, Calendar, TrendingUp, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockJob = {
  id: '1',
  title: 'Senior Software Engineer',
  department: 'Engineering',
  location: 'Remote',
  type: 'full-time',
  status: 'active',
  posted_date: new Date('2024-12-01'),
  description: 'We are seeking an experienced Senior Software Engineer to join our growing team...',
  requirements: 'Requirements: 5+ years of experience, Strong knowledge of React and TypeScript...',
  salary: '$120,000 - $180,000',
  stats: {
    views: 342,
    applications: 45,
    interviews_scheduled: 12,
    interviews_completed: 8,
    offers_made: 2,
  },
  applicationsOverTime: [
    { date: 'Week 1', count: 8 },
    { date: 'Week 2', count: 12 },
    { date: 'Week 3', count: 15 },
    { date: 'Week 4', count: 10 },
  ],
};

export const JobDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">View Public Page</Button>
          <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
            Edit Job
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary mb-2">{mockJob.title}</h1>
              <div className="flex items-center gap-3 text-neutral-600">
                <span>{mockJob.department}</span>
                <span>•</span>
                <span>{mockJob.location}</span>
                <span>•</span>
                <span className="capitalize">{mockJob.type}</span>
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Posted {format(mockJob.posted_date, 'MMMM dd, yyyy')}
              </p>
            </div>
            <Badge variant={mockJob.status === 'active' ? 'success' : 'neutral'} className="text-base px-4 py-2">
              {mockJob.status}
            </Badge>
          </div>
          {mockJob.salary && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-neutral-600">Salary Range</p>
              <p className="text-xl font-bold text-primary-600">{mockJob.salary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-primary-600" />
              <p className="text-sm text-neutral-600">Views</p>
            </div>
            <p className="text-3xl font-bold text-secondary">{mockJob.stats.views}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-neutral-600">Applications</p>
            </div>
            <p className="text-3xl font-bold text-secondary">{mockJob.stats.applications}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <p className="text-sm text-neutral-600">Scheduled</p>
            </div>
            <p className="text-3xl font-bold text-secondary">{mockJob.stats.interviews_scheduled}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-secondary">{mockJob.stats.interviews_completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-2">Offers</p>
            <p className="text-3xl font-bold text-secondary">{mockJob.stats.offers_made}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockJob.applicationsOverTime}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 leading-relaxed">{mockJob.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 leading-relaxed">{mockJob.requirements}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applicants</CardTitle>
            <Button size="sm" onClick={() => navigate('/candidates')}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['John Doe', 'Sarah Wilson', 'Mike Johnson'].map((name, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border-2 border-neutral-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{name}</p>
                    <p className="text-sm text-neutral-600">Applied 2 days ago</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">View Profile</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
