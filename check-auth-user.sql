-- Check if proxima720p@gmail.com exists in auth.users
SELECT id, email, created_at, last_sign_in_at, is_super_admin
FROM auth.users 
WHERE email = 'proxima720p@gmail.com';

-- Check the structure of auth.users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' 
ORDER BY ordinal_position;

-- Check if the user exists in both tables
SELECT 
    u.id as users_id,
    u.email as users_email,
    u.is_admin,
    au.id as auth_users_id,
    au.email as auth_users_email
FROM users u
FULL OUTER JOIN auth.users au ON u.email = au.email
WHERE u.email = 'proxima720p@gmail.com' OR au.email = 'proxima720p@gmail.com';