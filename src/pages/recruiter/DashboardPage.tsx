import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatusDot } from '@/components/ui';
import { Briefcase, Users, Video, ClipboardCheck, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants';
import { formatRelativeTime } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';

const API_URL = `${API_BASE_URL}/api`;

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: number;
  type: string;
  candidate: string;
  job: string;
  time: Date;
  status: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Active Jobs',
      value: 0,
      change: 0,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'primary',
    },
    {
      title: 'Total Candidates',
      value: 0,
      change: 0,
      icon: <Users className="w-6 h-6" />,
      color: 'primary',
    },
    {
      title: 'Active Interviews',
      value: 0,
      change: 0,
      icon: <Video className="w-6 h-6" />,
      color: 'primary',
    },
    {
      title: 'Pending Results',
      value: 0,
      change: 0,
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: 'primary',
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    fetchRecruiterStats();
    fetchRecentActivity();
  }, []);

  const fetchRecruiterStats = async () => {
    try {
      const recruiterId = user?.id;

      // Fetch real data from backend
      const jobsResponse = await axios.get(`${API_URL}/jobs/?recruiter=${recruiterId}&status=active`);
      const candidatesResponse = await axios.get(`${API_URL}/candidates/`);
      const interviewsResponse = await axios.get(`${API_URL}/interviews/?recruiter=${recruiterId}&status=scheduled`);
      const resultsResponse = await axios.get(`${API_URL}/interview-results/?status=pending`);

      setStats([
        {
          title: 'Active Jobs',
          value: jobsResponse.data.data?.length || 0,
          change: 8.2,
          icon: <Briefcase className="w-6 h-6" />,
          color: 'primary',
        },
        {
          title: 'Total Candidates',
          value: candidatesResponse.data.count || candidatesResponse.data.data?.length || 0,
          change: 12.5,
          icon: <Users className="w-6 h-6" />,
          color: 'primary',
        },
        {
          title: 'Active Interviews',
          value: interviewsResponse.data.results?.length || 0,
          change: -3.1,
          icon: <Video className="w-6 h-6" />,
          color: 'primary',
        },
        {
          title: 'Pending Results',
          value: resultsResponse.data.results?.length || 0,
          change: 5.8,
          icon: <ClipboardCheck className="w-6 h-6" />,
          color: 'primary',
        },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const recruiterId = user?.id;
      const response = await axios.get(`${API_URL}/interviews/?recruiter=${recruiterId}&limit=5&ordering=-created_at`);
      
      if (response.data.results && Array.isArray(response.data.results)) {
        const activities = response.data.results.map((interview: any) => ({
          id: interview.id,
          type: interview.status === 'completed' ? 'interview_completed' : 
                interview.status === 'scheduled' ? 'interview_scheduled' : 'interview_in_progress',
          candidate: interview.candidate?.user?.full_name || 'Unknown Candidate',
          job: interview.job?.title || 'Unknown Job',
          time: new Date(interview.created_at),
          status: interview.status,
        }));
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

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
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
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
                ))
              ) : (
                <div className="text-center py-8 text-neutral-600">
                  <p>No recent activity</p>
                  <p className="text-sm">Start scheduling interviews to see activity here</p>
                </div>
              )}
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
