-- Check the structure of our users table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check the structure of auth.users table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' 
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_name;

-- Check if there are any rows in our users table
SELECT COUNT(*) as user_count FROM users;

-- Check if there are any rows in auth.users table
SELECT COUNT(*) as auth_user_count FROM auth.users;

-- Check sample data from both tables
SELECT id, email FROM users LIMIT 3;
SELECT id, email FROM auth.users LIMIT 3;

-- Check RLS policies
SELECT polname FROM pg_policy WHERE polrelid = 'users'::regclass;