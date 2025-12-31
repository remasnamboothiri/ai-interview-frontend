# AI Interview Platform - Pages Overview

## Quick Navigation

**Testing Hub**: Visit `/testing` to access all 37 pages organized in 7 categories.

---

## All Available Pages (37 Total)

### Public Pages (4)

1. **Landing Page** (`/landing`)
   - Full marketing homepage with hero section
   - 4 feature cards with icons
   - 3 customer testimonials with ratings
   - Call-to-action sections
   - Professional footer

2. **Registration** (`/register`)
   - Multi-step registration (3 steps)
   - Step 1: Basic info (name, email, phone)
   - Step 2: User type selection + Password
   - Step 3: Email confirmation sent
   - Progress indicators

3. **Forgot Password** (`/forgot-password`)
   - Email input form
   - Reset link request
   - Confirmation message

4. **Reset Password** (`/reset-password`)
   - New password with strength indicator
   - Password confirmation
   - Token validation
   - Success confirmation

---

### Authentication (6)

5. **User Login** (`/login`)
   - Universal login for all users
   - Email/password authentication
   - Clean, minimal design

6. **Admin Login** (`/admin/login`)
   - Separate admin portal
   - Administrator access

7. **Email Verification Pending** (`/email-verification-pending`)
   - Awaiting email confirmation
   - Resend email option
   - Instructions

8. **Email Verified** (`/email-verification-success`)
   - Success confirmation
   - Redirect to dashboard

9. **OTP Verification** (`/otp-verification`)
   - 6-digit code input (individual boxes)
   - Auto-focus next input
   - Resend with 60s countdown

10. **Change Password** (`/change-password`)
    - Current password verification
    - New password with confirmation
    - Success message

---

### Error Pages (10)

11. **404 - Not Found** (`/404`)
    - Friendly error message
    - Navigation options
    - Home and Dashboard links

12. **403 - Forbidden** (`/403`)
    - Access denied message
    - Contact administrator info

13. **500 - Server Error** (`/500`)
    - Internal server error
    - Retry button
    - Support contact

14. **Maintenance Mode** (`/maintenance`)
    - Platform maintenance notice
    - Estimated return time
    - Status updates

15. **Network Offline** (`/offline`)
    - Connection lost detection
    - Retry button
    - Troubleshooting tips

16. **Session Expired** (`/session-expired`)
    - JWT token expired
    - Re-login required
    - Data saved confirmation

17. **Interview Link Expired** (`/interview-link-expired`)
    - Invalid/expired link
    - Contact recruiter option
    - Support information

18. **Upload Error** (`/upload-error`)
    - File upload failure reasons
    - Size/format/network errors
    - Retry option

19. **Browser Not Supported** (`/browser-not-supported`)
    - Outdated browser detection
    - Supported browsers list
    - Download links for Chrome, Firefox, Edge, Safari

20. **Permission Denied** (`/permission-denied`)
    - Camera/Microphone access required
    - Step-by-step enable instructions
    - Browser-specific guides

---

### Admin Pages (3)

21. **Admin Dashboard** (`/admin/dashboard`)
    - Platform-wide statistics
    - 4 stat cards: Users, Companies, Jobs, Interviews
    - User growth chart (Line graph)
    - Weekly activity chart (Bar chart)
    - Recent activity feed

22. **Users Management** (`/admin/users`)
    - Full user table with search
    - Filter by role and status
    - User details: name, email, role, company, last login
    - Actions: Edit, Delete, More options

23. **Companies Management** (`/admin/companies`)
    - Company cards with logos
    - Industry and company size
    - Metrics: recruiters, jobs, interviews
    - View Details and Edit options

---

### Recruiter Pages (8)

24. **Recruiter Dashboard** (`/dashboard`)
    - Personal recruitment stats
    - Recent activity feed
    - Quick actions sidebar
    - Interactive charts

25. **Jobs List** (`/jobs`)
    - 5 mock jobs with full details
    - Search by title/department
    - Filter by status
    - Job cards: title, location, candidates, requirements
    - Status badges: Active, Paused, Closed, Draft

26. **Candidates List** (`/candidates`)
    - 6 candidate cards in grid
    - Search by name/email
    - Filter by status
    - Cards: name, email, phone, job, status
    - Actions: View Profile, Schedule Interview

27. **Interviews List** (`/interviews`)
    - 4 mock interviews
    - Filter by status
    - Interview details: candidate, job, time, duration
    - Status-specific actions

28. **AI Agents** (`/ai-agents`)
    - 3 AI interviewer agents
    - Agent configuration
    - Evaluation criteria (progress bars)
    - Model parameters
    - Active/Inactive status

29. **Results List** (`/results`)
    - 2 detailed interview results
    - Overall scores with Pass/Fail badges
    - Score breakdown (5 categories)
    - Assessment summary
    - Strengths and weaknesses
    - Export options

30. **Profile** (`/profile`)
    - User profile management
    - Personal information

31. **Settings** (`/settings`)
    - Application preferences
    - Configuration options

---

### Candidate Interview Flow (5)

32. **Interview Invitation** (`/interview/invitation`)
    - Interview details card
    - Date, time, duration, job position
    - Preparation tips section
    - Technical requirements list
    - Accept & Prepare button

33. **System Check** (`/interview/system-check`)
    - Automated checks for:
      - Camera
      - Microphone
      - Internet connection
      - Browser compatibility
    - Loading animations
    - Success/Error indicators
    - Continue button

34. **Waiting Room** (`/interview/waiting-room`)
    - Countdown timer (MM:SS)
    - Auto-updates every second
    - Last minute reminders
    - Join button (enabled when ready)

35. **Live Interview** (`/interview-room`)
    - **GOOGLE MEET STYLE INTERFACE**
    - Dark theme
    - Dual video layout (AI + Candidate)
    - Recording indicator (pulsing red dot)
    - Live timer
    - Current question with progress (X/10)
    - Progress bar
    - Control bar (7 buttons):
      - Mic toggle
      - Camera toggle
      - End call (red, prominent)
      - Chat/transcript
      - Screen share
      - Settings
      - More options
    - Expandable live transcript panel
    - Timestamped conversation

36. **Interview Complete** (`/interview/complete`)
    - Success confirmation
    - Thank you message
    - What Happens Next section
    - Email confirmation notice
    - Action buttons

---

### Shared Pages (1)

37. **Notifications Center** (`/notifications`)
    - 5 sample notifications
    - Filter by type (all, interview, application, result, user)
    - Notification cards with icons
    - Read/Unread indicators
    - Actions: Mark as read, Delete
    - Mark all read option

---

## Mock Data Summary

### Jobs (5)
- Senior Software Engineer (Active) - Engineering - Remote
- Product Manager (Active) - Product - San Francisco
- Data Scientist (Active) - Data & Analytics - New York
- UX Designer (Paused) - Design - Remote
- DevOps Engineer (Active) - Engineering - Austin

### Candidates (6)
- John Doe (Completed) - Senior Software Engineer
- Jane Smith (In Progress) - Product Manager
- Mike Johnson (In Progress) - Data Scientist
- Sarah Williams (Invited) - UX Designer
- David Brown (New) - DevOps Engineer
- Emily Davis (Completed) - Product Manager

### Interviews (4)
- John Doe - Senior Software Engineer (Completed)
- Jane Smith - Product Manager (In Progress)
- Mike Johnson - Data Scientist (Scheduled)
- Emily Davis - Product Manager (Completed)

### AI Agents (3)
- Senior Technical Interviewer (Active)
- Product Management Interviewer (Active)
- Behavioral Interviewer (Active)

### Results (2)
- John Doe: 8.3/10 (Passed)
  - Technical depth: 8.5/10
  - Problem solving: 9.0/10
  - Communication: 7.5/10
  - Experience: 8.0/10
  - Culture fit: 8.5/10

- Emily Davis: 7.7/10 (Passed)
  - Product thinking: 7.5/10
  - Strategic vision: 8.0/10
  - Stakeholder management: 7.0/10
  - Analytical skills: 8.5/10
  - Communication: 7.5/10

### Notifications (5)
- Interview Scheduled (Unread)
- New Application Received (Unread)
- Interview Results Ready (Read)
- Email Verified (Read)
- New Team Member (Read)

---

## Complete User Flows

### 1. Registration Flow
Register → Email Pending → Verify Email → Success → Login

### 2. Password Recovery
Forgot Password → Check Email → Reset Password → Success → Login

### 3. Interview Journey (Candidate)
Invitation → System Check → Waiting Room → Live Interview → Complete

### 4. Admin Management
Login → Dashboard → Users/Companies Management

### 5. Recruiter Workflow
Dashboard → Post Job → Review Candidates → Schedule Interview → View Results

---

## Design Features

### UI/UX
- **Professional Green Theme**: Primary color palette
- **Responsive Design**: Mobile, tablet, desktop support
- **Clean Layouts**: Card-based design system
- **Smooth Transitions**: Hover effects and animations
- **Status Badges**: Color-coded for different states
- **Interactive Elements**: Buttons, filters, search
- **Loading States**: Spinners and progress indicators

### Components
- Sidebar navigation
- TopBar with user menu
- Modal dialogs
- Toast notifications
- Charts (Recharts)
- Progress bars
- Countdown timers
- Badge system
- Form inputs with validation

### Special Features
- **Google Meet Style Interview**: Professional video interface
- **Real-time Countdown**: Live timers in multiple pages
- **Password Strength Indicator**: Visual feedback
- **OTP Auto-focus**: Seamless input experience
- **Animated System Checks**: Loading states
- **Live Transcript**: Timestamped conversation
- **10 Error Pages**: Comprehensive error handling

---

## Technical Stack

- **Framework**: React 18 + TypeScript
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **State**: Zustand
- **Build**: Vite
- **Date Handling**: date-fns

---

## Route Structure

```
Public Routes:
/landing → Landing Page
/register → Registration
/forgot-password → Forgot Password
/reset-password → Reset Password

Auth Routes:
/login → User Login
/admin/login → Admin Login
/email-verification-pending → Email Pending
/email-verification-success → Email Success
/otp-verification → OTP Verification
/change-password → Change Password

Error Routes:
/404 → Not Found
/403 → Forbidden
/500 → Server Error
/maintenance → Maintenance
/offline → Offline
/session-expired → Session Expired
/interview-link-expired → Link Expired
/upload-error → Upload Error
/browser-not-supported → Browser Error
/permission-denied → Permissions

Admin Routes (Protected):
/admin/dashboard → Admin Dashboard
/admin/users → Users Management
/admin/companies → Companies Management

Recruiter Routes (Protected):
/dashboard → Recruiter Dashboard
/jobs → Jobs List
/candidates → Candidates List
/interviews → Interviews List
/ai-agents → AI Agents
/results → Results List
/profile → Profile
/settings → Settings

Candidate Routes:
/interview/invitation → Interview Invitation
/interview/system-check → System Check
/interview/waiting-room → Waiting Room
/interview-room → Live Interview
/interview/complete → Interview Complete

Shared Routes (Protected):
/notifications → Notifications Center

Development:
/testing → Testing Hub
/ → Home/Navigation
```

---

## Build Status

✅ **All pages compile successfully**
✅ **TypeScript validation passing**
✅ **Production ready**
✅ **No runtime errors**

---

## Development

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Navigate to `/testing` to explore all pages with organized categories.

---

## Documentation

- `COMPREHENSIVE_PAGES_LIST.md` - Detailed descriptions
- `PAGES_OVERVIEW.md` - This file
- `/testing` - Interactive navigation hub
