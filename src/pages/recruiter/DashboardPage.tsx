import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatusDot } from '@/components/ui';
import { Briefcase, Users, Video, ClipboardCheck, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants';
import { formatRelativeTime } from '@/utils/format';

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Active Jobs',
      value: 12,
      change: 8.2,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'primary',
    },
    {
      title: 'Total Candidates',
      value: 145,
      change: 12.5,
      icon: <Users className="w-6 h-6" />,
      color: 'primary',
    },
    {
      title: 'Active Interviews',
      value: 8,
      change: -3.1,
      icon: <Video className="w-6 h-6" />,
      color: 'primary',
    },
    {
      title: 'Pending Results',
      value: 23,
      change: 5.8,
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: 'primary',
    },
  ]);

  const recentActivity = [
    {
      id: 1,
      type: 'interview_completed',
      candidate: 'John Doe',
      job: 'Senior Software Engineer',
      time: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed',
    },
    {
      id: 2,
      type: 'interview_scheduled',
      candidate: 'Jane Smith',
      job: 'Product Manager',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'scheduled',
    },
    {
      id: 3,
      type: 'interview_in_progress',
      candidate: 'Mike Johnson',
      job: 'Data Scientist',
      time: new Date(Date.now() - 1000 * 60 * 5),
      status: 'in_progress',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/jobs/create')}
        >
          Create Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-green transition-all cursor-pointer">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-secondary">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        stat.change > 0 ? 'text-primary-600' : 'text-red-600'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        stat.change > 0 ? 'text-primary-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change > 0 ? '+' : ''}
                      {stat.change}%
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <StatusDot active={activity.status === 'in_progress'} className="mt-1.5" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-secondary">{activity.candidate}</p>
                        <p className="text-sm text-neutral-600">{activity.job}</p>
                      </div>
                      <Badge
                        variant={
                          activity.status === 'completed'
                            ? 'success'
                            : activity.status === 'in_progress'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatRelativeTime(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/jobs/create')}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Create New Job
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/candidates/add')}
              >
                <Users className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/interviews/schedule')}
              >
                <Video className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(ROUTES.RESULTS)}
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                View Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
