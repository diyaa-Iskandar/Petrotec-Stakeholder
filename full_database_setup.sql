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
insert into public.companies (name_en, name_ar, type, location, logo, location_url) values 
('Alstom', 'ألستوم', 'Client', 'Cairo, Egypt', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Alstom_logo.svg/2560px-Alstom_logo.svg.png', 'https://maps.google.com/?q=Alstom+Cairo'),
('Orascom Construction', 'أوراسكوم للإنشاءات', 'Contractor', 'New Cairo, Egypt', 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Orascom_Construction_logo.svg/1200px-Orascom_Construction_logo.svg.png', 'https://maps.google.com/?q=Orascom+Construction'),
('Vestas', 'فيستاس', 'Client', 'Zafarana, Egypt', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Vestas_logo.svg/2560px-Vestas_logo.svg.png', 'https://maps.google.com/?q=Vestas+Egypt'),
('Siemens Gamesa', 'سيمنز جاميسا', 'Contractor', 'Ras Ghareb, Egypt', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Siemens_Gamesa_logo.svg/2560px-Siemens_Gamesa_logo.svg.png', 'https://maps.google.com/?q=Siemens+Gamesa+Egypt'),
('Khatib & Alami', 'خطيب وعلمي', 'Consultant', 'Maadi, Cairo', 'https://www.khatibalami.com/images/logo.png', 'https://maps.google.com/?q=Khatib+and+Alami+Cairo'),
('Petrotec Engineering', 'بتروتك للهندسة', 'Contractor', 'Nasr City, Cairo', 'https://i.ibb.co/pj75GXSs/logo.png', 'https://maps.google.com/?q=Nasr+City+Cairo');

-- Team Members
insert into public.team_members (full_name, job_title_en, job_title_ar, phone, whatsapp, email, type) values
('Eng. Diyaa Sami', 'Project Manager', 'مدير مشروع', '+201001234567', '+201001234567', 'diyaa@petrotec.com', 'Internal'),
('Eng. Ahmed Hassan', 'Senior Civil Engineer', 'مهندس مدني أول', '+201112345678', '+201112345678', 'ahmed.hassan@petrotec.com', 'Internal'),
('Eng. Mahmoud Youssef', 'MEP Manager', 'مدير إلكتروميكانيك', '+201223456789', '+201223456789', 'mahmoud@petrotec.com', 'Internal'),
('Eng. Sarah Ibrahim', 'QA/QC Engineer', 'مهندسة جودة', '+201098765432', '+201098765432', 'sarah@petrotec.com', 'Internal'),
('Eng. Mohamed Ali', 'HSE Officer', 'مسئول سلامة وصحة مهنية', '+201551234567', '+201551234567', 'm.ali@petrotec.com', 'Internal'),
('Eng. Tarek Mostafa', 'Site Engineer', 'مهندس موقع', '+201011122233', '+201011122233', 'tarek@orascom.com', 'External'),
('Eng. Noha Kamal', 'Design Consultant', 'استشاري تصميم', '+201222333444', '+201222333444', 'noha@khatibalami.com', 'External');

-- Projects
insert into public.projects (name_en, name_ar, status, password_hash, location_en, location_ar, google_map_url, scope, disciplines) values
('Cairo Monorail - East Nile', 'مونوريل شرق النيل (العاصمة الإدارية)', 'Active', '1234', 'New Cairo to New Capital', 'القاهرة الجديدة إلى العاصمة الإدارية', 'https://maps.app.goo.gl/example1', 'Construction of guideway, stations, and depot for the East Nile Monorail project.', ARRAY['Management', 'Civil Works', 'MEP', 'QA/QC', 'HSE']),
('Gulf of Suez Wind Farm 250MW', 'مزرعة رياح خليج السويس 250 ميجاوات', 'Active', '1234', 'Ras Ghareb, Red Sea', 'رأس غارب، البحر الأحمر', 'https://maps.app.goo.gl/example2', 'Installation and commissioning of 70 wind turbines including civil foundations and electrical substations.', ARRAY['Management', 'Civil Works', 'Electrical', 'HSE', 'Logistics']),
('Cairo Metro Line 4 - Phase 1', 'الخط الرابع لمترو أنفاق القاهرة - المرحلة الأولى', 'On Hold', '1234', 'Giza to Fustat', 'الجيزة إلى الفسطاط', 'https://maps.app.goo.gl/example3', 'Underground tunneling and station construction for the new metro line.', ARRAY['Management', 'Tunneling', 'Civil Works', 'MEP']);

-- Assignments (Link Members to Projects)
do $$
declare
  p_monorail uuid;
  p_windfarm uuid;
  m_diyaa uuid;
  m_ahmed uuid;
  m_mahmoud uuid;
  m_sarah uuid;
  m_mohamed uuid;
  m_tarek uuid;
  m_noha uuid;
begin
  -- Get Project IDs
  select id into p_monorail from public.projects where name_en = 'Cairo Monorail - East Nile' limit 1;
  select id into p_windfarm from public.projects where name_en = 'Gulf of Suez Wind Farm 250MW' limit 1;
  
  -- Get Member IDs
  select id into m_diyaa from public.team_members where full_name = 'Eng. Diyaa Sami' limit 1;
  select id into m_ahmed from public.team_members where full_name = 'Eng. Ahmed Hassan' limit 1;
  select id into m_mahmoud from public.team_members where full_name = 'Eng. Mahmoud Youssef' limit 1;
  select id into m_sarah from public.team_members where full_name = 'Eng. Sarah Ibrahim' limit 1;
  select id into m_mohamed from public.team_members where full_name = 'Eng. Mohamed Ali' limit 1;
  select id into m_tarek from public.team_members where full_name = 'Eng. Tarek Mostafa' limit 1;
  select id into m_noha from public.team_members where full_name = 'Eng. Noha Kamal' limit 1;
  
  -- Assign to Monorail
  insert into public.project_assignments (project_id, member_id, discipline, role_en, role_ar, sort_order) values 
  (p_monorail, m_diyaa, 'Management', 'Project Manager', 'مدير المشروع', 1),
  (p_monorail, m_ahmed, 'Civil Works', 'Lead Civil Engineer', 'مهندس مدني رئيسي', 2),
  (p_monorail, m_mahmoud, 'MEP', 'MEP Coordinator', 'منسق إلكتروميكانيك', 3),
  (p_monorail, m_sarah, 'QA/QC', 'Quality Manager', 'مدير الجودة', 4),
  (p_monorail, m_tarek, 'Civil Works', 'Contractor Rep.', 'ممثل المقاول', 5),
  (p_monorail, m_noha, 'Management', 'Consultant Rep.', 'ممثل الاستشاري', 6);

  -- Assign to Wind Farm
  insert into public.project_assignments (project_id, member_id, discipline, role_en, role_ar, sort_order) values 
  (p_windfarm, m_diyaa, 'Management', 'Project Director', 'مدير المشروع', 1),
  (p_windfarm, m_mohamed, 'HSE', 'HSE Manager', 'مدير السلامة', 2),
  (p_windfarm, m_ahmed, 'Civil Works', 'Foundation Engineer', 'مهندس أساسات', 3);
end
$$;

-- Project Companies (Link Companies to Projects)
do $$
declare
  p_monorail uuid;
  p_windfarm uuid;
  c_alstom uuid;
  c_orascom uuid;
  c_khatib uuid;
  c_vestas uuid;
  c_gamesa uuid;
  c_petrotec uuid;
begin
  -- Get Project IDs
  select id into p_monorail from public.projects where name_en = 'Cairo Monorail - East Nile' limit 1;
  select id into p_windfarm from public.projects where name_en = 'Gulf of Suez Wind Farm 250MW' limit 1;
  
  -- Get Company IDs
  select id into c_alstom from public.companies where name_en = 'Alstom' limit 1;
  select id into c_orascom from public.companies where name_en = 'Orascom Construction' limit 1;
  select id into c_khatib from public.companies where name_en = 'Khatib & Alami' limit 1;
  select id into c_vestas from public.companies where name_en = 'Vestas' limit 1;
  select id into c_gamesa from public.companies where name_en = 'Siemens Gamesa' limit 1;
  select id into c_petrotec from public.companies where name_en = 'Petrotec Engineering' limit 1;
  
  -- Link to Monorail
  insert into public.project_companies (project_id, company_id, role) values 
  (p_monorail, c_alstom, 'End Client'),
  (p_monorail, c_orascom, 'Main Contractor'),
  (p_monorail, c_petrotec, 'Sub Contractor'),
  (p_monorail, c_khatib, 'Consultant');

  -- Link to Wind Farm
  insert into public.project_companies (project_id, company_id, role) values 
  (p_windfarm, c_vestas, 'End Client'),
  (p_windfarm, c_gamesa, 'Main Contractor'),
  (p_windfarm, c_petrotec, 'Sub Contractor');
end
$$;
