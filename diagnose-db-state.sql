-- Check the current database state
-- Check users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if there are any rows in users table
SELECT COUNT(*) as user_count FROM users;

-- Check a sample of users data
SELECT id, email, name, avatar_url FROM users LIMIT 5;

-- Check storage buckets
SELECT id, name, public FROM storage.buckets;

-- Check if avatars bucket exists
SELECT id, name, public FROM storage.buckets WHERE name = 'avatars';

-- Check RLS status on users table
SELECT relname, relrowsecurity, relforcerowsecurity 
FROM pg_class 
WHERE relname = 'users';

-- Check existing policies on users table
SELECT polname FROM pg_policy WHERE polrelid = 'users'::regclass;