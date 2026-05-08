# Samadiyyah Frontend

A modern, responsive frontend for the Samadiyyah community pool management application built with Next.js 16, React 19, and Tailwind CSS.

## Overview

The Samadiyyah frontend allows users to:

- **Create & Manage Pools**: Authenticated users can create new Samadiyyah pools with a goal of 100,000
- **Share Pools**: Generate and share public links for others to contribute
- **View Progress**: Track contributions in real-time with progress bars and statistics
- **Contribute**: Anyone (logged in or anonymous) can contribute to published pools
- **Dashboard**: Manage personal pools with publish/draft/delete functionality

## Project Structure

```
/app
  /auth
    /login          - User login page
    /register       - User registration page
  /pool
    /[shareToken]   - Public pool contribution page
  /dashboard        - User dashboard for managing pools
  /page.tsx         - Home page with pool listings
  layout.tsx        - Root layout with navigation

/components
  /ui               - Shadcn UI components
  navigation.tsx    - Global navigation bar

/lib
  api.ts            - API utility functions
  utils.ts          - General utilities

/public             - Static assets
```

## Key Features

### 1. Authentication Pages
- **Login** (`/auth/login`): Sign in with email and password
- **Register** (`/auth/register`): Create a new account with password validation

### 2. Home Page (`/`)
- Hero section with call-to-action
- Feature highlights explaining how Samadiyyah works
- List of all published pools with progress indicators
- Each pool shows: title, description, progress %, amount, and creation date

### 3. Public Pool Page (`/pool/[shareToken]`)
- View pool details and progress towards the 100,000 goal
- Contribution form (anonymous or authenticated)
- Recent contributions list
- Share link button
- Real-time progress updates

### 4. User Dashboard (`/dashboard`)
- Protected route (requires login)
- Create new pools with draft/published options
- View all personal pools organized by status
- Publish draft pools
- Delete pools
- Copy share links
- Overview stats (total, active, draft pools)

### 5. Navigation Component
- Responsive navbar with mobile menu
- Shows user email when logged in
- Quick access to dashboard
- Logout functionality

## API Integration

All API calls go through `/api` endpoints (defined in the backend). The frontend uses:

### Pools Endpoints
- `GET /api/pools` - List published pools
- `GET /api/pools/share/:shareToken` - Get pool by share token
- `POST /api/pools` - Create new pool (authenticated)
- `GET /api/pools/mine` - List user's pools (authenticated)
- `PATCH /api/pools/:id` - Update pool (authenticated)
- `DELETE /api/pools/:id` - Delete pool (authenticated)
- `POST /api/pools/share/:shareToken/join` - Contribute to pool

### Auth Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user (authenticated)

## Authentication

The app uses JWT tokens stored in localStorage:
- Token key: `supabase_auth_token`
- User data key: `supabase_user`

All authenticated requests include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## UI Components

Built with shadcn/ui and Tailwind CSS:
- Button
- Card
- Input
- Textarea
- Label
- Progress
- Dialog
- Select
- Dropdown Menu
- Separator

## Styling

- **Color Scheme**: 3-color system with rose, blue, and gray
  - Primary: Rose-500 (accent)
  - Secondary: Blue-600 (action)
  - Neutrals: White, grays, black
- **Typography**: 
  - Sans: Geist (body text)
  - Mono: Geist Mono (code)
- **Responsive**: Mobile-first design with md: and lg: breakpoints

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with your API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

4. **Build for production**:
   ```bash
   pnpm build
   pnpm start
   ```

## File Organization

### Key Files
- `app/layout.tsx` - Root layout with Sonner toast provider
- `app/page.tsx` - Home page with pools listing
- `components/navigation.tsx` - Global navigation bar
- `lib/api.ts` - API utility functions

### Pages
- `/` - Home
- `/auth/login` - Login
- `/auth/register` - Register
- `/dashboard` - User dashboard (protected)
- `/pool/[shareToken]` - Public pool page

## Important Notes

1. **Authentication State**: User data is persisted in localStorage. The Navigation component reads from localStorage on mount to show correct UI state.

2. **Anonymous Contributions**: Users can contribute to pools without signing in. Contributions will have `submitted_by: null` in the backend.

3. **Error Handling**: All errors use the Sonner toast library for user feedback.

4. **Protected Routes**: The dashboard redirects to login if no token is found in localStorage.

## Development Tips

1. **Hot Reload**: Changes are reflected immediately in the preview
2. **API Mocking**: Update `/lib/api.ts` to mock endpoints during development
3. **Toast Notifications**: Use `toast.success()`, `toast.error()`, `toast.loading()` for feedback
4. **Navigation State**: Navigation component is a client component that syncs with localStorage

## Troubleshooting

**Blank page or "Loading..."**: 
- Check browser console for errors
- Verify API endpoints are correct
- Ensure backend is running

**Auth not working**:
- Check `localStorage` for token presence
- Verify login/register endpoints return correct data
- Check Authorization header format in API calls

**Pools not loading**:
- Verify `/api/pools` endpoint is accessible
- Check network tab for API errors
- Ensure token is included in authenticated requests

## Future Enhancements

- Real-time updates using WebSockets
- Pool analytics and charts
- Email notifications for contributions
- User profiles and contribution history
- Mobile app using React Native
- Dark mode support
