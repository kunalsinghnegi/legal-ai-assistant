-- Allow lawyers to insert requests as lawyer
CREATE POLICY "Lawyers can insert requests as lawyer"
  ON public.client_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = lawyer_id);
