-- Fix for users table issues

-- First, let's check what we currently have
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check constraints
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

-- Drop the foreign key constraint that might be causing issues
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Recreate the users table with the correct structure
-- First, rename the existing table
ALTER TABLE users RENAME TO users_old;

-- Create the new users table with the correct structure
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    gender TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy data from the old table
INSERT INTO users (id, username, name, email, avatar_url, bio, gender, created_at, updated_at)
SELECT id, username, name, email, avatar_url, bio, gender, created_at, updated_at
FROM users_old;

-- Drop the old table
DROP TABLE users_old;

-- Add the foreign key constraint correctly
ALTER TABLE users ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON TABLE users TO authenticated;

-- Verify the structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;