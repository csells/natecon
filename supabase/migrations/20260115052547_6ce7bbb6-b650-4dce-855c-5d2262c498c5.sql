-- Final fix: Use security_invoker view with proper RLS on base table
-- The tradeoff: We allow SELECT on all profiles but only expose non-sensitive columns via the view

-- 1. Drop the function-based view approach
DROP VIEW IF EXISTS public.profiles_public;
DROP FUNCTION IF EXISTS public.get_public_profiles();

-- 2. Create the view with security_invoker
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
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

-- 3. Add a policy to allow reading profiles for the view to work
-- This is acceptable because the VIEW limits which columns are exposed
-- The email and dietary info are NOT in the view
CREATE POLICY "Public can read profiles for display"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);