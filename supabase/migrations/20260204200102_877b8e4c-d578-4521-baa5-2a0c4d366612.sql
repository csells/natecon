-- Enable RLS on email_rate_limits table
ALTER TABLE public.email_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only view their own email rate limit records
CREATE POLICY "Users can view own email rate limits"
ON public.email_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own email rate limit records
CREATE POLICY "Users can insert own email rate limits"
ON public.email_rate_limits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all email rate limits for monitoring
CREATE POLICY "Admins can view all email rate limits"
ON public.email_rate_limits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete email rate limits (for cleanup)
CREATE POLICY "Admins can delete email rate limits"
ON public.email_rate_limits
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));