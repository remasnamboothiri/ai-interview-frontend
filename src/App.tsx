import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { TestingHub } from '@/pages/TestingHub';

import { LandingPage } from '@/pages/public/LandingPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage';
import { EmailVerificationPending } from '@/pages/auth/EmailVerificationPending';
import { EmailVerificationSuccess } from '@/pages/auth/EmailVerificationSuccess';
import { OTPVerificationPage } from '@/pages/auth/OTPVerificationPage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';

import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { ServerErrorPage } from '@/pages/errors/ServerErrorPage';
import { MaintenancePage } from '@/pages/errors/MaintenancePage';
import { OfflinePage } from '@/pages/errors/OfflinePage';
import { SessionExpiredPage } from '@/pages/errors/SessionExpiredPage';
import { InterviewLinkExpiredPage } from '@/pages/errors/InterviewLinkExpiredPage';
import { UploadErrorPage } from '@/pages/errors/UploadErrorPage';
import { BrowserNotSupportedPage } from '@/pages/errors/BrowserNotSupportedPage';
import { PermissionDeniedPage } from '@/pages/errors/PermissionDeniedPage';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UsersManagement } from '@/pages/admin/UsersManagement';
import { UserDetailPage } from '@/pages/admin/UserDetailPage';
import { CreateUserPage } from '@/pages/admin/CreateUserPage';
import { CompaniesManagement } from '@/pages/admin/CompaniesManagement';
import { CompanyDetailPage } from '@/pages/admin/CompanyDetailPage';
import { CreateCompanyPage } from '@/pages/admin/CreateCompanyPage';
import { CompanyRecruitersPage } from '@/pages/admin/CompanyRecruitersPage';
import { PlatformActivities } from '@/pages/admin/PlatformActivities';
import { PlatformSettings } from '@/pages/admin/PlatformSettings';

import { DashboardPage } from '@/pages/recruiter/DashboardPage';
import { JobsPage } from '@/pages/recruiter/JobsPage';
import { CreateJobPage } from '@/pages/recruiter/CreateJobPage';
import { JobDetailPage } from '@/pages/recruiter/JobDetailPage';
import { CandidatesPage } from '@/pages/recruiter/CandidatesPage';
import { AddCandidatePage } from '@/pages/recruiter/AddCandidatePage';
import { ImportCandidatesPage } from '@/pages/recruiter/ImportCandidatesPage';
import { CandidateProfilePage } from '@/pages/recruiter/CandidateProfilePage';
import { InterviewsPage } from '@/pages/recruiter/InterviewsPage';
import { ScheduleInterviewPage } from '@/pages/recruiter/ScheduleInterviewPage';
import { InterviewCalendarPage } from '@/pages/recruiter/InterviewCalendarPage';
import { InterviewDetailPage } from '@/pages/recruiter/InterviewDetailPage';
import { AIAgentsPage } from '@/pages/recruiter/AIAgentsPage';
import { CreateAgentPage } from '@/pages/recruiter/CreateAgentPage';
import { ResultsPage } from '@/pages/recruiter/ResultsPage';
import { ResultDetailPage } from '@/pages/recruiter/ResultDetailPage';
import { ProfilePage } from '@/pages/recruiter/ProfilePage';
import { SettingsPage } from '@/pages/recruiter/SettingsPage';

import { InterviewInvitation } from '@/pages/candidate/InterviewInvitation';
import { SystemCheck } from '@/pages/candidate/SystemCheck';
import { WaitingRoom } from '@/pages/candidate/WaitingRoom';
import { InterviewRoomPage } from '@/pages/candidate/InterviewRoomPage';
import { InterviewComplete } from '@/pages/candidate/InterviewComplete';

import { NotificationsCenter } from '@/pages/shared/NotificationsCenter';

import { ROUTES } from '@/constants';
import { CompanyManagementPage } from '@/pages/recruiter/CompanyManagementPage';
import { RecruiterCreateCompanyPage } from '@/pages/recruiter/RecruiterCreateCompanyPage';
import { RecruiterCompanyDetailPage } from '@/pages/recruiter/RecruiterCompanyDetailPage';



function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
          <Route path="/email-verification-pending" element={<EmailVerificationPending />} />
          <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
          <Route path="/otp-verification" element={<OTPVerificationPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="/session-expired" element={<SessionExpiredPage />} />
          <Route path="/interview-link-expired" element={<InterviewLinkExpiredPage />} />
          <Route path="/upload-error" element={<UploadErrorPage />} />
          <Route path="/browser-not-supported" element={<BrowserNotSupportedPage />} />
          <Route path="/permission-denied" element={<PermissionDeniedPage />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <UsersManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <CompaniesManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <UserDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/create"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <CreateUserPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies/:id"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <CompanyDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies/create"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <CreateCompanyPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies/:id/recruiters"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <CompanyRecruitersPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activities"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <PlatformActivities />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout>
                  <PlatformSettings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.JOBS}
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <JobsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs/create"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <CreateJobPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <CreateJobPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <JobDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.CANDIDATES}
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <CandidatesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates/add"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <AddCandidatePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates/import"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <ImportCandidatesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates/:id"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <CandidateProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.INTERVIEWS}
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <InterviewsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/schedule"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <ScheduleInterviewPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/calendar"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <InterviewCalendarPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/:id"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <InterviewDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.AI_AGENTS}
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <AIAgentsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-agents/create"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <CreateAgentPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-agents/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <CreateAgentPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.RESULTS}
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <ResultsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/results/:id"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <ResultDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
                    <Route
            path={ROUTES.COMPANIES}
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <CompanyManagementPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/companies/create"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <RecruiterCreateCompanyPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/companies/:id"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <RecruiterCompanyDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/companies/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'super_admin']}>
                <MainLayout>
                  <RecruiterCreateCompanyPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />


          


          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/interview/invitation" element={<InterviewInvitation />} />
          <Route path="/interview/system-check" element={<SystemCheck />} />
          <Route path="/interview/waiting-room" element={<WaitingRoom />} />
          <Route path="/interview-room" element={<InterviewRoomPage />} />
          <Route path="/interview/complete" element={<InterviewComplete />} />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotificationsCenter />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/testing" element={<TestingHub />} />
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
          
          

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
