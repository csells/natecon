-- Enable RLS on the profiles_public view
ALTER VIEW public.profiles_public SET (security_invoker = on);

-- Create a policy to allow anyone to read profiles_public (it already excludes PII like email)
CREATE POLICY "Anyone can view public profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Wait, profiles_public is a VIEW not a table, so we can't add RLS directly to it.
-- The view uses security_invoker, so it inherits RLS from the base table.
-- We need to allow public SELECT on the base profiles table for the public fields only.
-- But that would expose all columns including email.

-- Better approach: Create a permissive policy that allows counting via the view
-- Actually, let's check if profiles_public is a view or table first