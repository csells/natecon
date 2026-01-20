-- Drop the overly permissive policy we just created
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- The profiles_public view already excludes sensitive fields (email, dietary info).
-- We need to allow unauthenticated users to query this view for the counter.
-- Since the view has security_invoker=on, it runs with caller's permissions.
-- We need a policy on the base profiles table that allows SELECT but only for the counter use case.

-- Actually, the safest approach is to make the view NOT use security_invoker, 
-- so it runs with definer permissions and can always read the data.
-- Then the view itself acts as the security boundary (only exposing safe columns).

ALTER VIEW public.profiles_public SET (security_invoker = off);