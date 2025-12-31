import { supabase } from './supabase';

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  logo_url?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan?: string;
  subscription_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role: 'super_admin' | 'recruiter';
  company_id?: string;
  job_title?: string;
  department?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithCompany extends Profile {
  company?: Company;
}

export interface CreateCompanyData {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  subscription_plan?: string;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  status?: 'active' | 'inactive' | 'suspended';
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role: 'super_admin' | 'recruiter';
  company_id?: string;
  job_title?: string;
  department?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  job_title?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'suspended';
  company_id?: string;
}

class AdminService {
  async getAllCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...companyData, status: 'active' }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCompany(id: string, companyData: UpdateCompanyData): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getCompanyRecruiters(companyId: string): Promise<ProfileWithCompany[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('company_id', companyId)
      .eq('role', 'recruiter')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAllUsers(): Promise<ProfileWithCompany[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        company:companies(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserById(id: string): Promise<ProfileWithCompany | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createUser(userData: CreateUserData): Promise<Profile> {
    const { email, password, role, company_id, ...additionalData } = userData;

    if (role === 'recruiter' && !company_id) {
      throw new Error('Recruiters must be assigned to a company');
    }

    if (role === 'super_admin' && company_id) {
      throw new Error('Super admins cannot be assigned to a company');
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          role,
          company_id: role === 'recruiter' ? company_id : null,
          ...additionalData,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return profileData;
  }

  async updateUserProfile(id: string, profileData: UpdateProfileData): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) throw profileError;

    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) throw authError;
  }

  async getCompanyStats(companyId: string) {
    const { count: recruiterCount, error: recruiterError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('role', 'recruiter');

    if (recruiterError) throw recruiterError;

    return {
      recruiterCount: recruiterCount || 0,
    };
  }

  async getPlatformStats() {
    const [companiesResult, usersResult, recruitersResult] = await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'recruiter'),
    ]);

    if (companiesResult.error) throw companiesResult.error;
    if (usersResult.error) throw usersResult.error;
    if (recruitersResult.error) throw recruitersResult.error;

    return {
      totalCompanies: companiesResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalRecruiters: recruitersResult.count || 0,
    };
  }
}

export const adminService = new AdminService();
