import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import {
  Bell, CheckCheck, Trash2, Video, Briefcase, Mail, UserPlus, FileText,
  AlertCircle, Bot, ClipboardCheck, Play, XCircle, Users
} from 'lucide-react';
import notificationService, { Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';

const API_URL = `${API_BASE_URL}/api`;

// Icon mapping for notification types
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'interview_scheduled': Video,
    'interview_started': Play,
    'interview_completed': ClipboardCheck,
    'interview_cancelled': XCircle,
    'interview_reminder': Bell,
    'result_available': FileText,
    'job_created': Briefcase,
    'job_updated': Briefcase,
    'candidate_registered': UserPlus,
    'candidate_added': Users,
    'application_received': Mail,
    'application_status_changed': Briefcase,
    'agent_created': Bot,
    'system_announcement': Bell,
  };
  return iconMap[type] || Bell;
};

// Color mapping for notification types
const getNotificationColors = (type: string) => {
  const colorMap: Record<string, { color: string; bg: string }> = {
    'interview_scheduled': { color: 'text-blue-600', bg: 'bg-blue-50' },
    'interview_started': { color: 'text-green-600', bg: 'bg-green-50' },
    'interview_completed': { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    'interview_cancelled': { color: 'text-red-600', bg: 'bg-red-50' },
    'interview_reminder': { color: 'text-yellow-600', bg: 'bg-yellow-50' },
    'result_available': { color: 'text-purple-600', bg: 'bg-purple-50' },
    'job_created': { color: 'text-indigo-600', bg: 'bg-indigo-50' },
    'job_updated': { color: 'text-indigo-600', bg: 'bg-indigo-50' },
    'candidate_registered': { color: 'text-teal-600', bg: 'bg-teal-50' },
    'candidate_added': { color: 'text-cyan-600', bg: 'bg-cyan-50' },
    'application_received': { color: 'text-green-600', bg: 'bg-green-50' },
    'application_status_changed': { color: 'text-orange-600', bg: 'bg-orange-50' },
    'agent_created': { color: 'text-violet-600', bg: 'bg-violet-50' },
    'system_announcement': { color: 'text-blue-600', bg: 'bg-blue-50' },
  };
  return colorMap[type] || { color: 'text-gray-600', bg: 'bg-gray-50' };
};

// Filter categories
const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'interviews', label: 'Interviews', types: ['interview_scheduled', 'interview_started', 'interview_completed', 'interview_cancelled', 'interview_reminder'] },
  { key: 'results', label: 'Results', types: ['result_available'] },
  { key: 'jobs', label: 'Jobs', types: ['job_created', 'job_updated'] },
  { key: 'candidates', label: 'Candidates', types: ['candidate_registered', 'candidate_added'] },
  { key: 'applications', label: 'Applications', types: ['application_received', 'application_status_changed'] },
  { key: 'agents', label: 'AI Agents', types: ['agent_created'] },
];

// Format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const LIMIT = 20;

export const NotificationsCenter = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async (loadMore = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const currentOffset = loadMore ? offset : 0;

      const response = await axios.get(
        `${API_URL}/notifications/?user_id=${userId}&limit=${LIMIT}&offset=${currentOffset}`
      );

      const data = response.data?.data || response.data || [];
      const totalCount = response.data?.total || data.length;

      if (loadMore) {
        setNotifications(prev => [...prev, ...(Array.isArray(data) ? data : [])]);
      } else {
        setNotifications(Array.isArray(data) ? data : []);
        setTotal(totalCount);
      }

      setOffset(currentOffset + LIMIT);
      setHasMore(currentOffset + LIMIT < totalCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
      if (!loadMore) setNotifications([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await notificationService.markAllAsRead(userId);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
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
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    // Navigate if action_url exists
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.is_read).length;

  // Filter notifications by category
  const filteredNotifications = safeNotifications.filter(n => {
    if (filter === 'all') return true;
    const filterOption = FILTER_OPTIONS.find(f => f.key === filter);
    if (filterOption && filterOption.types) {
      return filterOption.types.includes(n.notification_type);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-secondary">Notifications</h1>
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent>
                <div className="flex items-start gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-100 rounded w-1/3" />
                    <div className="h-3 bg-neutral-100 rounded w-2/3" />
                    <div className="h-3 bg-neutral-100 rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-secondary">Notifications</h1>
            <p className="text-neutral-600">
              {unreadCount > 0
                ? `${unreadCount} unread of ${total} total`
                : `${total} notification${total !== 1 ? 's' : ''}`}
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

      {/* Error */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="ghost" size="sm" onClick={() => fetchNotifications()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_OPTIONS.map(option => {
          const count = option.key === 'all'
            ? safeNotifications.length
            : safeNotifications.filter(n => option.types?.includes(n.notification_type)).length;

          return (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${
                  filter === option.key ? 'text-white/80' : 'text-neutral-500'
                }`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.map(notification => {
          const Icon = getNotificationIcon(notification.notification_type);
          const colors = getNotificationColors(notification.notification_type);

          return (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                !notification.is_read ? 'border-l-4 border-l-primary-600' : ''
              }`}
            >
              <CardContent>
                <div className="flex items-start gap-4" onClick={() => handleNotificationClick(notification)}>
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${colors.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className={`font-semibold text-secondary ${!notification.is_read ? '' : 'opacity-70'}`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <Badge variant="warning" className="flex-shrink-0">New</Badge>
                      )}
                    </div>
                    <p className={`text-neutral-600 mb-2 ${notification.is_read ? 'opacity-60' : ''}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-neutral-500">{formatTimeAgo(notification.created_at)}</p>
                      <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                        {notification.notification_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
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

      {/* Load More */}
      {hasMore && !loading && filteredNotifications.length > 0 && (
        <div className="text-center pt-6">
          <Button
            variant="outline"
            onClick={() => fetchNotifications(true)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More Notifications'}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredNotifications.length === 0 && !loading && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 font-medium">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Notifications will appear here when events occur.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};