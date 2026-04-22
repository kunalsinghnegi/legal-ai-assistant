ALTER TABLE public.profiles
  ADD COLUMN phone TEXT,
  ADD COLUMN address TEXT,
  ADD COLUMN case_category TEXT,
  ADD COLUMN bar_id TEXT,
  ADD COLUMN experience_years INTEGER,
  ADD COLUMN specialization TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (
    user_id, full_name, phone, address, case_category,
    bar_id, experience_years, specialization
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'case_category',
    NEW.raw_user_meta_data ->> 'bar_id',
    NULLIF(NEW.raw_user_meta_data ->> 'experience_years', '')::INTEGER,
    NEW.raw_user_meta_data ->> 'specialization'
  );

  _role := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'client');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;