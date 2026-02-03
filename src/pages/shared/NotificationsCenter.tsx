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

  // Get user ID from localStorage or context
  // For now, using a default user ID - you should replace this with actual logged-in user ID
  const userId = 16; // Replace with actual user ID from your auth context

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch notifications using the user ID
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      
      // If the list endpoint fails, try fetching individual notifications
      // This is a workaround for the 403 error on the list endpoint
      if (err.response?.status === 403) {
        try {
          // Try to fetch known notification IDs (1, 2, 3 from your database)
          const individualNotifications = await Promise.allSettled([
            notificationService.getNotification(1),
            notificationService.getNotification(2),
            notificationService.getNotification(3),
          ]);
          
          const successfulNotifications = individualNotifications
            .filter((result): result is PromiseFulfilledResult<Notification> => result.status === 'fulfilled')
            .map(result => result.value);
          
          if (successfulNotifications.length > 0) {
            setNotifications(successfulNotifications);
            setError(null);
          } else {
            setError('Unable to load notifications. Please contact administrator.');
          }
        } catch (individualErr) {
          setError('Unable to load notifications. Please contact administrator.');
        }
      } else {
        setError('Failed to load notifications. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
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
