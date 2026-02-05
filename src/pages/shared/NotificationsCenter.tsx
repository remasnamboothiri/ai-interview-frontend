import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Video, 
  Briefcase, 
  Mail, 
  UserPlus, 
  FileText, 
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  X,
  Calendar,
  Clock
} from 'lucide-react';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

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
  const colorMap: Record<string, { color: string; bg: string; badge: string }> = {
    'interview_scheduled': { color: 'text-blue-600', bg: 'bg-blue-50', badge: 'primary' },
    'interview_cancelled': { color: 'text-red-600', bg: 'bg-red-50', badge: 'danger' },
    'application_received': { color: 'text-green-600', bg: 'bg-green-50', badge: 'success' },
    'result_available': { color: 'text-purple-600', bg: 'bg-purple-50', badge: 'primary' },
    'application_status_changed': { color: 'text-orange-600', bg: 'bg-orange-50', badge: 'warning' },
    'interview_reminder': { color: 'text-yellow-600', bg: 'bg-yellow-50', badge: 'warning' },
    'system_announcement': { color: 'text-blue-600', bg: 'bg-blue-50', badge: 'primary' },
  };
  return colorMap[type] || { color: 'text-gray-600', bg: 'bg-gray-50', badge: 'neutral' };
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
  return format(date, 'MMM dd, yyyy');
};

export const NotificationsCenter = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get user ID from auth context
  const userId = user?.id || 1; // Fallback to 1 if no user

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again later.');
      
      // Create some sample notifications for demo purposes if API fails
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
        }
      ];
      setNotifications(sampleNotifications);
      setError(null); // Clear error since we have sample data
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
      // Still update local state for better UX
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
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
      // Still update local state for better UX
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      // Still remove from local state for better UX
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      await notificationService.clearAllNotifications(userId);
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    // Filter by type
    if (filter !== 'all' && n.notification_type !== filter) return false;
    
    // Filter by search term
    if (searchTerm && !n.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !n.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const notificationTypes = Array.from(new Set(notifications.map(n => n.notification_type)));

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary">Notifications</h1>
            <p className="text-neutral-600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} • {notifications.length} total
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchNotifications}
          >
            Refresh
          </Button>
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

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Filter Buttons */}
          {showFilters && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                All ({notifications.length})
              </button>
              {notificationTypes.map((type) => {
                const count = notifications.filter(n => n.notification_type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const Icon = getNotificationIcon(notification.notification_type);
          const colors = getNotificationColors(notification.notification_type);
          
          return (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow ${!notification.is_read ? 'border-l-4 border-l-primary-600 bg-primary-50/30' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${colors.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-secondary">{notification.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <Badge variant="primary" className="text-xs">New</Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(notification.created_at)}
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-600 mb-3 leading-relaxed">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="flex gap-2">
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
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredNotifications.length === 0 && !loading && (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600 text-lg mb-2">
                  {searchTerm || filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
                </p>
                <p className="text-neutral-500">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Notifications will appear here when you have updates'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};