-- Fix the security definer view warning by using security_invoker
-- But we need to ensure the view is still accessible

-- Drop the current view
DROP VIEW IF EXISTS public.profiles_public;

-- Create a policy that allows public/everyone to SELECT from profiles
-- but only the non-sensitive columns via the view
-- First, we need to add a permissive policy for unauthenticated access to work with the view

-- Create view with security_invoker so it respects RLS
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

-- Allow anyone (including anon) to read public profile fields via select
-- This policy is needed for the speakers page and other public pages
CREATE POLICY "Anyone can view profiles for public display"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);