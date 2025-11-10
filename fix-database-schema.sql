-- Fix for the database schema to resolve UUID vs Integer issues
-- First, let's check the current structure of all relevant tables
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('users', 'presets', 'categories', 'preset_categories', 'preset_files')
ORDER BY table_name, column_name;

-- Check if there are any foreign key constraints that might be causing issues
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
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('users', 'presets', 'categories', 'preset_categories', 'preset_files')
ORDER BY tc.table_name;

-- Check the current data type of the users.id column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- If the id column is currently INTEGER, we need to handle this carefully
-- First, let's see what data we have
SELECT id, email, name FROM users LIMIT 10;

-- Check if there are any auth.users that match
SELECT id, email FROM auth.users LIMIT 10;

-- Instead of trying to cast, let's check if we need to recreate the table
-- But first, let's try a safer approach by checking the existing constraints
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

-- Check if there are any RLS policies that need to be updated
SELECT 
    polname,
    polcmd,
    polqual,
    polwithcheck
FROM pg_policy 
WHERE polrelid = 'users'::regclass;

-- If the users table id column is INTEGER but should be UUID, we need to recreate the table
-- But let's first check if it's already UUID
DO $$
DECLARE
    id_type TEXT;
BEGIN
    SELECT data_type INTO id_type
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id';
    
    IF id_type = 'integer' THEN
        RAISE NOTICE 'Users table id column is INTEGER, needs to be converted to UUID';
        -- We would need to recreate the table in this case
        -- But let's not do that automatically, instead let's just fix the constraints
    ELSE
        RAISE NOTICE 'Users table id column is already %', id_type;
    END IF;
END $$;

-- Fix the foreign key constraint to auth.users if it doesn't exist
-- First drop any existing problematic constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_auth_users;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add the proper foreign key constraint
ALTER TABLE users 
ADD CONSTRAINT fk_auth_users 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Recreate RLS policies with proper UUID handling
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create proper policies using auth.uid() function
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON TABLE users TO authenticated;

-- Verify the fix
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