ALTER TABLE activities ADD COLUMN IF NOT EXISTS url text;

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'attachments');
