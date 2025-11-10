-- Add admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Make proxima720p@gmail.com an admin
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'proxima720p@gmail.com';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Grant admin users full access to all presets
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON users;
DROP POLICY IF EXISTS "Users can update their own profile or admins can update all" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all presets" ON presets;
DROP POLICY IF EXISTS "Users can manage their own presets" ON presets;

-- Recreate policies with admin access
-- Users can view their own profile or admins can view all
CREATE POLICY "Users can view their own profile or admins can view all" ON users
    FOR SELECT USING (auth.uid() = id OR is_admin = TRUE);

-- Users can update their own profile or admins can update all
CREATE POLICY "Users can update their own profile or admins can update all" ON users
    FOR UPDATE USING (auth.uid() = id OR is_admin = TRUE);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for presets table to allow admins full access
-- Admins can manage all presets
CREATE POLICY "Admins can manage all presets" ON presets
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));

-- Users can manage their own presets (non-admins)
CREATE POLICY "Users can manage their own presets" ON presets
    FOR ALL USING (author_email = (SELECT email FROM users WHERE id = auth.uid()) 
                  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));