-- Simple diagnostic to understand the current state
-- Check the data type of users.id
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- Check the data type of auth.users.id
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'id';

-- Check if there's a foreign key relationship
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND constraint_type = 'FOREIGN KEY';

-- Check sample data
SELECT id, email FROM users LIMIT 3;
SELECT id, email FROM auth.users LIMIT 3;

-- Check RLS status
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'users';