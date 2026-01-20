-- Create table to track email sends for rate limiting
CREATE TABLE public.email_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient rate limit queries
CREATE INDEX idx_email_rate_user_type_time ON public.email_rate_limits(user_id, email_type, sent_at DESC);

-- Enable RLS
ALTER TABLE public.email_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow service role access (edge functions use service role)
-- No user-facing policies needed as this is internal tracking only

-- Create cleanup function to remove old records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_email_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_rate_limits
  WHERE sent_at < NOW() - INTERVAL '24 hours';
END;
$$;