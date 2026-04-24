-- ============================================================
-- CHAT FEATURE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create direct_messages table for appointment-gated chat
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Participants of the linked appointment can view messages
CREATE POLICY "Participants can view messages"
  ON public.direct_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_id
        AND (a.client_id = auth.uid() OR a.lawyer_id = auth.uid())
    )
  );

-- Can only SEND a message during the active booking window
CREATE POLICY "Participants can send messages"
  ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_id
        AND (a.client_id = auth.uid() OR a.lawyer_id = auth.uid())
        AND now() >= a.scheduled_at
        AND now() <= a.scheduled_at + (a.duration_minutes || ' minutes')::interval
    )
  );

-- Enable Realtime so messages appear live
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
