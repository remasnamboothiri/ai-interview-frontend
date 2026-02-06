import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui';
import { Users, Briefcase, Video, Building, TrendingUp, Activity, Loader } from 'lucide-react';
import { Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';

const API_URL = `${API_BASE_URL}/api`;

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', change: '+0%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Companies', value: '0', change: '+0%', icon: Building, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Jobs', value: '0', change: '+0%', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Interviews Conducted', value: '0', change: '+0%', icon: Video, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]);

  const [userGrowthData, setUserGrowthData] = useState([
    { month: 'Jan', users: 0 },
    { month: 'Feb', users: 0 },
    { month: 'Mar', users: 0 },
    { month: 'Apr', users: 0 },
    { month: 'May', users: 0 },
    { month: 'Jun', users: 0 },
  ]);

  const [activityData, setActivityData] = useState([
    { name: 'Mon', interviews: 0, jobs: 0 },
    { name: 'Tue', interviews: 0, jobs: 0 },
    { name: 'Wed', interviews: 0, jobs: 0 },
    { name: 'Thu', interviews: 0, jobs: 0 },
    { name: 'Fri', interviews: 0, jobs: 0 },
  ]);

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch real data from backend
      const usersResponse = await axios.get(`${API_URL}/users/`);
      const companiesResponse = await axios.get(`${API_URL}/companies/`);
      const jobsResponse = await axios.get(`${API_URL}/jobs/`);
      const interviewsResponse = await axios.get(`${API_URL}/interviews/`);

      const usersCount = usersResponse.data.count || usersResponse.data.data?.length || 0;
      const companiesCount = companiesResponse.data.count || companiesResponse.data.data?.length || 0;
      const jobsCount = jobsResponse.data.data?.length || 0;
      const interviewsCount = interviewsResponse.data.results?.length || 0;

      setStats([
        { 
          label: 'Total Users', 
          value: usersCount.toString(), 
          change: '+12%', 
          icon: Users, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50' 
        },
        { 
          label: 'Active Companies', 
          value: companiesCount.toString(), 
          change: '+8%', 
          icon: Building, 
          color: 'text-green-600', 
          bg: 'bg-green-50' 
        },
        { 
          label: 'Total Jobs', 
          value: jobsCount.toString(), 
          change: '+15%', 
          icon: Briefcase, 
          color: 'text-purple-600', 
          bg: 'bg-purple-50' 
        },
        { 
          label: 'Interviews Conducted', 
          value: interviewsCount.toString(), 
          change: '+22%', 
          icon: Video, 
          color: 'text-orange-600', 
          bg: 'bg-orange-50' 
        },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/activity-logs/`);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        // Get the last 5 activities
        const activities = response.data.data.slice(0, 5).map((activity: any) => ({
          action: formatAction(activity.action),
          details: formatDetails(activity),
          time: formatTimeAgo(activity.created_at)
        }));
        
        if (activities.length > 0) {
          setRecentActivities(activities);
        } else {
          setRecentActivities([]);
        }
      } else {
        setRecentActivities([]);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const formatAction = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'company_created': 'New company registered',
      'company_updated': 'Company updated',
      'company_deleted': 'Company deleted',
      'job_created': 'Job posted',
      'job_updated': 'Job updated',
      'job_deleted': 'Job deleted',
      'job_published': 'Job published',
      'interview_scheduled': 'Interview scheduled',
      'interview_cancelled': 'Interview cancelled',
      'interview_completed': 'Interview completed',
      'user_registered': 'New user registered',
      'user_updated': 'User updated',
      'candidate_added': 'Candidate added',
      'recruiter_added': 'Recruiter added',
      'application_submitted': 'Application submitted',
    };
    return actionMap[action] || action.replace(/_/g, ' ');
  };

  const formatDetails = (activity: any) => {
    if (activity.details) {
      if (activity.details.company_name) return activity.details.company_name;
      if (activity.details.job_title) return activity.details.job_title;
      if (activity.details.candidate_name) return activity.details.candidate_name;
      if (activity.details.email) return activity.details.email;
    }
    return activity.resource_type || 'System activity';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
        <p className="text-neutral-600 mt-1">Platform-wide statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-secondary mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-secondary mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="interviews" fill="#10b981" />
                <Bar dataKey="jobs" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-secondary">Recent Platform Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: any, index: number) => (
                <div key={index} className="flex items-start justify-between py-3 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="font-medium text-secondary">{activity.action}</p>
                    <p className="text-sm text-neutral-600">{activity.details}</p>
                  </div>
                  <span className="text-xs text-neutral-500 whitespace-nowrap ml-4">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-600">
                <Activity className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                <p>No recent activities found</p>
                <p className="text-sm">Activities will appear here as users interact with the platform</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
