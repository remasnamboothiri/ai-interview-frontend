import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui';
import { getInitials } from '@/utils/format';
import { ROUTES } from '@/constants';
import notificationService from '@/services/notificationService';

export const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        // Use a default user ID if no user is available
        const userId = user?.id || 1;
        const count = await notificationService.getUnreadCount(userId);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
        // Set a demo count if API fails
        setUnreadCount(2);
      }
    };

    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
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

        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-neutral-600 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full"></span>
            )}
          </button>
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
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-neutral-500 capitalize">{user?.role || 'Role'}</p>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-slide-down">
                <button
                  onClick={() => {
                    navigate(ROUTES.PROFILE);
                    setShowUserMenu(false);
                  }}
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
  );
};