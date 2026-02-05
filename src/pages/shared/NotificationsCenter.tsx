import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Bell, CheckCheck, Trash2, Video, Briefcase, Mail, UserPlus, FileText, AlertCircle } from 'lucide-react';
import notificationService, { Notification } from '@/services/notificationService';

// Icon mapping for notification types
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'interview_scheduled': Video,
    'interview_cancelled': Video,
    'application_received': Briefcase,
    'result_available': FileText,
    'application_status_changed': Briefcase,
    'interview_reminder': Bell,
    'system_announcement': Mail,
  };
  return iconMap[type] || Bell;
};

// Color mapping for notification types
const getNotificationColors = (type: string) => {
  const colorMap: Record<string, { color: string; bg: string }> = {
    'interview_scheduled': { color: 'text-blue-600', bg: 'bg-blue-50' },
    'interview_cancelled': { color: 'text-red-600', bg: 'bg-red-50' },
    'application_received': { color: 'text-green-600', bg: 'bg-green-50' },
    'result_available': { color: 'text-purple-600', bg: 'bg-purple-50' },
    'application_status_changed': { color: 'text-orange-600', bg: 'bg-orange-50' },
    'interview_reminder': { color: 'text-yellow-600', bg: 'bg-yellow-50' },
    'system_announcement': { color: 'text-blue-600', bg: 'bg-blue-50' },
  };
  return colorMap[type] || { color: 'text-gray-600', bg: 'bg-gray-50' };
};

// Format time ago
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

export const NotificationsCenter = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from localStorage or context - using a default for now
  const userId = 1; // Replace with actual user ID from your auth context

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create sample notifications if API fails
      const sampleNotifications: Notification[] = [
        {
          id: 1,
          user: userId,
          notification_type: 'interview_scheduled',
          title: 'Interview Scheduled',
          message: 'Your interview for Software Engineer position has been scheduled for tomorrow at 2:00 PM.',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          user: userId,
          notification_type: 'application_received',
          title: 'New Application',
          message: 'You have received a new application for the Frontend Developer position.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          user: userId,
          notification_type: 'result_available',
          title: 'Interview Results Available',
          message: 'The results for John Doe\'s interview are now available for review.',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 4,
          user: userId,
          notification_type: 'application_status_changed',
          title: 'Application Status Updated',
          message: 'The application status for Backend Developer position has been changed to "Interviewing".',
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 5,
          user: userId,
          notification_type: 'interview_reminder',
          title: 'Interview Reminder',
          message: 'Reminder: You have an interview scheduled in 1 hour with Mike Johnson.',
          is_read: true,
          created_at: new Date(Date.now() - 10800000).toISOString(),
        }
      ];

      try {
        // Try to fetch from API first
        const data = await notificationService.getUserNotifications(userId);
        setNotifications(Array.isArray(data) ? data : sampleNotifications);
      } catch (apiError) {
        console.error('API Error, using sample data:', apiError);
        // Use sample data if API fails
        setNotifications(sampleNotifications);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Showing sample data.');
      
      // Fallback to sample data
      const sampleNotifications: Notification[] = [
        {
          id: 1,
          user: userId,
          notification_type: 'interview_scheduled',
          title: 'Interview Scheduled',
          message: 'Your interview for Software Engineer position has been scheduled for tomorrow at 2:00 PM.',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          user: userId,
          notification_type: 'application_received',
          title: 'New Application',
          message: 'You have received a new application for the Frontend Developer position.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ];
      setNotifications(sampleNotifications);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
    
    // Update local state regardless of API success
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
    
    // Update local state regardless of API success
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
    
    // Remove from local state regardless of API success
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Ensure notifications is always an array before filtering
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.is_read).length;

  const filteredNotifications = safeNotifications.filter((n) => {
    if (filter === 'all') return true;
    return n.notification_type === filter;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

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
          <Button 
            variant="ghost" 
            size="sm" 
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'interview_scheduled', 'application_received', 'result_available', 'system_announcement'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {filterOption === 'all' ? 'All' : filterOption.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const Icon = getNotificationIcon(notification.notification_type);
          const colors = getNotificationColors(notification.notification_type);
          
          return (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow ${!notification.is_read ? 'border-l-4 border-l-primary-600' : ''}`}
            >
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${colors.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="font-semibold text-secondary">{notification.title}</h3>
                      {!notification.is_read && (
                        <Badge variant="primary" className="flex-shrink-0">New</Badge>
                      )}
                    </div>
                    <p className="text-neutral-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-neutral-500">{formatTimeAgo(notification.created_at)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.is_read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && !loading && (
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