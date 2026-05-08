# Samadiyyah Frontend - Feature Guide

## All Pages and Features

### 1. Home Page (`/`)
**Purpose**: Welcome new users and display active pools

**Features**:
- ✅ Hero section with call-to-action buttons
- ✅ Feature highlights explaining how Samadiyyah works
- ✅ Live pool listing showing:
  - Pool title and description
  - Progress bar with percentage
  - Current total vs goal amount
  - Remaining amount needed
  - Creation date
- ✅ Clickable pool cards linking to contribution page
- ✅ Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- ✅ Empty state when no pools exist

**Who Can Access**: Everyone (anonymous)

**Key Sections**:
- Branding with Heart icon
- "Sign In" and "Get Started" buttons
- How it works cards (Create, Share, Reach Goal)
- Active pools grid

---

### 2. Login Page (`/auth/login`)
**Purpose**: Authenticate existing users

**Features**:
- ✅ Email input field
- ✅ Password input field
- ✅ Sign in button
- ✅ Error handling with toast notifications
- ✅ Success message before redirecting to dashboard
- ✅ Link to registration page
- ✅ Terms and privacy policy footer
- ✅ Loading state during submission
- ✅ Branded card design with gradient background

**API Calls**:
- POST `/api/auth/login`

**Validation**:
- Email required
- Password required
- Server-side validation via API

**On Success**:
- Stores token in localStorage
- Stores user info in localStorage
- Redirects to dashboard

**On Error**:
- Shows error toast
- Keeps user on login page

---

### 3. Register Page (`/auth/register`)
**Purpose**: Create new user accounts

**Features**:
- ✅ Email input field
- ✅ Password input field (min 6 characters)
- ✅ Confirm password field
- ✅ Password validation (must match)
- ✅ Create account button
- ✅ Error handling with helpful messages
- ✅ Link to login page
- ✅ Loading state during submission
- ✅ Branded card design with gradient background

**Validation**:
- Email required
- Password required (min 6 characters)
- Passwords must match
- Client-side validation before submission
- Server-side validation via API

**API Calls**:
- POST `/api/auth/register`

**On Success**:
- Stores token in localStorage
- Stores user info in localStorage
- Shows success toast
- Redirects to dashboard

**On Error**:
- Shows error toast
- Keeps user on register page

---

### 4. Public Pool Page (`/pool/[shareToken]`)
**Purpose**: Allow anyone to view a pool and contribute

**Features**:

#### Pool Information
- ✅ Pool title and description
- ✅ Progress bar showing % complete
- ✅ Stats grid:
  - Current Total (blue card)
  - Goal Amount (green card)
  - Remaining Amount (rose card)
- ✅ Copy share link button
- ✅ Real-time updates after contributions

#### Recent Contributions Section
- ✅ List of recent contributions
- ✅ Shows contributor name or "Anonymous"
- ✅ Shows contribution amount
- ✅ Shows optional message
- ✅ Shows contribution date
- ✅ Styled with left border indicator

#### Contribution Form (Sticky Sidebar)
- ✅ Amount field (required, must be > 0)
- ✅ Name field (optional, defaults to "Anonymous")
- ✅ Message field (optional)
- ✅ Submit button
- ✅ Helpful message about anonymous contributions
- ✅ Loading state during submission
- ✅ Form resets after success

**Who Can Access**: Everyone (anonymous or logged in)

**API Calls**:
- GET `/api/pools/share/:shareToken` (view pool)
- POST `/api/pools/share/:shareToken/join` (contribute)

**Key Behavior**:
- Includes token in request if user is logged in
- Works without token for anonymous contributions
- Updates pool stats after contribution
- Shows contribution in recent list immediately
- Shows success/error toasts

**Error Handling**:
- Invalid amount validation
- Pool not found error
- Server errors with helpful messages

---

### 5. User Dashboard (`/app/dashboard/page.tsx`)
**Purpose**: Manage personal Samadiyyah pools

**Features**:

#### Dashboard Header
- ✅ Title "Your Pools"
- ✅ Subtitle with description
- ✅ "New Pool" button with dialog

#### Stats Overview
- ✅ Total Pools card
- ✅ Active Pools card
- ✅ Draft Pools card
- ✅ Auto-calculated from pool data

#### Create Pool Dialog
- ✅ Modal dialog with form
- ✅ Title field (required)
- ✅ Description field (optional)
- ✅ Status dropdown (draft/published)
- ✅ Create button
- ✅ Closes on success
- ✅ Resets form after creation

#### Pool Cards by Status

**Published Pools Section**:
- ✅ Unlocked icon
- ✅ Pool title and description
- ✅ Progress bar
- ✅ Current/goal amounts
- ✅ Status badge (green)
- ✅ Share button (copies link)
- ✅ Delete button

**Draft Pools Section**:
- ✅ Locked icon
- ✅ Pool title and description
- ✅ Progress bar
- ✅ Current/goal amounts
- ✅ Status badge (yellow)
- ✅ Publish button (changes status)
- ✅ Delete button

**Archived Pools Section**:
- ✅ Archived icon
- ✅ All same information as published
- ✅ Status badge (gray)

#### Empty State
- ✅ Icon and text
- ✅ "Create Pool" button
- ✅ Dialog trigger for creating first pool

**Who Can Access**: Authenticated users only

**Protection**:
- Checks for token in useEffect
- Redirects to login if not authenticated
- Shows loading state while fetching

**API Calls**:
- GET `/api/pools/mine` (list user's pools)
- POST `/api/pools` (create pool)
- PATCH `/api/pools/:id` (publish pool)
- DELETE `/api/pools/:id` (delete pool)

**Key Actions**:
- **Create**: Opens dialog, shows form, creates pool via API
- **Publish**: Changes status from draft to published
- **Share**: Copies shareable link to clipboard (shows toast)
- **Delete**: Shows confirmation dialog before deleting

**Responsive Behavior**:
- Header stacks on mobile
- Grid becomes 1 column on mobile
- Full features on desktop

---

### 6. Navigation Bar (Global)
**Purpose**: Provide site navigation and user account access

**Features**:

#### Desktop Navigation
- ✅ Logo with Heart icon (clickable link to home)
- ✅ "Pools" link to home page
- ✅ When logged in:
  - "Dashboard" link
  - User dropdown with email
  - Dropdown menu with:
    - Email address (disabled)
    - Dashboard link
    - Logout option (red)
- ✅ When logged out:
  - "Sign In" button
  - "Get Started" button

#### Mobile Navigation
- ✅ Logo on left
- ✅ Hamburger menu on right
- ✅ Same menu items as desktop in dropdown
- ✅ Responsive dropdown alignment

#### Features
- ✅ Displays user email when logged in
- ✅ Responsive design (hidden on mobile, visible on desktop)
- ✅ Smooth transitions
- ✅ Logout clears localStorage and redirects
- ✅ Auth state read from localStorage on mount
- ✅ Prevents hydration mismatch with `mounted` check

**Styling**:
- ✅ White background with border
- ✅ Sticky at top of page
- ✅ Max-width container
- ✅ Proper spacing and alignment

---

## User Workflows

### New User Journey
1. Visit home page (/)
2. See featured pools
3. Click "Get Started" → Register page
4. Create account
5. Redirected to dashboard
6. Create first pool
7. Pool appears in published/draft section
8. Copy share link
9. Share with others
10. People contribute via public link

### Anonymous Contributor Journey
1. Receive pool share link
2. Visit `/pool/[shareToken]`
3. See pool details and progress
4. Enter amount and name (optional)
5. Submit contribution
6. See success message
7. Contribution appears in list
8. See progress bar update

### Logged-in Contributor Journey
1. Same as anonymous
2. But their user ID is recorded
3. They can track their contributions in profile (future feature)

### Pool Owner Journey
1. Login to dashboard
2. Create new pool (draft)
3. Add title and description
4. Publish when ready
5. Copy share link
6. Monitor contributions via pool page
7. See live progress updates
8. Can unpublish or delete if needed

---

## Data Flow

### Authentication Flow
```
Register/Login Page → API Auth Call → Token + User Stored → Dashboard
```

### Pool Creation Flow
```
Dashboard → New Pool Dialog → API Create Call → Pool Added to List
```

### Pool Contribution Flow
```
Public Pool Page → Contribution Form → API Join Call → Progress Updates
```

### Pool Navigation Flow
```
Home Page → Pool Card Click → Public Pool Page → Share Link Copy
```

---

## Error Handling

All errors are handled gracefully with:
- ✅ Toast notifications showing error messages
- ✅ User stays on current page
- ✅ Form remains filled (for retry)
- ✅ Network error messages
- ✅ Validation error messages
- ✅ API error messages from backend

---

## Responsive Breakpoints

- **Mobile**: 0px - 640px
  - Single column layouts
  - Hamburger menu
  - Full-width cards
  - Stack all elements

- **Tablet**: 640px - 1024px (md:)
  - 2 column grids
  - Desktop nav visible
  - Improved spacing

- **Desktop**: 1024px+ (lg:)
  - 3 column grids
  - Full features
  - Optimal spacing

---

## Accessibility Features

- ✅ Semantic HTML
- ✅ Form labels with htmlFor
- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Color contrast compliant
- ✅ Button states clear
- ✅ Loading indicators
- ✅ Error messages clear

---

## Summary

The frontend is a complete, production-ready application with:
- ✅ 6 main pages
- ✅ Full authentication flow
- ✅ Pool management
- ✅ Public contributions
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Error handling
- ✅ Accessible UI
- ✅ Modern styling

Ready to connect to your backend API!
