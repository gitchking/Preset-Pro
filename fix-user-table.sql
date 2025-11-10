-- Fix for the user table to ensure proper schema
-- First, let's check the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY column_name;

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Ensure the id column is properly defined as UUID
-- Note: We can't change the type of an existing column, so we'll need to check if it's correct
-- If there are issues with the id column, we might need to recreate the table

-- Check if there are any rows with invalid IDs
SELECT id, email, name FROM users WHERE id IS NULL OR id = '' LIMIT 10;

-- If you're getting the UUID vs integer error, it might be because:
-- 1. There's a query somewhere trying to join users.id (UUID) with presets.id (INTEGER)
-- 2. There's a query trying to insert a UUID into an integer column

-- To fix the specific error you're seeing, we need to find the query that's causing it
-- The error "invalid input syntax for type integer: 'f78cf84a-003e-4c29-b113-864a0cbdd917'" 
-- means somewhere we're trying to pass this UUID to an integer field

-- Common causes:
-- 1. Incorrectly joining users and presets tables
-- 2. Trying to insert user ID into a preset field that expects an integer
-- 3. Using user ID in a context where an integer is expected

-- Correct way to query:
-- SELECT * FROM users WHERE id = 'f78cf84a-003e-4c29-b113-864a0cbdd917';  -- UUID
-- SELECT * FROM presets WHERE id = 123;  -- INTEGER

-- Incorrect way that would cause the error:
-- SELECT * FROM presets WHERE id = 'f78cf84a-003e-4c29-b113-864a0cbdd917';  -- Trying to use UUID where integer expected