-- Check if the is_admin column exists in the users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_admin';

-- Check if proxima720p@gmail.com exists in the users table
SELECT id, email, is_admin 
FROM users 
WHERE email = 'proxima720p@gmail.com';

-- Check the structure of the users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check the structure of the presets table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'presets' 
ORDER BY ordinal_position;

-- Check current RLS status on tables (simplified version)
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'presets');