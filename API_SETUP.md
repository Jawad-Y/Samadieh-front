# API Setup Guide

This guide explains how to connect the Samadiyyah frontend to your backend API.

## Quick Start

1. **Locate your API URL**: Your backend should be running on a URL like:
   - Local development: `http://localhost:5000`
   - Production: Your deployed backend URL

2. **Create `.env.local`** in the project root:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Restart the dev server**:
   ```bash
   pnpm dev
   ```

## Environment Variables

### Required
- `NEXT_PUBLIC_API_URL`: The base URL for your backend API (includes `/api`)
  - Example: `http://localhost:5000/api`
  - Example: `https://api.samadiyyah.com/api`

## API Endpoints Reference

The frontend makes calls to these endpoints on your backend:

### Pools Management
```
GET    /api/pools                          - List published pools
GET    /api/pools/:id                      - Get pool by ID
GET    /api/pools/share/:shareToken        - Get pool by share token (public)
POST   /api/pools                          - Create new pool
PATCH  /api/pools/:id                      - Update pool status
DELETE /api/pools/:id                      - Delete pool
GET    /api/pools/mine                     - Get user's pools
POST   /api/pools/share/:shareToken/join   - Contribute to pool
```

### Authentication
```
POST   /api/auth/login                     - Login with email/password
POST   /api/auth/register                  - Register new user
GET    /api/auth/me                        - Get current user (requires token)
```

## Authentication Headers

For authenticated endpoints, include the JWT token:

```
Authorization: Bearer <access_token>
```

The token is obtained from login/register responses and stored in localStorage.

## Request/Response Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "session": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

### Create Pool
```bash
POST /api/pools
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Ramadan Samadiyyah",
  "description": "Community pool for Ramadan",
  "status": "draft"
}

Response:
{
  "id": "pool-uuid",
  "owner_id": "user-uuid",
  "title": "Ramadan Samadiyyah",
  "description": "Community pool for Ramadan",
  "share_token": "share-token-uuid",
  "status": "draft",
  "goal_amount": "100000.00",
  "total_amount": "0.00",
  "created_at": "2026-05-08T10:00:00Z",
  "updated_at": "2026-05-08T10:00:00Z",
  "published_at": null
}
```

### Contribute to Pool
```bash
POST /api/pools/share/:shareToken/join
Authorization: Bearer <token> (optional)
Content-Type: application/json

{
  "amount": 250.00,
  "contributor_label": "John Doe",
  "note": "Happy to contribute"
}

Response:
{
  "contribution": {
    "id": "contribution-uuid",
    "pool_id": "pool-uuid",
    "submitted_by": "user-uuid",
    "contributor_label": "John Doe",
    "amount": "250.00",
    "note": "Happy to contribute",
    "created_at": "2026-05-08T11:00:00Z"
  },
  "pool": {
    "id": "pool-uuid",
    "total_amount": "250.00",
    "updated_at": "2026-05-08T11:00:00Z"
  }
}
```

## Troubleshooting

### "Failed to fetch" errors
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS headers from backend

### "Unauthorized" (401) errors
- Token might be expired
- Login endpoint might not be returning correct token format
- Check token is being stored in localStorage properly

### API call structure
All API calls expect:
- Request: JSON with appropriate headers
- Response: JSON with data or `{ "error": "message" }`
- Errors: HTTP status codes + error messages

## Local Development

For local development, ensure:

1. **Backend is running**:
   ```bash
   cd ../server
   npm install
   npm start
   ```
   (Adjust based on your backend setup)

2. **Frontend is running**:
   ```bash
   pnpm dev
   ```

3. **Test a simple request**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{ "ok": true }`

## Production Deployment

1. Update `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Deploy frontend to Vercel
3. Ensure backend is deployed and accessible
4. Test all endpoints in production

## API Implementation Checklist

- [ ] All endpoints return JSON responses
- [ ] Errors include proper HTTP status codes
- [ ] CORS headers are configured correctly
- [ ] JWT tokens work for authentication
- [ ] POST requests validate input
- [ ] Database updates are persisted
- [ ] Share tokens are unique and work correctly
- [ ] Anonymous contributions are allowed

## Support

If you encounter issues:
1. Check the API documentation (API_DOCUMENTATION.md)
2. Review the browser console for error details
3. Check the Network tab in DevTools
4. Verify backend logs
