-- Run these commands in the Supabase SQL Editor to update your existing database without losing data.

-- 1. Add company_id to team_members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- 2. Add status to project_assignments
ALTER TABLE public.project_assignments 
ADD COLUMN IF NOT EXISTS status text NOT NULL CHECK (status IN ('Approved', 'Pending', 'Rejected')) DEFAULT 'Approved';

-- 3. Update Realtime (if not already tracking these columns, though usually it tracks the whole table)
ALTER TABLE public.team_members REPLICA IDENTITY FULL;
ALTER TABLE public.project_assignments REPLICA IDENTITY FULL;
