-- Enable Realtime for all relevant tables
-- Run this in your Supabase SQL Editor

begin;
  -- Ensure the publication exists
  insert into pg_publication (pubname) values ('supabase_realtime') on conflict do nothing;
commit;

-- Add tables to the publication
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.companies;
alter publication supabase_realtime add table public.team_members;
alter publication supabase_realtime add table public.project_assignments;
alter publication supabase_realtime add table public.project_companies;

-- Verify Replica Identity (Full is safer for getting old values on delete, though Default usually works for PKs)
alter table public.projects replica identity full;
alter table public.companies replica identity full;
alter table public.team_members replica identity full;
alter table public.project_assignments replica identity full;
alter table public.project_companies replica identity full;
