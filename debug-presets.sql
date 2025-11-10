-- Debug script to check existing presets and their author information
SELECT 
    id,
    name,
    author_name,
    author_email,
    created_at,
    status
FROM presets
ORDER BY created_at DESC
LIMIT 10;