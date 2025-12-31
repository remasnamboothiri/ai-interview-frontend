import { Link } from 'react-router-dom';
import { Card, CardContent, Badge } from '@/components/ui';
import {
  Leaf,
  LayoutDashboard,
  Briefcase,
  Users,
  Video,
  Bot,
  ClipboardCheck,
  UserIcon,
  Settings,
  Shield,
  UserCog,
  LogIn,
  UserPlus,
  Key,
  Lock,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ServerCrash,
  WifiOff,
  Clock,
  FileX,
  Monitor,
  Building,
  Bell,
  Home,
  Search,
  Plus,
  Eye,
  Activity,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import { ROUTES } from '@/constants';

interface RouteItem {
  path: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  requiresAuth: boolean;
  roles?: string[];
}

const routes: RouteItem[] = [
  {
    path: '/landing',
    name: 'Landing Page',
    description: 'Marketing homepage with features and testimonials',
    icon: <Home className="w-5 h-5" />,
    category: 'Public / Unauthenticated',
    requiresAuth: false,
  },
  {
    path: ROUTES.LOGIN,
    name: 'Login Page',
    description: 'Universal login page for all users',
    icon: <LogIn className="w-5 h-5" />,
    category: 'Public / Unauthenticated',
    requiresAuth: false,
  },
  {
    path: '/register',
    name: 'Registration Page',
    description: 'Multi-step user registration (3 steps)',
    icon: <UserPlus className="w-5 h-5" />,
    category: 'Public / Unauthenticated',
    requiresAuth: false,
  },
  {
    path: '/forgot-password',
    name: 'Forgot Password Page',
    description: 'Request password reset link',
    icon: <Key className="w-5 h-5" />,
    category: 'Public / Unauthenticated',
    requiresAuth: false,
  },
  {
    path: '/reset-password?token=sample',
    name: 'Reset Password Page',
    description: 'Set new password with strength indicator',
    icon: <Lock className="w-5 h-5" />,
    category: 'Public / Unauthenticated',
    requiresAuth: false,
  },
  {
    path: '/email-verification-pending',
    name: 'Email Verification Pending',
    description: 'Awaiting email confirmation',
    icon: <Mail className="w-5 h-5" />,
    category: 'Authentication & Verification',
    requiresAuth: false,
  },
  {
    path: '/email-verification-success',
    name: 'Email Verification Success',
    description: 'Email successfully verified',
    icon: <CheckCircle className="w-5 h-5" />,
    category: 'Authentication & Verification',
    requiresAuth: false,
  },
  {
    path: '/otp-verification',
    name: 'OTP Verification',
    description: '6-digit code with auto-focus and resend',
    icon: <Key className="w-5 h-5" />,
    category: 'Authentication & Verification',
    requiresAuth: false,
  },
  {
    path: '/change-password',
    name: 'Change Password',
    description: 'Update account password',
    icon: <Lock className="w-5 h-5" />,
    category: 'Authentication & Verification',
    requiresAuth: true,
  },
  {
    path: '/404',
    name: '404 - Page Not Found',
    description: 'Page not found error',
    icon: <Search className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/403',
    name: '403 - Access Forbidden',
    description: 'Access denied page',
    icon: <Shield className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/500',
    name: '500 - Internal Server Error',
    description: 'Internal server error with retry',
    icon: <ServerCrash className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/maintenance',
    name: '503 - Maintenance Mode',
    description: 'Platform under maintenance',
    icon: <Settings className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/offline',
    name: 'Network Connection Lost',
    description: 'Connection lost with troubleshooting',
    icon: <WifiOff className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/session-expired',
    name: 'Session Expired',
    description: 'JWT token expired, require re-login',
    icon: <Clock className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/interview-link-expired',
    name: 'Interview Link Invalid / Expired',
    description: 'Invalid or expired interview link',
    icon: <XCircle className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/upload-error',
    name: 'File Upload Error',
    description: 'File upload failure with reasons',
    icon: <FileX className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/browser-not-supported',
    name: 'Browser Not Supported',
    description: 'Outdated browser with download links',
    icon: <Monitor className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/permission-denied',
    name: 'Camera / Mic Permission Denied',
    description: 'Camera/Mic access instructions',
    icon: <AlertCircle className="w-5 h-5" />,
    category: 'Error & Status',
    requiresAuth: false,
  },
  {
    path: '/admin/dashboard',
    name: 'Admin Dashboard Home',
    description: 'Platform stats with charts and activity',
    icon: <LayoutDashboard className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/activities',
    name: 'Platform Activities Log',
    description: 'System-wide activity log with filters',
    icon: <Activity className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/users',
    name: 'Users Management List',
    description: 'Full user table with search and filters',
    icon: <UserCog className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/users/1',
    name: 'User Details Page',
    description: 'Detailed user profile with stats',
    icon: <UserIcon className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/users/create',
    name: 'Create User Page',
    description: 'Add new user with role assignment',
    icon: <UserPlus className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/companies',
    name: 'Companies List',
    description: 'Company cards with metrics',
    icon: <Building className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/companies/1',
    name: 'Company Details Page',
    description: 'Detailed company stats and recruiters',
    icon: <Building className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/companies/create',
    name: 'Create / Edit Company Page',
    description: 'Register new company with details',
    icon: <Plus className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/companies/1/recruiters',
    name: 'Company Recruiters List',
    description: 'View and manage company recruiters',
    icon: <Users className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: '/admin/settings',
    name: 'Platform Settings',
    description: 'Global configuration and settings',
    icon: <Settings className="w-5 h-5" />,
    category: 'Admin Dashboard & Management',
    requiresAuth: true,
    roles: ['super_admin'],
  },
  {
    path: ROUTES.DASHBOARD,
    name: 'Recruiter Dashboard Home',
    description: 'Personal stats and quick actions',
    icon: <LayoutDashboard className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: ROUTES.JOBS,
    name: 'My Jobs List',
    description: '5 mock jobs with search and filters',
    icon: <Briefcase className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/jobs/create',
    name: 'Create Job Page',
    description: 'Create job with custom questions and AI agent',
    icon: <Plus className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/jobs/1',
    name: 'Job Details & Statistics',
    description: 'Job stats, applications, and analytics',
    icon: <Eye className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: ROUTES.CANDIDATES,
    name: 'Candidates List',
    description: '6 candidate cards in grid layout',
    icon: <Users className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/candidates/add',
    name: 'Add Candidate Page',
    description: 'Manually add candidate with details',
    icon: <UserPlus className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/candidates/import',
    name: 'Import Candidates (CSV)',
    description: 'Bulk CSV import with template',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/candidates/1',
    name: 'Candidate Profile Page',
    description: 'Full profile with interview history',
    icon: <UserIcon className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/interviews/schedule',
    name: 'Schedule Interview',
    description: 'Create new interview with AI agent',
    icon: <Plus className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/interviews/calendar',
    name: 'My Interviews Calendar',
    description: 'Monthly calendar with interviews',
    icon: <Calendar className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: ROUTES.INTERVIEWS,
    name: 'My Interviews List',
    description: '4 interviews with status filters',
    icon: <Video className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/interviews/1',
    name: 'Interview Details Page',
    description: 'Interview details with link and actions',
    icon: <Eye className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: ROUTES.RESULTS,
    name: 'All Results List',
    description: 'Analytics dashboard with all results',
    icon: <ClipboardCheck className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/results/1',
    name: 'Interview Results Page',
    description: 'Detailed interview analysis with transcript',
    icon: <Eye className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: ROUTES.AI_AGENTS,
    name: 'AI Agents List',
    description: '3 AI interviewer agents with config',
    icon: <Bot className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/ai-agents/create',
    name: 'Agent Create / Edit Page',
    description: 'Configure agent with questions and criteria',
    icon: <Plus className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: ROUTES.PROFILE,
    name: 'Profile',
    description: 'User profile management',
    icon: <UserIcon className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: ROUTES.SETTINGS,
    name: 'Settings',
    description: 'Application preferences',
    icon: <Settings className="w-5 h-5" />,
    category: 'Recruiter Dashboard & Job Management',
    requiresAuth: true,
    roles: ['recruiter'],
  },
  {
    path: '/interview/invitation',
    name: 'Interview Invitation Landing',
    description: 'Interview details and preparation tips',
    icon: <Mail className="w-5 h-5" />,
    category: 'Candidate Interview Experience',
    requiresAuth: false,
  },
  {
    path: '/interview/system-check',
    name: 'Pre-Interview System Check',
    description: 'Automated camera/mic/browser checks',
    icon: <CheckCircle className="w-5 h-5" />,
    category: 'Candidate Interview Experience',
    requiresAuth: false,
  },
  {
    path: '/interview/waiting-room',
    name: 'Interview Waiting Room',
    description: 'Countdown timer with reminders',
    icon: <Clock className="w-5 h-5" />,
    category: 'Candidate Interview Experience',
    requiresAuth: false,
  },
  {
    path: '/interview-room',
    name: 'Live Interview Page',
    description: 'Google Meet style interview interface',
    icon: <Video className="w-5 h-5" />,
    category: 'Candidate Interview Experience',
    requiresAuth: false,
  },
  {
    path: '/interview/complete',
    name: 'Interview Completed / Thank You',
    description: 'Thank you page with next steps',
    icon: <CheckCircle className="w-5 h-5" />,
    category: 'Candidate Interview Experience',
    requiresAuth: false,
  },
  {
    path: '/notifications',
    name: 'Notifications Center',
    description: '5 notifications with filters and actions',
    icon: <Bell className="w-5 h-5" />,
    category: 'Notifications & Settings',
    requiresAuth: true,
  },
];

const categories = [
  'Public / Unauthenticated',
  'Authentication & Verification',
  'Error & Status',
  'Admin Dashboard & Management',
  'Recruiter Dashboard & Job Management',
  'Candidate Interview Experience',
  'Notifications & Settings',
];

export const TestingHub = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-secondary mb-2">HireFlow AI</h1>
          <p className="text-lg text-neutral-600">Navigation & Design Testing Hub</p>
          <div className="mt-4 flex gap-2 justify-center flex-wrap">
            <Badge variant="success">Development Mode</Badge>
            <Badge variant="primary">{routes.length} Pages</Badge>
            <Badge variant="neutral">{categories.length} Categories</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Total Pages</h3>
              <p className="text-4xl font-bold">{routes.length}</p>
              <p className="text-primary-100 text-sm mt-2">Fully implemented & testable</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Categories</h3>
              <p className="text-4xl font-bold">{categories.length}</p>
              <p className="text-blue-100 text-sm mt-2">Organized by function</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Mock Data</h3>
              <p className="text-4xl font-bold">✓</p>
              <p className="text-green-100 text-sm mt-2">All pages fully populated</p>
            </CardContent>
          </Card>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-secondary mb-4 flex items-center gap-2">
              {category}
              <Badge variant="neutral">
                {routes.filter((r) => r.category === category).length}
              </Badge>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes
                .filter((route) => route.category === category)
                .map((route) => (
                  <Link key={route.path} to={route.path}>
                    <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group border-l-4 border-l-primary-600">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all flex-shrink-0">
                            {route.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-secondary mb-1 group-hover:text-primary-600 transition-colors">
                              {route.name}
                            </h3>
                            <p className="text-sm text-neutral-600 mb-3">
                              {route.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {route.requiresAuth ? (
                                <Badge variant="warning">Protected</Badge>
                              ) : (
                                <Badge variant="success">Public</Badge>
                              )}
                              {route.roles && (
                                <Badge variant="primary">
                                  {route.roles.join(', ')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 mt-2 font-mono truncate">
                              {route.path}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        ))}

        <Card className="bg-neutral-900 text-white border-0 mt-12">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4 text-center">Platform Features</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2 text-green-400">Complete User Flows</h4>
                <ul className="text-sm text-neutral-300 space-y-1">
                  <li>• Registration → Email Verify → Login</li>
                  <li>• Password Recovery Flow</li>
                  <li>• Interview Journey (5 steps)</li>
                  <li>• Job Creation with AI Agent Selection</li>
                  <li>• AI Agent Configuration Flow</li>
                  <li>• Detailed Results Analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-400">Mock Data Included</h4>
                <ul className="text-sm text-neutral-300 space-y-1">
                  <li>• 5 Jobs, 6 Candidates, 4 Interviews</li>
                  <li>• 3 AI Agents, 2 Results</li>
                  <li>• 5 Notifications, 4 Users</li>
                  <li>• Full company profiles</li>
                  <li>• Custom questions & criteria</li>
                  <li>• Complete interview transcripts</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="success">✓ Green Theme</Badge>
              <Badge variant="success">✓ Responsive Design</Badge>
              <Badge variant="success">✓ Professional UI</Badge>
              <Badge variant="success">✓ Google Meet Style</Badge>
              <Badge variant="success">✓ Charts & Analytics</Badge>
              <Badge variant="success">✓ 10 Error Pages</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
