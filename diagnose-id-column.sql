-- Comprehensive diagnostic for the ID column issue
-- Check the exact data type of users.id column
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- Check the exact data type of auth.users.id column
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'id';

-- Check sample data from both tables
SELECT id, email, name FROM users LIMIT 5;
SELECT id, email FROM auth.users LIMIT 5;

-- Check if there are any foreign key constraints on users.id
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    ccu.table_schema AS foreign_table_schema
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'users' AND kcu.column_name = 'id'
ORDER BY tc.constraint_name;

-- Check existing RLS policies
SELECT 
    polname,
    polcmd,
    polqual,
    polwithcheck
FROM pg_policy 
WHERE polrelid = 'users'::regclass;

-- Check if the users table has the correct primary key
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'users' 
AND tc.constraint_type = 'PRIMARY KEY';

-- Check if there are any rows with NULL ids
SELECT COUNT(*) as null_id_count FROM users WHERE id IS NULL;

-- Check if there are any duplicate ids
SELECT id, COUNT(*) as count 
FROM users 
GROUP BY id 
HAVING COUNT(*) > 1;

-- Check the current RLS status
SELECT relname, relrowsecurity, relforcerowsecurity 
FROM pg_class 
WHERE relname = 'users';