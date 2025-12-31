import { useState } from 'react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Bell, CheckCheck, Trash2, Video, Briefcase, Mail, UserPlus, FileText } from 'lucide-react';

export const NotificationsCenter = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'interview',
      icon: Video,
      title: 'Interview Scheduled',
      message: 'Your interview for Senior Software Engineer has been scheduled for Dec 30, 2:00 PM',
      time: '5 minutes ago',
      read: false,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 2,
      type: 'application',
      icon: Briefcase,
      title: 'New Application Received',
      message: 'John Doe applied for the Product Manager position',
      time: '1 hour ago',
      read: false,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      id: 3,
      type: 'result',
      icon: FileText,
      title: 'Interview Results Ready',
      message: 'AI evaluation results are now available for Jane Smith',
      time: '2 hours ago',
      read: true,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 4,
      type: 'verification',
      icon: Mail,
      title: 'Email Verified',
      message: 'Your email address has been successfully verified',
      time: '1 day ago',
      read: true,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      id: 5,
      type: 'user',
      icon: UserPlus,
      title: 'New Team Member',
      message: 'Michael Chen has joined your recruiting team',
      time: '2 days ago',
      read: true,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-secondary">Notifications</h1>
            <p className="text-neutral-600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />}>
            Mark All Read
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4" />}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'interview', 'application', 'result', 'user'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {notifications
          .filter((n) => filter === 'all' || n.type === filter)
          .map((notification) => (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-primary-600' : ''}`}
            >
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${notification.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <notification.icon className={`w-6 h-6 ${notification.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="font-semibold text-secondary">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="primary" className="flex-shrink-0">New</Badge>
                      )}
                    </div>
                    <p className="text-neutral-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-neutral-500">{notification.time}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <Button variant="ghost" size="sm">
                        <CheckCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {notifications.filter((n) => filter === 'all' || n.type === filter).length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No notifications to display</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
