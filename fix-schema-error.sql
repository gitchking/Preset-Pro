-- Fix for the UUID vs Integer error
-- The error occurs when trying to compare a UUID (users.id) with an INTEGER (presets.id or preset_categories.preset_id)

-- First, let's check the current structure of tables
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'presets' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'preset_categories' 
ORDER BY ordinal_position;

-- If you're trying to join users and presets tables, you need to match on email or create a proper foreign key
-- For example, if you want to find presets by a specific user:

-- Correct way to query presets by user email:
SELECT p.id, p.name, p.effects, p.author_email, p.created_at
FROM presets p
WHERE p.author_email = 'proxima720p@gmail.com';

-- If you need to join with the users table:
SELECT p.id, p.name, p.effects, u.email, u.name
FROM presets p
JOIN users u ON p.author_email = u.email
WHERE u.email = 'proxima720p@gmail.com';

-- If you're trying to fix data in preset_categories, make sure the IDs match the correct types:
-- preset_id should be INTEGER (matching presets.id)
-- category_id should be INTEGER (matching categories.id)

-- If you're getting this error with a specific query, please share that query
-- and I can provide a more targeted fix.