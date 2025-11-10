-- Check current users table structure
\d users;

-- Check current presets table structure
\d presets;

-- Check if auth.users exists and its structure
\d auth.users;

-- Check current policies on users table
SELECT policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'users';

-- Check current policies on presets table
SELECT policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'presets';