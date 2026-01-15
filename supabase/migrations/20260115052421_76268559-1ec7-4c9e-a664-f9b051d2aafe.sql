-- Fix Issue 1: Restrict profiles table access to prevent sensitive data exposure

-- Drop the overly permissive policy that exposes all profile data to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Add policy for admins to view all profiles (needed for admin functionality)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Recreate profiles_public view WITHOUT security_invoker so it's accessible to everyone
-- This view only contains non-sensitive data (no email, no dietary info)
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
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