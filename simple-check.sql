-- Simple check to understand the current database state

-- Check the data type of the id column in our users table
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- Check the data type of the id column in auth.users table
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'id';

-- Check if there are any foreign key constraints on our users table
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
WHERE tc.table_name = 'users' AND kcu.column_name = 'id';

-- Check sample data
SELECT id, email, name FROM users LIMIT 3;
SELECT id, email FROM auth.users LIMIT 3;