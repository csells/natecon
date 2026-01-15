-- Drop the overly permissive profile select policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more restrictive policy: authenticated users can view profiles for networking purposes
-- but this still protects the data from anonymous access
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Create a public view that excludes sensitive information (email, dietary info)
-- for features that need public profile display (e.g., speaker pages)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
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
-- Note: This view excludes email and dietary information