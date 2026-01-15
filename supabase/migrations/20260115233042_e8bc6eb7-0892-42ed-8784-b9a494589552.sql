-- Remove the overly permissive public read policy that exposes email and dietary data
-- The profiles_public view already exists and excludes sensitive fields
DROP POLICY IF EXISTS "Public can read profiles for display" ON public.profiles;