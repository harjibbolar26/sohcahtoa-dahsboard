# SohCahToa Holdings - Secure Fintech Dashboard

A Next.js 15 fintech dashboard with role-based access control, real-time transaction updates, and security best practices.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit http://localhost:3000

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@sohcahtoa.com | password123 | Admin (can flag transactions) |
| analyst@sohcahtoa.com | password123 | Analyst (view only) |

## File Structure

```
src/
├── app/
│   ├── api/                          # API Route Handlers
│   │   ├── auth/                     # Login, logout, token refresh
│   │   └── transactions/             # CRUD + SSE stream
│   ├── dashboard/                    # Protected routes
│   │   ├── layout.tsx                # Dashboard layout (client)
│   │   ├── page.tsx                  # Home (server component)
│   │   └── transactions/             # Transactions page
│   ├── login/                        # Login page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Tailwind + animations
│
├── components/                       # React client components
│   ├── HomeClient.tsx                # FX overview + cards
│   ├── TransactionsClient.tsx        # Transactions table
│   ├── TransactionDetailPanel.tsx    # Detail slide-over
│   ├── Sidebar.tsx                   # Navigation sidebar
│   └── TopBar.tsx                    # Header with search
│
├── store/                            # Zustand state management
│   ├── authStore.ts                  # Auth state + token refresh
│   └── transactionStore.ts           # Transactions + SSE state
│
├── lib/
│   ├── auth.ts                       # Auth utilities + fetchWithAuth
│   └── mock-data.ts                  # 50+ mock transactions (includes XSS test)
│
├── types/
│   └── index.ts                      # TypeScript types
│
└── proxy.ts                     # Route protection (Edge Runtime)
```

## Key Features

### 1. Authentication
- httpOnly cookies for tokens
- Auto token refresh with race condition prevention
- Middleware route protection (`/dashboard/*`)
- Session persistence on page refresh

### 2. Transactions Dashboard
- Server-side pagination, sorting, filtering
- Real-time updates via Server-Sent Events (SSE)
- Click rows to view details
- Loading skeletons + empty states

### 3. Admin Actions
- Flag transactions (admin only)
- Add internal notes (all users)
- Optimistic UI with rollback on failure
- Role-based access control (RBAC)

### 4. Security
- **XSS Prevention**: React auto-escapes all user content (test with txn_008)
- **CSRF Protection**: SameSite=Strict cookies + custom token validation
- **Session Handling**: Automatic token refresh, forced logout on failure
- **Data Masking**: Card numbers show only last 4 digits

### 5. Real-Time Updates
- SSE stream at `/api/transactions/stream`
- Automatic deduplication (prevents duplicate entries)
- Live banner notification
- No impact on pagination/filtering

## Assumptions Made

### Architecture Decisions
1. **Mock Data**: No real database - uses in-memory mock data for demonstration
2. **Mock Authentication**: Simple email/password check (production needs proper auth service)
3. **Edge Middleware**: Runs on Edge Runtime - cannot access Node.js APIs or perform database queries
4. **Client-Side State**: Zustand manages auth and transactions state
5. **No Persistent Storage**: Data resets on server restart

### Security Assumptions
1. **httpOnly Cookies**: Tokens stored in httpOnly cookies (not localStorage)
2. **CSRF Protection**: 3-layer approach (SameSite + custom token + httpOnly)
3. **Token Refresh**: Mutex pattern prevents race conditions on concurrent requests
4. **XSS Safe**: React automatically escapes JSX content - no `dangerouslySetInnerHTML`

### Caching Strategy
1. **Transactions**: `force-dynamic` (always fetch fresh) - financial data shouldn't cache
2. **Dashboard Home**: `revalidate: 60` (ISR) - FX rates update every 60 seconds
3. **API Routes**: No caching headers - always dynamic

### Real-Time Updates
1. **SSE Not WebSocket**: Simpler for one-way server→client updates
2. **Dedupe by ID**: Maintains Set of seen transaction IDs (max 200)
3. **Separate State**: SSE transactions stored separately to preserve pagination

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 (inline classes)
- **State**: Zustand 5
- **Runtime**: Node.js + Edge (middleware)
- **Real-time**: Server-Sent Events (SSE)

## Testing

### XSS Test
Transaction `txn_008` contains `<script>alert("xss")</script>` in description. Verify it renders as plain text in:
- Transactions table
- Detail panel
- Home page

### CSRF Test
```bash
# Should fail without CSRF token
curl -X PATCH http://localhost:3000/api/transactions/txn_001 \
  -H "Content-Type: application/json" \
  -d '{"status": "flagged"}'
```

### Session Test
1. Login as admin
2. Open DevTools → Application → Cookies
3. Delete `sct_access_token`
4. Refresh page → should auto-refresh token
5. Delete both tokens → should redirect to login

## Production Checklist

Before deploying:

- [ ] Replace mock data with real database (Prisma/Drizzle)
- [ ] Implement proper authentication service (NextAuth, Clerk, Auth0)
- [ ] Add rate limiting (express-rate-limit, Upstash)
- [ ] Set secure environment variables
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Add error tracking (Sentry)
- [ ] Configure CORS properly
- [ ] Add API request logging
- [ ] Implement proper RBAC with permissions table
- [ ] Add database transaction support

## Environment Variables

```env
# Currently not required (uses mock data)
# For production, add:
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

## Known Limitations

1. **No Persistence**: Data resets on server restart (mock data only)
2. **Single Server**: SSE won't work across multiple server instances without Redis/PubSub
3. **Edge Middleware**: Cannot validate JWT or query database (token format check only)
4. **No Rate Limiting**: Vulnerable to brute force attacks (add in production)
5. **Mock JWT**: Uses simple payload - production needs proper signing

## Troubleshooting

**Port in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Cookies not persisting?**
- Check you're on `localhost` (not 127.0.0.1)
- Verify cookies in DevTools → Application → Cookies

**SSE not connecting?**
- Check Network tab for `/api/transactions/stream`
- Verify EventSource connection in console
- Ensure access token is present

---

**Built with Next.js 16 | TypeScript | Tailwind CSS | Zustand**
