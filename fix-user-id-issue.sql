-- Check the structure of the users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check the structure of auth.users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' 
ORDER BY ordinal_position;

-- Check if there are any users with invalid IDs
SELECT id, email, created_at 
FROM users 
LIMIT 10;

-- Check if there are any auth users
SELECT id, email, created_at 
FROM auth.users 
LIMIT 10;

-- Check for any mismatch between users and auth.users
SELECT 
    u.id as users_id,
    u.email as users_email,
    au.id as auth_users_id,
    au.email as auth_users_email
FROM users u
FULL OUTER JOIN auth.users au ON u.email = au.email
WHERE u.id IS NULL OR au.id IS NULL
LIMIT 10;