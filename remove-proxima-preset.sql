-- Find the preset with title 'proxima' and effects containing 'anime'
SELECT id, name, effects, author_email, created_at
FROM presets 
WHERE name = 'proxima' 
   OR effects ILIKE '%anime%';

-- Delete the specific preset with title 'proxima'
DELETE FROM presets 
WHERE name = 'proxima' 
   AND effects ILIKE '%anime%';

-- Alternative: Delete by exact match if the above doesn't find it
DELETE FROM presets 
WHERE name ILIKE '%proxima%' 
   AND effects ILIKE '%anime%';

-- Verify the deletion
SELECT id, name, effects, author_email, created_at
FROM presets 
WHERE name ILIKE '%proxima%' 
   OR effects ILIKE '%anime%';