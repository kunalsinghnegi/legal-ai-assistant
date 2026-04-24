-- Create a storage bucket for legal documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'legal-documents',
  'legal-documents',
  false,
  10485760,  -- 10 MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'legal-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can view/download their own documents
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'legal-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'legal-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Admins can access all documents
CREATE POLICY "Admins can manage all documents"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'legal-documents' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'legal-documents' AND public.has_role(auth.uid(), 'admin'));
