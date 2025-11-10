import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL = 'https://fxyoyhqxuwoqlxyofmbg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU'

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)