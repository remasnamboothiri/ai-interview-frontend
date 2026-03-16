import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User as UserIcon, Sun, Moon, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui';
import { getInitials } from '@/utils/format';
import { ROUTES, API_BASE_URL } from '@/constants';
import notificationService from '@/services/notificationService';

const API_URL = `${API_BASE_URL}/api`;

// Notification type icons
const typeIcons: Record<string, string> = {
  interview_scheduled: '📅',
  interview_started: '▶️',
  interview_completed: '✅',
  interview_cancelled: '❌',
  result_available: '📊',
  candidate_added: '👤',
  candidate_registered: '🎉',
  job_created: '💼',
  job_updated: '📝',
  agent_created: '🤖',
  application_received: '📩',
};

export const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const prevCountRef = useRef(0);
  const lastSeenIdRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch unread count + detect new notifications ────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!user?.id) { setUnreadCount(0); return; }

      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);

      // If count increased, fetch latest notifications for toast
      if (count > prevCountRef.current && prevCountRef.current > 0) {
        try {
          const resp = await fetch(`${API_URL}/notifications/?user_id=${user.id}&limit=3&offset=0`);
          if (resp.ok) {
            const data = await resp.json();
            const notifications = data.results || data.data || data || [];

            // Show toast for new ones
            const newOnes = notifications.filter((n: any) => n.id > lastSeenIdRef.current);
            if (newOnes.length > 0) {
              newOnes.slice(0, 2).forEach((n: any) => {
                addToast(n);
              });
              lastSeenIdRef.current = Math.max(...notifications.map((n: any) => n.id));
            }
          }
        } catch (e) {}
      }

      prevCountRef.current = count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, [user?.id]);

  // Initialize lastSeenId on first load
  useEffect(() => {
    const initLastSeen = async () => {
      if (!user?.id) return;
      try {
        const resp = await fetch(`${API_URL}/notifications/?user_id=${user.id}&limit=1&offset=0`);
        if (resp.ok) {
          const data = await resp.json();
          const notifications = data.results || data.data || data || [];
          if (notifications.length > 0) {
            lastSeenIdRef.current = notifications[0].id;
          }
        }
      } catch (e) {}
    };
    initLastSeen();
  }, [user?.id]);

  // Poll every 10 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ── Toast management ─────────────────────────────────────
  const addToast = (notification: any) => {
    const id = `toast-${notification.id}-${Date.now()}`;
    const toast = { ...notification, toastId: id };

    setToasts(prev => {
      // Max 3 toasts at a time
      const updated = [toast, ...prev].slice(0, 3);
      return updated;
    });

    // Auto-remove after 6 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.toastId !== id));
    }, 6000);
  };

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  // ── Dropdown: fetch recent notifications ─────────────────
  const fetchRecent = async () => {
    if (!user?.id) return;
    try {
      const resp = await fetch(`${API_URL}/notifications/?user_id=${user.id}&limit=5&offset=0`);
      if (resp.ok) {
        const data = await resp.json();
        setRecentNotifications(data.results || data.data || data || []);
      }
    } catch (e) {}
  };

  const handleBellClick = () => {
    if (showDropdown) {
      setShowDropdown(false);
    } else {
      setShowDropdown(true);
      fetchRecent();
    }
  };

  const handleMarkAsRead = async (notifId: number) => {
    try {
      await fetch(`${API_URL}/notifications/${notifId}/read/`, { method: 'POST' });
      setRecentNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await fetch(`${API_URL}/notifications/mark_all_read/?user_id=${user.id}`, { method: 'POST' });
      setRecentNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <>
      {/* ── Toast notifications (top right) ──────────────── */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none" style={{ maxWidth: '380px' }}>
        {toasts.map((toast) => (
          <div
            key={toast.toastId}
            className="pointer-events-auto bg-white border border-neutral-200 rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-slide-in-right"
            style={{
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 text-lg">
              {typeIcons[toast.notification_type] || '🔔'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-secondary truncate">{toast.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{toast.message}</p>
              <button
                onClick={() => {
                  removeToast(toast.toastId);
                  if (toast.action_url) navigate(toast.action_url);
                  else navigate('/notifications');
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1"
              >
                View details →
              </button>
            </div>
            <button
              onClick={() => removeToast(toast.toastId)}
              className="flex-shrink-0 p-1 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
        ))}
      </div>

      {/* ── CSS for toast animation ─────────────────────── */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-14deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(4deg); }
        }
        .bell-ring { animation: bellRing 0.8s ease-in-out; }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .badge-pulse { animation: badgePulse 2s ease-in-out infinite; }
      `}</style>

      <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search jobs, candidates, interviews..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-6">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-neutral-600"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* ── Notification bell with dropdown ──────────── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleBellClick}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors relative ${
                showDropdown ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'bell-ring' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 badge-pulse shadow-sm shadow-red-500/30">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-secondary">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm text-neutral-500">No notifications yet</p>
                    </div>
                  ) : (
                    recentNotifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) handleMarkAsRead(notif.id);
                          setShowDropdown(false);
                          if (notif.action_url) navigate(notif.action_url);
                          else navigate('/notifications');
                        }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 ${
                          !notif.is_read ? 'bg-primary-50/30' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                          {typeIcons[notif.notification_type] || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm truncate ${!notif.is_read ? 'font-semibold text-secondary' : 'text-neutral-700'}`}>
                              {notif.title}
                            </p>
                            {!notif.is_read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{notif.message}</p>
                          <p className="text-[10px] text-neutral-400 mt-1">{timeAgo(notif.created_at)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-100 px-4 py-2.5 bg-neutral-50/50">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/notifications');
                    }}
                    className="w-full text-center text-xs text-primary-600 hover:text-primary-700 font-semibold py-1"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user ? getInitials(user.full_name || user.email) : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-secondary">
                  {user?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-neutral-500 capitalize">{user?.role || 'Role'}</p>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-slide-down">
                  <button
                    onClick={() => { navigate(ROUTES.PROFILE); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 text-neutral-700 text-sm"
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </button>
                  <div className="border-t border-neutral-200 my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};




