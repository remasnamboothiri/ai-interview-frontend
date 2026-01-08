import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Video,
  Bot,
  ClipboardCheck,
  Settings,
  Leaf,
  Shield,
  UserCog,
  Building,
  Activity,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: ROUTES.DASHBOARD,
    roles: ['recruiter'],
  },
  {
    label: 'Jobs',
    icon: <Briefcase className="w-5 h-5" />,
    path: ROUTES.JOBS,
    roles: ['recruiter', 'super_admin'],
  },
  {
    label: 'Candidates',
    icon: <Users className="w-5 h-5" />,
    path: ROUTES.CANDIDATES,
    roles: ['recruiter', 'super_admin'],
  },
  {
    label: 'Interviews',
    icon: <Video className="w-5 h-5" />,
    path: ROUTES.INTERVIEWS,
    roles: ['recruiter', 'super_admin'],
  },
  {
    label: 'AI Agents',
    icon: <Bot className="w-5 h-5" />,
    path: ROUTES.AI_AGENTS,
    roles: ['recruiter', 'super_admin'],
  },
  {
    label: 'Results',
    icon: <ClipboardCheck className="w-5 h-5" />,
    path: ROUTES.RESULTS,
    roles: ['recruiter', 'super_admin'],
  },
  // ADD THE COMPANIES ITEM HERE:
  // {
  //   label: 'Companies',
  //   icon: <Building2 className="w-5 h-5" />,
  //   path: '/companies',
  //   roles: ['recruiter', 'super_admin'],
  // },
  

];

const adminMenuItems: MenuItem[] = [
  {
    label: 'Admin Dashboard',
    icon: <Shield className="w-5 h-5" />,
    path: ROUTES.ADMIN.DASHBOARD,
    roles: ['super_admin'],
  },
  {
    label: 'Companies',
    icon: <Building className="w-5 h-5" />,
    path: ROUTES.ADMIN.COMPANIES,
    roles: ['super_admin'],
  },
  {
    label: 'Recruiter Management',
    icon: <UserCog className="w-5 h-5" />,
    path: ROUTES.ADMIN.USERS,
    roles: ['super_admin'],
  },
  
  {
    label: 'Platform Activities',
    icon: <Activity className="w-5 h-5" />,
    path: ROUTES.ADMIN.ACTIVITIES,
    roles: ['super_admin'],
  },
  {
    label: 'Admin Settings',
    icon: <Settings className="w-5 h-5" />,
    path: ROUTES.ADMIN.SETTINGS,
    roles: ['super_admin'],
  },
];

export const Sidebar = () => {
  const { role } = useAuth();

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  const filteredAdminItems = role === 'super_admin' ? adminMenuItems : [];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-green">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-secondary">HireFlow AI</h1>
            <p className="text-xs text-neutral-500">Interview Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        <div className="space-y-1 px-3">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`
              }
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {filteredAdminItems.length > 0 && (
          <>
            <div className="px-6 py-3 mt-6">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Admin
              </p>
            </div>
            <div className="space-y-1 px-3">
              {filteredAdminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-neutral-900 text-white font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-neutral-200">
        <NavLink
          to={ROUTES.SETTINGS}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isActive
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};


