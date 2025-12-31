# Admin Management System Guide

## Overview

The HireFlow AI platform now has a complete database-backed admin management system that allows super admins to create and manage companies and recruiters.

## Database Structure

### Tables

#### 1. Companies Table
Stores company information for organizations using the platform.

**Key Fields:**
- `id` - Unique company identifier
- `name` - Company name (required)
- `email` - Company contact email
- `phone` - Contact phone number
- `website` - Company website URL
- `industry` - Industry sector
- `size` - Company size (e.g., "1-10", "11-50")
- `description` - Company description
- `address`, `city`, `state`, `country`, `postal_code` - Location details
- `status` - active | inactive | suspended (default: active)
- `subscription_plan` - basic | professional | enterprise
- `subscription_ends_at` - Subscription expiration date

#### 2. Profiles Table
Extends auth.users with additional user information and role management.

**Key Fields:**
- `id` - References auth.users(id)
- `email` - User email (synced from auth.users)
- `full_name` - User's full name
- `avatar_url` - Profile picture URL
- `phone` - Contact phone number
- `role` - super_admin | recruiter (required)
- `company_id` - Foreign key to companies (null for super_admins, required for recruiters)
- `job_title` - User's job title
- `department` - Department within company
- `status` - active | inactive | suspended (default: active)
- `last_login_at` - Last login timestamp

## Security & Permissions

### Row Level Security (RLS)

All tables have RLS enabled with strict policies:

#### Companies Policies:
- Super admins can view, create, update, and delete all companies
- Recruiters can only view their own company
- No public access

#### Profiles Policies:
- Users can view and update their own profile
- Super admins can view, create, update, and delete all profiles
- Recruiters can view profiles within their company
- No public access

### Key Constraints:
- Recruiters MUST be assigned to a company
- Super admins CANNOT be assigned to a company
- This is enforced at both database and application level

## Admin Management Flow

### 1. Create a Company

**Steps:**
1. Navigate to `/admin/companies`
2. Click "Add Company"
3. Fill in company details:
   - Name (required)
   - Email (required)
   - Industry and size
   - Address information
   - Subscription plan
4. Click "Create Company"

**What happens:**
- Company is created in the database with status "active"
- Company appears in the companies list
- Company is now available for recruiter assignment

### 2. Create Recruiters for a Company

**Steps:**
1. Navigate to `/admin/users`
2. Click "Add User"
3. Fill in user details:
   - Full Name (required)
   - Email (required)
   - Password (required, min 6 characters)
   - Phone number
   - Role: Select "Recruiter"
   - Company: Select from active companies
   - Job Title and Department (optional)
4. Click "Create User"

**What happens:**
- User account is created in Supabase Auth
- Profile is created in profiles table
- User is linked to the selected company
- User can now log in with email/password

### 3. Create Super Admin

**Steps:**
1. Navigate to `/admin/users`
2. Click "Add User"
3. Fill in user details:
   - Full Name (required)
   - Email (required)
   - Password (required, min 6 characters)
   - Role: Select "Super Admin"
4. Click "Create User"

**Note:** Company field is hidden for super admins as they belong to the platform, not any specific company.

## Admin Pages

### Companies Management (`/admin/companies`)
- View all companies
- Search and filter companies
- See recruiter count for each company
- Create new companies
- View company details
- Edit company information

### Users Management (`/admin/users`)
- View all users (super admins and recruiters)
- Search by name or email
- Filter by role and status
- View company association
- Create new users
- Delete users
- View last login time

### Create Company (`/admin/companies/create`)
- Comprehensive form for company creation
- All fields with validation
- Success/error handling

### Create User (`/admin/users/create`)
- Role-based form that adapts:
  - Shows company selector only for recruiters
  - Shows warning for super admins
- Password requirements enforced
- Loads active companies dynamically

## API Service Functions

All admin operations use the `adminService` located in `/src/services/adminService.ts`:

### Company Functions:
- `getAllCompanies()` - Get all companies
- `getCompanyById(id)` - Get single company
- `createCompany(data)` - Create new company
- `updateCompany(id, data)` - Update company
- `deleteCompany(id)` - Delete company
- `getCompanyRecruiters(companyId)` - Get all recruiters for a company
- `getCompanyStats(companyId)` - Get recruiter count

### User Functions:
- `getAllUsers()` - Get all users with company data
- `getUserById(id)` - Get single user
- `createUser(data)` - Create new user (creates both auth and profile)
- `updateUserProfile(id, data)` - Update user profile
- `deleteUser(id)` - Delete user (removes both auth and profile)

### Stats Functions:
- `getPlatformStats()` - Get total companies, users, and recruiters

## Usage Example

### Complete Flow: Company to Recruiter

1. **Admin creates company "TechCorp"**
   ```
   Name: TechCorp Inc.
   Email: contact@techcorp.com
   Industry: Technology
   Size: 50-200
   Subscription: Professional
   ```

2. **Admin creates recruiter for TechCorp**
   ```
   Full Name: John Doe
   Email: john@techcorp.com
   Password: securepass123
   Role: Recruiter
   Company: TechCorp Inc.
   Job Title: Senior Recruiter
   ```

3. **Recruiter can now log in**
   - Email: john@techcorp.com
   - Password: securepass123
   - Has access to TechCorp's data only
   - Can manage jobs, candidates, interviews for TechCorp

4. **Admin can create more recruiters**
   - All recruiters under TechCorp share company data
   - Each recruiter has their own login credentials
   - All subject to company's subscription limits

## Error Handling

The system includes comprehensive error handling:

- **Validation errors** - Clear messages for missing/invalid data
- **Database errors** - User-friendly error messages
- **Authentication errors** - Proper handling of auth failures
- **Constraint violations** - Prevents invalid data (e.g., recruiter without company)
- **Rollback on failure** - If profile creation fails, auth user is deleted

## Testing the System

1. Start the development server
2. Navigate to `/admin/companies/create`
3. Create a test company
4. Navigate to `/admin/users/create`
5. Create a recruiter assigned to that company
6. Verify recruiter appears in `/admin/users`
7. Verify recruiter count shows on company card in `/admin/companies`

## Database Access

All database operations use Supabase client with proper authentication:
- Uses RLS for security
- Requires authenticated super admin user
- All queries respect RLS policies
- Automatic timestamps for created_at and updated_at

## Future Enhancements

Potential additions to the admin system:
- Company logo upload
- Bulk user import
- User invitation emails
- Activity logging
- Advanced analytics
- Subscription management
- Company settings configuration
