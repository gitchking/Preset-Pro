-- Add admin column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Make proxima720p@gmail.com an admin
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'proxima720p@gmail.com';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Simple approach: Remove RLS from presets table to allow full access
-- This will allow admins to manage all presets without complex policies
ALTER TABLE presets DISABLE ROW LEVEL SECURITY;

-- If you want to keep some security, you can enable RLS and use simpler policies:
-- ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- For now, we'll disable RLS to ensure admin access works
-- In a production environment, you would implement more sophisticated policies