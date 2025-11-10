-- Add admin column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Make proxima720p@gmail.com an admin
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'proxima720p@gmail.com';

-- Verify the update
SELECT id, email, is_admin 
FROM users 
WHERE email = 'proxima720p@gmail.com';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Grant full access to presets table for authenticated users
-- This allows admins to manage all presets through application logic
GRANT ALL ON TABLE presets TO authenticated;

-- Grant full access to users table for authenticated users
GRANT ALL ON TABLE users TO authenticated;