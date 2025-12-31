import { Card, CardContent } from '@/components/ui';
import { Users, Briefcase, Video, Building, TrendingUp, Activity } from 'lucide-react';
import { Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '2,845', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Companies', value: '156', change: '+8%', icon: Building, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Jobs', value: '1,234', change: '+15%', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Interviews Conducted', value: '5,678', change: '+22%', icon: Video, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 420 },
    { month: 'Feb', users: 580 },
    { month: 'Mar', users: 720 },
    { month: 'Apr', users: 890 },
    { month: 'May', users: 1150 },
    { month: 'Jun', users: 1420 },
  ];

  const activityData = [
    { name: 'Mon', interviews: 65, jobs: 28 },
    { name: 'Tue', interviews: 82, jobs: 35 },
    { name: 'Wed', interviews: 71, jobs: 42 },
    { name: 'Thu', interviews: 95, jobs: 38 },
    { name: 'Fri', interviews: 88, jobs: 45 },
  ];

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
              <Line data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </Line>
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
            {[
              { action: 'New company registered', details: 'TechCorp Inc.', time: '5 minutes ago' },
              { action: 'Job posted', details: 'Senior Developer at StartupXYZ', time: '12 minutes ago' },
              { action: 'Interview completed', details: 'John Doe - Product Manager', time: '1 hour ago' },
              { action: 'User verification', details: 'jane.smith@email.com verified', time: '2 hours ago' },
              { action: 'New recruiter added', details: 'Michael Chen joined ABC Corp', time: '3 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start justify-between py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="font-medium text-secondary">{activity.action}</p>
                  <p className="text-sm text-neutral-600">{activity.details}</p>
                </div>
                <span className="text-xs text-neutral-500 whitespace-nowrap ml-4">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
