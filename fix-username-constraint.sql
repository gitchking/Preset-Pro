-- Fix username constraint issue in users table

-- First, check the current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- If username is NOT NULL and causing issues, we can either:
-- 1. Add a default value, or
-- 2. Make it nullable

-- Option 1: Make username nullable (recommended for now)
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Or Option 2: Add a default value
-- ALTER TABLE users ALTER COLUMN username SET DEFAULT '';

-- Verify the change
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;