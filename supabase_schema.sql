-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Companies Table (Clients, Contractors, Consultants)
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name_en text not null,
  name_ar text,
  logo text, -- Stores the public URL of the uploaded image
  location text,
  location_url text, -- Google Maps URL
  contact_persons jsonb, -- Array of {name, email, phone, role}
  type text not null check (type in ('Client', 'Contractor', 'Consultant'))
);

-- 2. Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name_en text not null,
  name_ar text,
  
  -- References
  client_id uuid references public.companies(id),
  main_contractor_id uuid references public.companies(id),
  consultant_id uuid references public.companies(id),
  
  -- Denormalized names (optional, but good for performance/simplicity if relations break)
  client_en text,
  client_ar text,
  main_contractor text,
  consultant text,
  sub_contractor text,

  location_en text,
  location_ar text,
  google_map_url text,
  scope text,
  status text not null check (status in ('Active', 'Completed', 'On Hold')),
  password_hash text,
  is_active boolean default true,
  disciplines text[] -- Array of strings
);

-- 3. Team Members Table (Internal & External)
create table public.team_members (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  job_title_en text,
  job_title_ar text,
  phone text,
  whatsapp text,
  email text,
  company text, -- For external members
  notes text,
  type text not null check (type in ('Internal', 'External')) default 'Internal'
);

-- 4. Project Assignments Table
create table public.project_assignments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade,
  member_id uuid references public.team_members(id) on delete cascade,
  discipline text not null,
  role_en text,
  role_ar text,
  sort_order integer default 1
);

-- Enable Row Level Security (RLS)
alter table public.companies enable row level security;
alter table public.projects enable row level security;
alter table public.team_members enable row level security;
alter table public.project_assignments enable row level security;

-- Create Policies (Public Read/Write for this demo app)
create policy "Enable read access for all users" on public.companies for select using (true);
create policy "Enable insert access for all users" on public.companies for insert with check (true);
create policy "Enable update access for all users" on public.companies for update using (true);
create policy "Enable delete access for all users" on public.companies for delete using (true);

create policy "Enable read access for all users" on public.projects for select using (true);
create policy "Enable insert access for all users" on public.projects for insert with check (true);
create policy "Enable update access for all users" on public.projects for update using (true);
create policy "Enable delete access for all users" on public.projects for delete using (true);

create policy "Enable read access for all users" on public.team_members for select using (true);
create policy "Enable insert access for all users" on public.team_members for insert with check (true);
create policy "Enable update access for all users" on public.team_members for update using (true);
create policy "Enable delete access for all users" on public.team_members for delete using (true);

create policy "Enable read access for all users" on public.project_assignments for select using (true);
create policy "Enable insert access for all users" on public.project_assignments for insert with check (true);
create policy "Enable update access for all users" on public.project_assignments for update using (true);
create policy "Enable delete access for all users" on public.project_assignments for delete using (true);

-- STORAGE SETUP
-- Create a public bucket named 'logos'
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);

-- Storage Policies (Allow public access)
create policy "Public Access" on storage.objects for select using ( bucket_id = 'logos' );
create policy "Public Insert" on storage.objects for insert with check ( bucket_id = 'logos' );
create policy "Public Update" on storage.objects for update using ( bucket_id = 'logos' );
create policy "Public Delete" on storage.objects for delete using ( bucket_id = 'logos' );

-- 5. Project Companies (Stakeholders)
create table public.project_companies (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  role text not null check (role in ('End Client', 'Main Contractor', 'Sub Contractor', 'Consultant', 'Other'))
);

-- RLS for Project Companies
alter table public.project_companies enable row level security;
create policy "Enable read access for all users" on public.project_companies for select using (true);
create policy "Enable insert access for all users" on public.project_companies for insert with check (true);
create policy "Enable update access for all users" on public.project_companies for update using (true);
create policy "Enable delete access for all users" on public.project_companies for delete using (true);
