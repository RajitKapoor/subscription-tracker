# Architecture Overview

## System Architecture

Subscription Tracker is a modern single-page application (SPA) built with React and Vite, using Supabase as the backend-as-a-service (BaaS) for authentication and database.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │    Hooks     │     │
│  │              │  │              │  │              │     │
│  │ - Landing    │  │ - UI (shadcn)│  │ - useAuth    │     │
│  │ - Dashboard  │  │ - Forms      │  │ - useSubs    │     │
│  │ - Subscriptions│ │ - Modals    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Context Providers                        │  │
│  │  - AuthProvider (manages auth state)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Auth       │              │  PostgreSQL  │            │
│  │              │              │              │            │
│  │ - Email/Pass │              │ - subscriptions│          │
│  │ - Sessions   │              │ - RLS policies│           │
│  │ - Users      │              │ - Indexes     │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── Router
│       ├── Landing
│       ├── Login
│       ├── Signup
│       ├── Nav (when authenticated)
│       ├── Dashboard
│       │   ├── Summary Cards
│       │   ├── Charts (Recharts)
│       │   └── Upcoming Renewals
│       └── SubscriptionsPage
│           ├── Filters
│           ├── View Toggle (Cards/Table)
│           ├── SubscriptionCard (or Table)
│           └── AddEditSubscriptionModal
```

### State Management

- **Auth State**: Managed by `AuthContext` using React Context API
- **Subscription Data**: Managed by `useSubscriptions` hook with local state
- **UI State**: Local component state (modals, filters, etc.)

### Data Flow

1. **Authentication Flow**:
   ```
   User → AuthForm → AuthContext.signIn() → Supabase Auth → 
   Auth State Update → ProtectedRoute → Dashboard
   ```

2. **Subscription CRUD Flow**:
   ```
   User Action → Component Handler → useSubscriptions Hook → 
   Supabase Client → PostgreSQL → Realtime Update → 
   Hook Refetch → Component Re-render
   ```

## Backend Architecture

### Supabase Services

1. **Authentication**
   - Uses Supabase Auth (built on GoTrue)
   - Email/password authentication
   - Session management handled by Supabase
   - User data stored in `auth.users` table (managed by Supabase)

2. **Database**
   - PostgreSQL database
   - Single table: `subscriptions`
   - Row Level Security (RLS) enabled
   - Policies ensure users can only access their own data

3. **Realtime** (Optional, free tier)
   - Subscriptions to database changes
   - Automatic UI updates when data changes

### Database Schema

```sql
subscriptions
├── id (uuid, PK)
├── user_id (uuid, FK to auth.users)
├── name (text)
├── price (numeric)
├── renewal_date (date)
├── cycle (text: 'monthly' | 'yearly')
├── category (text, nullable)
├── notes (text, nullable)
└── created_at (timestamptz)
```

### Security

- **Row Level Security (RLS)**: All queries filtered by `user_id`
- **Anon Key**: Used for client-side operations (safe due to RLS)
- **Service Role Key**: Never exposed to frontend (only for serverless functions)

## Optional Serverless Functions

Located in `api/` directory for Vercel serverless functions:

- `sync-renewals.js`: Scheduled task to check upcoming renewals
- `webhook-proxy.js`: Secure proxy for third-party API calls

These use the Supabase service role key (stored in Vercel environment variables).

## Build & Deployment

### Development
- Vite dev server with HMR
- Hot module replacement for fast development

### Production
- Vite build creates optimized static assets
- Deployed to Vercel (or any static host)
- Environment variables configured in deployment platform

### CI/CD
- GitHub Actions for linting, testing, and building
- Automatic deployment to Vercel on push to main

## Technology Choices

### Why React + Vite?
- Fast development experience
- Modern tooling
- Excellent performance

### Why Supabase?
- Free tier sufficient for MVP
- Built-in auth and database
- Real-time capabilities
- PostgreSQL (powerful and familiar)

### Why Tailwind + shadcn?
- Rapid UI development
- Consistent design system
- Accessible components out of the box

### Why Recharts?
- Lightweight charting library
- React-friendly API
- Good performance

## Performance Considerations

1. **Code Splitting**: Vite automatically code-splits routes
2. **Lazy Loading**: Consider lazy loading heavy components
3. **Database Indexes**: Indexed on `user_id` and `renewal_date`
4. **Image Optimization**: Use optimized images for production
5. **Bundle Size**: Monitor with `npm run build -- --analyze`

## Future Enhancements

- **Caching**: Add React Query for better data caching
- **Offline Support**: Service workers for offline functionality
- **Notifications**: Push notifications for renewals
- **Export**: CSV/JSON export functionality
- **Categories**: Separate categories table with autocomplete
- **Recurring Rules**: More flexible renewal date calculations

