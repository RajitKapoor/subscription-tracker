# Subscription Tracker

A modern, production-ready subscription tracking web application built with React, Vite, Tailwind CSS, and Supabase. Track your recurring subscriptions, monitor spending, and get renewal reminders.

![Subscription Tracker](https://img.shields.io/badge/React-18.2-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Supabase](https://img.shields.io/badge/Supabase-2.38-green)

## Features

- 🔐 **Authentication** - Secure email/password authentication via Supabase Auth
- 📊 **Dashboard** - Visual analytics with charts showing spending patterns
- 📝 **CRUD Operations** - Full create, read, update, delete for subscriptions
- 🔔 **Renewal Reminders** - Track upcoming renewals and get notified
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- 🎨 **Modern UI** - Built with shadcn UI components and Tailwind CSS
- 📈 **Analytics** - Monthly/yearly totals, category breakdowns, and spending charts

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: Supabase (Auth + PostgreSQL)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd subscription-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your `Project URL` and `anon` `public` key
   - Update `.env.local`:
     ```env
     VITE_SUPABASE_URL=https://your-project-ref.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

5. **Set up the database**
   - In Supabase Dashboard, go to SQL Editor
   - Run the SQL script from `db/init.sql` (see below)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:5173`

## Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Create subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  price numeric(10,2) not null default 0,
  renewal_date date,
  cycle text check (cycle in ('monthly','yearly')) default 'monthly',
  category text,
  notes text,
  created_at timestamptz default now()
);

-- Create indexes
create index on public.subscriptions (user_id);
create index on public.subscriptions (renewal_date);

-- Enable Row Level Security
alter table public.subscriptions enable row level security;

-- Create policy: Users can only see their own subscriptions
create policy "Users can view own subscriptions"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- Create policy: Users can insert their own subscriptions
create policy "Users can insert own subscriptions"
  on public.subscriptions
  for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can update their own subscriptions
create policy "Users can update own subscriptions"
  on public.subscriptions
  for update
  using (auth.uid() = user_id);

-- Create policy: Users can delete their own subscriptions
create policy "Users can delete own subscriptions"
  on public.subscriptions
  for delete
  using (auth.uid() = user_id);
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI

## Project Structure

```
subscription-tracker/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn UI components
│   │   └── ...
│   ├── context/          # React contexts (Auth)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and clients
│   ├── pages/            # Page components
│   └── test/             # Test setup
├── db/                   # Database scripts
├── docs/                 # Documentation
├── api/                  # Serverless functions (optional)
└── public/              # Static assets
```

## Pages

- `/` - Landing page with marketing content
- `/login` - Sign in page
- `/signup` - Sign up page
- `/dashboard` - Main dashboard with analytics
- `/subscriptions` - Manage subscriptions (list, add, edit, delete)
- `/test` - Development test page (dev mode only)

## Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy** - Vercel will automatically deploy on push to main

### Other Platforms

The app can be deployed to any platform that supports static sites:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

⚠️ **Never commit your `.env.local` file or service role keys!**

## Testing

Run the test suite:
```bash
npm run test
```

Tests are located in `src/**/__tests__/` and use Vitest with React Testing Library.

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [API Documentation](docs/API.md) - API usage and examples
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists and contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after adding env variables

### "Row Level Security policy violation"
- Ensure you've run the RLS policies from `db/init.sql`
- Check that you're authenticated (signed in)

### Build errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

## Developer Notes

### Changing the Design

The app uses Tailwind CSS with custom design tokens defined in `tailwind.config.js`. To modify the design:

1. **Colors**: Update the `colors` object in `tailwind.config.js`
2. **Components**: Modify shadcn UI components in `src/components/ui/`
3. **Layout**: Adjust spacing and layout in page components
4. **Reference Image**: The original design reference is located at `/mnt/data/13975a66-4143-4ad6-8178-453bb2afd523.png`

### Extending Features

- **Add new subscription fields**: Update the database schema, then modify `AddEditSubscriptionModal` and `useSubscriptions` hook
- **Add notifications**: Use Supabase Realtime or integrate with a notification service
- **Export data**: Add CSV/JSON export functionality in `SubscriptionsPage`
- **Categories**: Consider making categories a separate table with autocomplete

### Where to Find Things

- **Authentication logic**: `src/context/AuthContext.jsx`
- **Subscription CRUD**: `src/hooks/useSubscriptions.js`
- **UI Components**: `src/components/ui/`
- **Pages**: `src/pages/`
- **Database schema**: `db/init.sql`

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

