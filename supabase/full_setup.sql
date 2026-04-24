-- ============================================================
-- LEGAL AI ASSISTANT — Full Database Setup
-- Run this ENTIRE script in your Supabase SQL Editor
-- Project: thcgwoihaeiazwctuqve
-- ============================================================

-- =========================
-- ENUMS & HELPER FUNCTIONS
-- =========================
CREATE TYPE public.app_role AS ENUM ('client', 'lawyer', 'admin');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  case_category TEXT,
  bar_id TEXT,
  experience_years INTEGER,
  specialization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- USER ROLES
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- LAWYERS
-- =========================
CREATE TABLE public.lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  bar_id TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2),
  bio TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers viewable by authenticated users"
  ON public.lawyers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lawyer can insert own row"
  ON public.lawyers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lawyer can update own row"
  ON public.lawyers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all lawyers"
  ON public.lawyers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_lawyers_updated_at
  BEFORE UPDATE ON public.lawyers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- CASES
-- =========================
CREATE TYPE public.case_status AS ENUM ('open', 'in_progress', 'closed', 'cancelled');
CREATE TYPE public.case_urgency AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status public.case_status NOT NULL DEFAULT 'open',
  urgency public.case_urgency NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients manage own cases"
  ON public.cases FOR ALL TO authenticated
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Lawyers can view all open cases"
  ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage all cases"
  ON public.cases FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- APPOINTMENTS
-- =========================
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.appointment_mode AS ENUM ('online', 'in_person');

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  lawyer_id UUID NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  mode public.appointment_mode NOT NULL DEFAULT 'online',
  status public.appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);
CREATE POLICY "Clients create appointments"
  ON public.appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants update appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);
CREATE POLICY "Participants delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);
CREATE POLICY "Admins manage all appointments"
  ON public.appointments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- CLIENT REQUESTS
-- =========================
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE public.client_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  lawyer_id UUID NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  message TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view requests"
  ON public.client_requests FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);
CREATE POLICY "Clients create requests"
  ON public.client_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants update requests"
  ON public.client_requests FOR UPDATE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);
CREATE POLICY "Clients delete own requests"
  ON public.client_requests FOR DELETE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Admins manage all requests"
  ON public.client_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_client_requests_updated_at
  BEFORE UPDATE ON public.client_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- CHAT MESSAGES (AI)
-- =========================
CREATE TYPE public.chat_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role public.chat_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own messages"
  ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own messages"
  ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages"
  ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all messages"
  ON public.chat_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);

-- =========================
-- REVIEWS
-- =========================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  lawyer_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, lawyer_id, appointment_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by authenticated"
  ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients create own reviews"
  ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients update own reviews"
  ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Clients delete own reviews"
  ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Admins manage all reviews"
  ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- AUTO-MAINTAIN LAWYER RATINGS
-- =========================
CREATE OR REPLACE FUNCTION public.refresh_lawyer_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _lawyer UUID := COALESCE(NEW.lawyer_id, OLD.lawyer_id);
BEGIN
  UPDATE public.lawyers
     SET average_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE lawyer_id = _lawyer), 0),
         total_reviews  = (SELECT COUNT(*) FROM public.reviews WHERE lawyer_id = _lawyer)
   WHERE user_id = _lawyer;
  RETURN NULL;
END;
$$;

CREATE TRIGGER reviews_refresh_lawyer_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_lawyer_rating();

-- =========================
-- AUTO-CREATE PROFILE + ROLE ON SIGNUP
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (
    user_id, full_name, phone, address, case_category,
    bar_id, experience_years, specialization
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'case_category',
    NEW.raw_user_meta_data->>'bar_id',
    NULLIF(NEW.raw_user_meta_data->>'experience_years', '')::INTEGER,
    NEW.raw_user_meta_data->>'specialization'
  );

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'client');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  IF _role = 'lawyer' THEN
    INSERT INTO public.lawyers (user_id, bar_id, specialization, experience_years)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'bar_id', 'PENDING'),
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'General'),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'experience_years', '')::INTEGER, 0)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
