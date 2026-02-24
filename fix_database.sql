-- Run this SQL in your Supabase SQL Editor to fix the missing table error and update the schema

-- 1. Create project_companies table
create table if not exists public.project_companies (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  role text not null check (role in ('End Client', 'Main Contractor', 'Sub Contractor', 'Consultant', 'Other'))
);

-- Enable RLS
alter table public.project_companies enable row level security;

-- Create policies (if they don't exist, these might error if already present, so we can wrap in DO block or just ignore errors in UI)
create policy "Enable read access for all users" on public.project_companies for select using (true);
create policy "Enable insert access for all users" on public.project_companies for insert with check (true);
create policy "Enable update access for all users" on public.project_companies for update using (true);
create policy "Enable delete access for all users" on public.project_companies for delete using (true);

-- 2. Update companies table with new columns
alter table public.companies add column if not exists location text;
alter table public.companies add column if not exists location_url text;
alter table public.companies add column if not exists contact_persons jsonb;
-- Note: type column is likely already there if the table exists, but if not:
-- alter table public.companies add column if not exists type text check (type in ('Client', 'Contractor', 'Consultant'));

-- 3. Update projects table with new columns
alter table public.projects add column if not exists google_map_url text;
alter table public.projects add column if not exists disciplines text[];
alter table public.projects add column if not exists is_active boolean default true;

-- 4. Update team_members table
alter table public.team_members add column if not exists type text check (type in ('Internal', 'External')) default 'Internal';
