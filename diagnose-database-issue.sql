-- Diagnose the database issue
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
SELECT id, email, name, created_at 
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

-- Check if there are any presets with author information
SELECT id, name, author_name, author_email, created_at
FROM presets
ORDER BY created_at DESC
LIMIT 10;

-- Check if RLS policies are properly set up
SELECT polname, polrelid::regclass, polcmd, polqual, polwithcheck 
FROM pg_policy 
WHERE polrelid = 'users'::regclass;

-- Check if the users table has the correct primary key
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='users';