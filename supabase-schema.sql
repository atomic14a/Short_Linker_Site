-- ============================================
-- LinkFocus Database Schema for Supabase
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. LINKS TABLE
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  internal_name text not null,
  original_url text not null,
  short_slug text not null unique,
  meta_title text,
  meta_description text,
  meta_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ANALYTICS (CLICKS) TABLE
create table if not exists public.clicks (
  id uuid default gen_random_uuid() primary key,
  link_id uuid references public.links(id) on delete cascade not null,
  click_timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text,
  country text,
  referrer text,
  device_type text
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.clicks enable row level security;

-- Profiles: Users can read and update their own profile
create policy "Users can view own profile" 
on public.profiles for select using ( auth.uid() = id );

create policy "Users can update own profile" 
on public.profiles for update using ( auth.uid() = id );

-- Links: Users can do full CRUD on their own links
create policy "Users can manage own links" 
on public.links for all using ( auth.uid() = user_id );

-- Public read access to links (needed for the [slug] redirect engine)
create policy "Public read access to short links" 
on public.links for select using ( true );

-- Clicks: Users can read clicks for their own links
create policy "Users can view clicks for own links" 
on public.clicks for select using (
  exists (
    select 1 from public.links
    where links.id = clicks.link_id and links.user_id = auth.uid()
  )
);

-- Public insert access to clicks (needed for tracking anonymous clicks in [slug] route)
create policy "Public insert access to clicks" 
on public.clicks for insert with check ( true );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index idx_links_short_slug on public.links(short_slug);
create index idx_links_user_id on public.links(user_id);
create index idx_clicks_link_id on public.clicks(link_id);
create index idx_clicks_timestamp on public.clicks(click_timestamp);

-- ============================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
