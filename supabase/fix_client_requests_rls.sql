-- Fix RLS: allow lawyers to insert client_requests (when they express interest in a case)
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Clients create requests" ON public.client_requests;

-- New policy: clients can create requests (client is the initiator, lawyer_id set by them)
-- OR lawyers can create requests (lawyer is the initiator, expressing interest in a client's case)
CREATE POLICY "Clients and lawyers create requests"
  ON public.client_requests FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = client_id   -- client books a lawyer
    OR auth.uid() = lawyer_id -- lawyer expresses interest
  );
