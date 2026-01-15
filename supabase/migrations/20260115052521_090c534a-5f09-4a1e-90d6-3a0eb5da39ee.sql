-- Proper fix: Restrict base table, use security definer function for public view access

-- 1. Drop the overly permissive policy we just created
DROP POLICY IF EXISTS "Anyone can view profiles for public display" ON public.profiles;

-- 2. Drop the view
DROP VIEW IF EXISTS public.profiles_public;

-- 3. Create a security definer function to get public profile data
-- This bypasses RLS and only returns non-sensitive columns
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  photo_url text,
  bio text,
  substack_handle text,
  registration_status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    user_id,
    name,
    photo_url,
    bio,
    substack_handle,
    registration_status,
    created_at,
    updated_at
  FROM public.profiles;
$$;

-- 4. Create a view that uses this function (no security invoker needed)
CREATE VIEW public.profiles_public AS
  SELECT * FROM public.get_public_profiles();