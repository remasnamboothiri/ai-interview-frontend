export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-interview-backend-6672.onrender.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    REGISTER: '/api/auth/register/',
    RESET_PASSWORD: '/api/auth/reset-password/',
    REFRESH: '/api/auth/refresh/',
  },
  ADMIN: {
    AUTH: {
      LOGIN: '/api/admin/auth/login/',
    },
    USERS: '/api/admin/users/',
    JOBS: '/api/admin/jobs/',
    CANDIDATES: '/api/admin/candidates/',
    INTERVIEWS: '/api/admin/interviews/',
    DASHBOARD: '/api/admin/dashboard/stats/',
    SETTINGS: '/api/admin/settings/',
  },
  JOBS: '/api/jobs/',
  CANDIDATES: '/api/candidates/',
  INTERVIEWS: '/api/interviews/',
  AGENTS: '/api/agents/',
  RESULTS: '/api/results/',
  APPLICATIONS: '/api/applications/',
  PROFILE: '/api/profile/',
  UTILS: {
    TTS: '/api/tts/generate/',
    FILE_UPLOAD: '/api/files/upload/',
    EMAIL_INVITE: '/api/emails/interview-invite/',
    HEALTH: '/api/health/',
  },
};

export const ROUTES = {
  HOME: '/landing',
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',
  DASHBOARD: '/dashboard',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  CANDIDATES: '/candidates',
  CANDIDATE_DETAIL: '/candidates/:id',
  INTERVIEWS: '/interviews',
  INTERVIEW_DETAIL: '/interviews/:id',
  INTERVIEW_SESSIONS: '/interviews/:interviewId/sessions',
  INTERVIEW_SCREENSHOTS: '/interviews/:interviewId/screenshots',
  AI_AGENTS: '/ai-agents',
  RESULTS: '/results',
  APPLICATIONS: '/applications',
  COMPANIES: '/companies',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    COMPANIES: '/admin/companies',
    ACTIVITIES: '/admin/activities',
    SETTINGS: '/admin/settings',
  },
  CANDIDATE: {
    INTERVIEW: '/interview/:uuid',
  },
};

export const INTERVIEW_LEVELS = {
  BASIC_SCREENING: 'basic_screening',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
} as const;

export const INTERVIEW_LEVEL_LABELS = {
  [INTERVIEW_LEVELS.BASIC_SCREENING]: 'Basic Screening',
  [INTERVIEW_LEVELS.JUNIOR]: 'Junior Level',
  [INTERVIEW_LEVELS.MID]: 'Mid Level',
  [INTERVIEW_LEVELS.SENIOR]: 'Senior Level',
  [INTERVIEW_LEVELS.LEAD]: 'Lead Level',
};

export const JOB_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
} as const;

export const CANDIDATE_STATUSES = {
  NEW: 'new',
  INVITED: 'invited',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export const INTERVIEW_STATUSES = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const STATUS_COLORS = {
  [JOB_STATUSES.DRAFT]: 'neutral',
  [JOB_STATUSES.ACTIVE]: 'success',
  [JOB_STATUSES.PAUSED]: 'warning',
  [JOB_STATUSES.CLOSED]: 'danger',
  [CANDIDATE_STATUSES.NEW]: 'neutral',
  [CANDIDATE_STATUSES.INVITED]: 'warning',
  [CANDIDATE_STATUSES.IN_PROGRESS]: 'warning',
  [CANDIDATE_STATUSES.COMPLETED]: 'success',
  [CANDIDATE_STATUSES.REJECTED]: 'danger',
  [INTERVIEW_STATUSES.SCHEDULED]: 'neutral',
  [INTERVIEW_STATUSES.IN_PROGRESS]: 'warning',
  [INTERVIEW_STATUSES.COMPLETED]: 'success',
  [INTERVIEW_STATUSES.CANCELLED]: 'danger',
};

export const COMPANY_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;
