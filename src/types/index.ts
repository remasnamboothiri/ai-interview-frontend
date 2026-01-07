export type UserRole = 'recruiter' | 'super_admin' | 'candidate';

export type InterviewLevel = 'basic_screening' | 'junior' | 'mid' | 'senior' | 'lead';

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type JobStatus = 'draft' | 'active' | 'paused' | 'closed';

export type CandidateStatus = 'new' | 'invited' | 'in_progress' | 'completed' | 'rejected';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  company?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  workMode?: string;   
  description?: string;
  skillsRequired?: string[];   // NEW FIELD
  requirements?: string;
  benefits?: string;
  applicationDeadline?: string;
  status: JobStatus;
  job_description_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Candidate {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  resume_url?: string;
  skills?: string[];
  education?: Education[];        // NEW: Array of education records
  portfolio_url?: string;         // NEW: Portfolio website URL
  linkedin_url?: string;          // NEW: LinkedIn profile URL
  experience_years?: number;
  current_company?: string;
  status: CandidateStatus;
  job_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  uuid: string;
  candidate_id: string;
  job_id: string;
  level: InterviewLevel;
  status: InterviewStatus;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  ai_agent_id?: string;
  screening_criteria?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description?: string;
  prompt_template: string;
  evaluation_criteria: Record<string, unknown>;
  model_parameters: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InterviewResult {
  id: string;
  interview_id: string;
  candidate_id: string;
  job_id: string;
  transcript: string;
  scores: Record<string, number>;
  assessment_summary: string;
  strengths: string[];
  weaknesses: string[];
  overall_score: number;
  passed: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_jobs: number;
  active_interviews: number;
  total_candidates: number;
  pending_results: number;
  interviews_this_week: number;
  success_rate: number;
}

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    location: 'San Francisco, CA',
    size: '500-1000',
    description: 'Leading technology company specializing in AI and machine learning solutions.',
    email: 'contact@techcorp.com',
    phone: '+1 (555) 123-4567',
    website: 'https://techcorp.com',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: '2',
    name: 'Global Finance Inc',
    industry: 'Finance',
    location: 'New York, NY',
    size: '1000+',
    description: 'International financial services company providing banking and investment solutions.',
    email: 'info@globalfinance.com',
    phone: '+1 (555) 234-5678',
    website: 'https://globalfinance.com',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: '3',
    name: 'HealthTech Innovations',
    industry: 'Healthcare',
    location: 'Boston, MA',
    size: '100-500',
    description: 'Healthcare technology startup focused on digital health solutions.',
    email: 'hello@healthtech.com',
    phone: '+1 (555) 345-6789',
    website: 'https://healthtech.com',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '4',
    name: 'EduLearn Platform',
    industry: 'Education',
    location: 'Austin, TX',
    size: '50-100',
    description: 'Online education platform providing courses and training programs.',
    email: 'support@edulearn.com',
    phone: '+1 (555) 456-7890',
    website: 'https://edulearn.com',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: '5',
    name: 'RetailMax Corp',
    industry: 'Retail',
    location: 'Chicago, IL',
    size: '1000+',
    description: 'Large retail corporation with nationwide presence.',
    email: 'contact@retailmax.com',
    phone: '+1 (555) 567-8901',
    website: 'https://retailmax.com',
    status: 'inactive',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
];

// Add this at the very end of the file, after all existing code:

export type CompanyStatus = 'active' | 'inactive' | 'pending';

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  size: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
}
