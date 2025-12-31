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
  description?: string;
  requirements?: string;
  status: JobStatus;
  job_description_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  resume_url?: string;
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
