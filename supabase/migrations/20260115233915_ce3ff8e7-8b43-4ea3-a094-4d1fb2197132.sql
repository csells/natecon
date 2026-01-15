-- Replace the overly permissive public SELECT policy with authenticated-only access
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;

CREATE POLICY "Teams are viewable by authenticated users"
ON public.teams
FOR SELECT
TO authenticated
USING (true);

-- Also restrict team_members to authenticated users only
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON public.team_members;

CREATE POLICY "Team members are viewable by authenticated users"
ON public.team_members
FOR SELECT
TO authenticated
USING (true);