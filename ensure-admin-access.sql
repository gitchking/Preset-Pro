-- Ensure the is_admin column exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Make sure proxima720p@gmail.com is admin
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'proxima720p@gmail.com';

-- Verify admin status
SELECT id, email, is_admin 
FROM users 
WHERE email = 'proxima720p@gmail.com';

-- Grant full permissions to authenticated users
GRANT ALL ON TABLE presets TO authenticated;
GRANT ALL ON TABLE users TO authenticated;

-- Create a function to safely delete any preset (for admin use)
-- This is just for verification - the actual deletion will be handled by the frontend
SELECT id, name, effects, author_email, created_at
FROM presets 
WHERE name ILIKE '%proxima%' 
   OR effects ILIKE '%anime%'
ORDER BY created_at DESC;