-- Enable UUID extension for generating UUIDs
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

-- Create indexes for better query performance
create index on public.subscriptions (user_id);
create index on public.subscriptions (renewal_date);

-- Enable Row Level Security
alter table public.subscriptions enable row level security;

-- Create policy: Users can only view their own subscriptions
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

