-- Check the current database schema to identify the issue
-- Check the structure of the users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY column_name;

-- Check if there are any rows in the users table
SELECT COUNT(*) as user_count FROM users;

-- Check a sample of users data
SELECT id, email, name FROM users LIMIT 5;

-- Check the data type of the id column specifically
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- Check if there are any constraints on the users table
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
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_name;

-- Check if there are any RLS policies on the users table
SELECT 
    polname,
    polcmd,
    polqual,
    polwithcheck
FROM pg_policy 
WHERE polrelid = 'users'::regclass;

-- Check if the auth.users table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' 
ORDER BY column_name;

-- Check if there are any foreign key relationships between users and other tables
SELECT 
    tc.table_name,
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
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'users' OR ccu.table_name = 'users')
ORDER BY tc.table_name;