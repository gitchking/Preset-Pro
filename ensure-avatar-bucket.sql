-- Ensure the avatars bucket exists and has proper policies

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Check if the bucket exists
SELECT id, name, public FROM storage.buckets WHERE name = 'avatars';

-- Create or replace policies for the avatars bucket
-- Policy for authenticated users to upload avatars
CREATE POLICY IF NOT EXISTS "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy for anyone to read avatars
CREATE POLICY IF NOT EXISTS "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy for users to delete their own avatars
CREATE POLICY IF NOT EXISTS "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Grant necessary permissions
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.buckets TO authenticated;