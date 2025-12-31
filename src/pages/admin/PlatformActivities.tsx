import { useState } from 'react';
import { Card, CardContent, Button, Badge, Input, Select } from '@/components/ui';
import { Activity, Filter, Download, Search } from 'lucide-react';
import { format } from 'date-fns';

const mockActivities = [
  { id: '1', type: 'user_created', user: 'admin@platform.com', target: 'john.doe@example.com', timestamp: new Date('2024-12-23T10:30:00'), details: 'Created new recruiter account' },
  { id: '2', type: 'company_created', user: 'admin@platform.com', target: 'TechCorp Inc.', timestamp: new Date('2024-12-23T09:15:00'), details: 'New company registered' },
  { id: '3', type: 'interview_completed', user: 'jane.smith@techcorp.com', target: 'John Doe - Senior Engineer', timestamp: new Date('2024-12-23T08:45:00'), details: 'Interview completed successfully' },
  { id: '4', type: 'job_created', user: 'jane.smith@techcorp.com', target: 'Senior Software Engineer', timestamp: new Date('2024-12-22T16:20:00'), details: 'New job posting created' },
  { id: '5', type: 'user_login', user: 'recruiter@company.com', target: 'System', timestamp: new Date('2024-12-22T14:10:00'), details: 'User logged in' },
  { id: '6', type: 'settings_updated', user: 'admin@platform.com', target: 'Platform Settings', timestamp: new Date('2024-12-22T11:30:00'), details: 'Updated email templates' },
];

export const PlatformActivities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_created': return 'primary';
      case 'company_created': return 'success';
      case 'interview_completed': return 'info';
      case 'job_created': return 'warning';
      case 'user_login': return 'neutral';
      case 'settings_updated': return 'secondary';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Platform Activities</h1>
          <p className="text-neutral-600 mt-1">Monitor all system activities and events</p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
          Export Log
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Activities</option>
              <option value="user_created">User Created</option>
              <option value="company_created">Company Created</option>
              <option value="interview_completed">Interviews</option>
              <option value="job_created">Jobs</option>
              <option value="settings_updated">Settings</option>
            </Select>
            <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
          </div>

          <div className="space-y-3">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border-2 border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant={getActivityColor(activity.type)}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-neutral-500">
                      {format(activity.timestamp, 'MMM dd, yyyy • hh:mm a')}
                    </span>
                  </div>
                  <p className="font-medium text-secondary mb-1">{activity.details}</p>
                  <div className="text-sm text-neutral-600">
                    <span className="font-medium">User:</span> {activity.user} →{' '}
                    <span className="font-medium">Target:</span> {activity.target}
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
