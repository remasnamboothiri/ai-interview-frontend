import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Video,
  Bot,
  ClipboardList,
  User,
  Settings,
  LogIn,
  ShieldCheck,
  Home
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface PageLink {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: 'auth' | 'recruiter' | 'admin';
}

export function HomePage() {
  const pages: PageLink[] = [
    {
      title: 'Login',
      description: 'Sign in to your account',
      path: ROUTES.LOGIN,
      icon: <LogIn className="w-8 h-8" />,
      category: 'auth',
    },
    {
      title: 'Admin Login',
      description: 'Administrator portal access',
      path: ROUTES.ADMIN_LOGIN,
      icon: <ShieldCheck className="w-8 h-8" />,
      category: 'auth',
    },
    {
      title: 'Dashboard',
      description: 'Overview of your recruitment metrics',
      path: ROUTES.DASHBOARD,
      icon: <LayoutDashboard className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'Jobs',
      description: 'Manage job postings and positions',
      path: ROUTES.JOBS,
      icon: <Briefcase className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'Candidates',
      description: 'View and manage candidate profiles',
      path: ROUTES.CANDIDATES,
      icon: <Users className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'Interviews',
      description: 'Schedule and manage AI interviews',
      path: ROUTES.INTERVIEWS,
      icon: <Video className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'AI Agents',
      description: 'Configure AI interview agents',
      path: ROUTES.AI_AGENTS,
      icon: <Bot className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'Results',
      description: 'Review interview results and analytics',
      path: ROUTES.RESULTS,
      icon: <ClipboardList className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'Profile',
      description: 'Manage your profile settings',
      path: ROUTES.PROFILE,
      icon: <User className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'Settings',
      description: 'Configure application preferences',
      path: ROUTES.SETTINGS,
      icon: <Settings className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'Interview Room',
      description: 'Live AI interview interface (Demo)',
      path: '/interview-room',
      icon: <Video className="w-8 h-8" />,
      category: 'recruiter',
    },
    {
      title: 'Testing Hub',
      description: 'UI component testing and previews',
      path: '/testing',
      icon: <Settings className="w-8 h-8" />,
      category: 'admin',
    },
  ];

  const categories = {
    auth: 'Authentication',
    recruiter: 'Recruiter Portal',
    admin: 'Admin Portal',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Home className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            AI Interview Platform
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Streamline your recruitment process with AI-powered interviews. Select a page below to get started.
          </p>
        </div>

        {Object.entries(categories).map(([key, label]) => {
          const categoryPages = pages.filter(page => page.category === key);

          if (categoryPages.length === 0) return null;

          return (
            <div key={key} className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                {label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryPages.map((page) => (
                  <Link key={page.path} to={page.path}>
                    <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 text-blue-600 group-hover:text-blue-700 transition-colors">
                          {page.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {page.title}
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {page.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Need Help?
            </h3>
            <p className="text-slate-600 mb-4">
              Explore our features or start by logging in to access the full platform.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to={ROUTES.LOGIN}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to={ROUTES.DASHBOARD}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
