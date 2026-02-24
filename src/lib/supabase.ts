import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to the hardcoded ones
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jhyqjizyrmcdfvrcytdt.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeXFqaXp5cm1jZGZ2cmN5dGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjA4NzMsImV4cCI6MjA4Njg5Njg3M30.FYHj28gIzTZqxjuF_PiTyRmJl203b6eTSxpMFHoA1g0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
