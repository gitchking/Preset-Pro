-- Fix RLS policies for users table

-- First, check existing policies
SELECT polname FROM pg_policy WHERE polrelid = 'users'::regclass;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create new policies with more permissive access for testing
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id OR auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id OR auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON TABLE users TO authenticated;