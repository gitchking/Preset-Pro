-- Diagnose UUID vs Integer mismatch issue
-- Check the structure of all tables to identify potential mismatches
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('users', 'presets', 'categories', 'preset_categories', 'preset_files')
ORDER BY table_name, column_name;

-- Check the foreign key relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    kcu.ordinal_position
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
ORDER BY tc.table_name, kcu.ordinal_position;

-- Check the preset_categories table specifically since it's likely where the mismatch occurs
SELECT * FROM preset_categories LIMIT 10;

-- Check if there are any triggers or functions that might be causing the issue
SELECT 
    routine_name, 
    routine_type, 
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name ILIKE '%preset%' 
   OR routine_name ILIKE '%user%'
   OR routine_name ILIKE '%category%'
ORDER BY routine_name;

-- Check for any views that might be causing issues
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_name ILIKE '%preset%' 
   OR table_name ILIKE '%user%'
   OR table_name ILIKE '%category%';

-- Check for any data that might be causing the issue
-- Look for any rows where IDs might be mixed up
SELECT id, name, email FROM users WHERE id IS NOT NULL LIMIT 5;
SELECT id, name FROM presets WHERE id IS NOT NULL LIMIT 5;
SELECT preset_id, category_id FROM preset_categories LIMIT 5;