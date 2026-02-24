-- FULL DATABASE SETUP SCRIPT
-- Run this entire script in the Supabase SQL Editor.
-- WARNING: This will delete all existing data in the tables listed below and reset them with dummy data.

-- 1. RESET / DROP EXISTING TABLES (Order matters due to foreign keys)
drop table if exists public.project_assignments cascade;
drop table if exists public.project_companies cascade;
drop table if exists public.team_members cascade;
drop table if exists public.projects cascade;
drop table if exists public.companies cascade;
drop table if exists public.admin_users cascade;

-- 2. CREATE TABLES

-- Admin Users Table
create table public.admin_users (
  id uuid default uuid_generate_v4() primary key,
  username text not null unique,
  password text not null -- Storing as text for simplicity as requested
);

-- Companies Table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name_en text not null,
  name_ar text,
  logo text,
  location text,
  location_url text,
  contact_persons jsonb, -- Array of objects
  type text not null check (type in ('Client', 'Contractor', 'Consultant'))
);

-- Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name_en text not null,
  name_ar text,
  
  -- References (Optional)
  client_id uuid references public.companies(id) on delete set null,
  main_contractor_id uuid references public.companies(id) on delete set null,
  consultant_id uuid references public.companies(id) on delete set null,
  
  -- Denormalized / Display fields
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
  password_hash text, -- Project access password
  is_active boolean default true,
  disciplines text[] -- Array of strings e.g. ['Civil', 'Mechanical']
);

-- Team Members Table
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

-- Project Assignments Table (Linking Team Members to Projects)
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

-- Project Companies Table (Stakeholders specific to a project)
create table public.project_companies (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  role text not null check (role in ('End Client', 'Main Contractor', 'Sub Contractor', 'Consultant', 'Other'))
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.admin_users enable row level security;
alter table public.companies enable row level security;
alter table public.projects enable row level security;
alter table public.team_members enable row level security;
alter table public.project_assignments enable row level security;
alter table public.project_companies enable row level security;

-- 4. CREATE POLICIES (Public Access for Demo)
-- Admin Users: Only allow read for login (in a real app, you'd use Supabase Auth, but for this custom table:)
create policy "Allow public read for login" on public.admin_users for select using (true);
-- We don't allow public insert/update/delete on admin_users from the frontend for security, 
-- you must insert the admin user via SQL (done below).

-- Other Tables: Full public access
create policy "Public Access Companies" on public.companies for all using (true) with check (true);
create policy "Public Access Projects" on public.projects for all using (true) with check (true);
create policy "Public Access Team" on public.team_members for all using (true) with check (true);
create policy "Public Access Assignments" on public.project_assignments for all using (true) with check (true);
create policy "Public Access Project Companies" on public.project_companies for all using (true) with check (true);

-- 5. ENABLE REALTIME
-- We simply alter the default publication to include our tables.
-- If 'supabase_realtime' does not exist, we create it.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.companies;
alter publication supabase_realtime add table public.team_members;
alter publication supabase_realtime add table public.project_assignments;
alter publication supabase_realtime add table public.project_companies;

-- Set Replica Identity to FULL to ensure we get all data on updates/deletes
alter table public.projects replica identity full;
alter table public.companies replica identity full;
alter table public.team_members replica identity full;
alter table public.project_assignments replica identity full;
alter table public.project_companies replica identity full;

-- 6. INSERT DUMMY DATA

-- Admin User
insert into public.admin_users (username, password)
values ('admin@petrotec.com', 'admin123');

-- Companies
insert into public.companies (name_en, name_ar, type, location) values 
('Saudi Aramco', 'أرامكو السعودية', 'Client', 'Dhahran'),
('Petrotec Engineering', 'بتروتك للهندسة', 'Contractor', 'Riyadh'),
('Dar Al-Handasah', 'دار الهندسة', 'Consultant', 'Jeddah');

-- Team Members
insert into public.team_members (full_name, job_title_en, job_title_ar, phone, email, type) values
('Ahmed Ali', 'Project Manager', 'مدير مشروع', '+966500000001', 'ahmed@petrotec.com', 'Internal'),
('Sarah Smith', 'QA/QC Engineer', 'مهندس جودة', '+966500000002', 'sarah@petrotec.com', 'Internal'),
('John Doe', 'Site Engineer', 'مهندس موقع', '+966500000003', 'john@external.com', 'External');

-- Projects
insert into public.projects (name_en, name_ar, status, password_hash, location_en, location_ar, disciplines) values
('Riyadh Metro Station 1', 'محطة مترو الرياض 1', 'Active', '1234', 'Riyadh, KSA', 'الرياض، المملكة العربية السعودية', ARRAY['Construction', 'MEP', 'Management']);

-- Assignments (Link Ahmed Ali to Riyadh Metro)
do $$
declare
  p_id uuid;
  m_id uuid;
begin
  select id into p_id from public.projects limit 1;
  select id into m_id from public.team_members where full_name = 'Ahmed Ali' limit 1;
  
  insert into public.project_assignments (project_id, member_id, discipline, role_en, role_ar)
  values (p_id, m_id, 'Management', 'Project Manager', 'مدير مشروع');
end
$$;

-- Project Companies (Link Aramco to Riyadh Metro)
do $$
declare
  p_id uuid;
  c_id uuid;
begin
  select id into p_id from public.projects limit 1;
  select id into c_id from public.companies where name_en = 'Saudi Aramco' limit 1;
  
  insert into public.project_companies (project_id, company_id, role)
  values (p_id, c_id, 'End Client');
end
$$;
