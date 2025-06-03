import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkvcpqalfpwivalfthhg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdmNwcWFsZnB3aXZhbGZ0aGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzYzODgsImV4cCI6MjA2NDU1MjM4OH0.oYkf6NgGAq3t9R-2TtlNxdDYqzF2yYB3wCkUObgLjIc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);