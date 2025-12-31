/*
  # Create Companies and User Profiles Schema

  ## Overview
  This migration sets up the core database structure for HireFlow AI, enabling super admins 
  to manage companies and recruiters with proper role-based access control.

  ## New Tables
  
  ### 1. `companies`
  Stores company information for organizations using the platform.
  - `id` (uuid, primary key) - Unique company identifier
  - `name` (text, required) - Company name
  - `email` (text) - Company contact email
  - `phone` (text) - Company contact phone
  - `website` (text) - Company website URL
  - `industry` (text) - Industry sector
  - `size` (text) - Company size (e.g., "1-10", "11-50")
  - `logo_url` (text) - Company logo image URL
  - `description` (text) - Company description
  - `address` (text) - Company address
  - `city` (text) - City location
  - `state` (text) - State/Province
  - `country` (text) - Country
  - `postal_code` (text) - Postal/ZIP code
  - `status` (text, default 'active') - Company status (active, inactive, suspended)
  - `subscription_plan` (text, default 'basic') - Subscription tier
  - `subscription_ends_at` (timestamptz) - Subscription expiration date
  - `created_at` (timestamptz, default now()) - Creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ### 2. `profiles`
  Extends auth.users with additional user information and role management.
  - `id` (uuid, primary key) - References auth.users(id)
  - `email` (text, required) - User email (synced from auth.users)
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile picture URL
  - `phone` (text) - Contact phone number
  - `role` (text, required) - User role (super_admin, recruiter)
  - `company_id` (uuid) - Foreign key to companies table (null for super_admins)
  - `job_title` (text) - User's job title
  - `department` (text) - Department within company
  - `status` (text, default 'active') - Account status (active, inactive, suspended)
  - `last_login_at` (timestamptz) - Last login timestamp
  - `created_at` (timestamptz, default now()) - Profile creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  Both tables have RLS enabled with the following policies:

  #### Companies Table Policies:
  1. **Super admins can view all companies** - SELECT policy for super_admin role
  2. **Recruiters can view their own company** - SELECT policy for recruiters
  3. **Super admins can create companies** - INSERT policy for super_admin role
  4. **Super admins can update companies** - UPDATE policy for super_admin role
  5. **Super admins can delete companies** - DELETE policy for super_admin role

  #### Profiles Table Policies:
  1. **Users can view their own profile** - SELECT policy for authenticated users
  2. **Super admins can view all profiles** - SELECT policy for super_admin role
  3. **Recruiters can view profiles in their company** - SELECT policy for same company
  4. **Super admins can create profiles** - INSERT policy for super_admin role
  5. **Users can update their own profile** - UPDATE policy for profile owner
  6. **Super admins can update any profile** - UPDATE policy for super_admin role
  7. **Super admins can delete profiles** - DELETE policy for super_admin role

  ## Indexes
  - Index on profiles.company_id for efficient company-user lookups
  - Index on profiles.role for role-based queries
  - Index on profiles.email for email lookups
  - Index on companies.status for filtering active companies

  ## Important Notes
  1. Super admins have company_id = NULL (they don't belong to any company)
  2. Recruiters must have a valid company_id
  3. All timestamps use timestamptz for timezone support
  4. Status fields use text type for flexibility (can be extended to ENUM later)
  5. Foreign key constraints ensure data integrity
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  website text,
  industry text,
  size text,
  logo_url text,
  description text,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  subscription_plan text DEFAULT 'basic',
  subscription_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  role text NOT NULL CHECK (role IN ('super_admin', 'recruiter')),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  job_title text,
  department text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT recruiter_must_have_company CHECK (
    (role = 'super_admin' AND company_id IS NULL) OR 
    (role = 'recruiter' AND company_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Companies Policies

-- Super admins can view all companies
CREATE POLICY "Super admins can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Recruiters can view their own company
CREATE POLICY "Recruiters can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_id = companies.id
      AND profiles.role = 'recruiter'
    )
  );

-- Super admins can create companies
CREATE POLICY "Super admins can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Super admins can update companies
CREATE POLICY "Super admins can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Super admins can delete companies
CREATE POLICY "Super admins can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Profiles Policies

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  );

-- Recruiters can view profiles in their company
CREATE POLICY "Recruiters can view profiles in their company"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.company_id = profiles.company_id
      AND p.role = 'recruiter'
    )
  );

-- Super admins can create profiles
CREATE POLICY "Super admins can create profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Super admins can update any profile
CREATE POLICY "Super admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  );

-- Super admins can delete profiles
CREATE POLICY "Super admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();