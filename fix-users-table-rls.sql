-- Fix users table RLS policies
-- First, disable RLS temporarily to make changes
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Check existing policies
SELECT polname FROM pg_policy WHERE polrelid = 'users'::regclass;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create proper policies using auth.uid() function
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON TABLE users TO authenticated;

-- Verify the policies
SELECT polname FROM pg_policy WHERE polrelid = 'users'::regclass;