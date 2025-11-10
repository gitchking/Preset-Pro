-- Script to assign existing presets to a specific user
-- Replace 'your-email@example.com' and 'Your Name' with your actual email and name

UPDATE presets 
SET 
    author_name = 'Your Name',
    author_email = 'your-email@example.com',
    updated_at = NOW()
WHERE 
    author_name IS NULL 
    OR author_name = '' 
    OR author_name = 'Anonymous'
    OR author_email IS NULL 
    OR author_email = '';

-- Verify the update
SELECT 
    id,
    name,
    author_name,
    author_email,
    created_at
FROM presets
ORDER BY created_at DESC
LIMIT 10;