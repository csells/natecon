import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const FROM_EMAIL = "NateCon <hello@natejonesdon.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailType = 
  | "welcome"
  | "talk_accepted"
  | "talk_rejected"
  | "team_joined"
  | "team_member_left"
  | "registration_open";

interface EmailRequest {
  type: EmailType;
  to: string;
  data?: {
    name?: string;
    talkTitle?: string;
    teamName?: string;
    memberName?: string;
  };
}

// Rate limits per email type (per user)
const RATE_LIMITS: Record<EmailType, { maxPerHour: number; maxPerDay: number }> = {
  welcome: { maxPerHour: 2, maxPerDay: 5 },
  team_joined: { maxPerHour: 10, maxPerDay: 50 },
  team_member_left: { maxPerHour: 10, maxPerDay: 50 },
  talk_accepted: { maxPerHour: 100, maxPerDay: 500 }, // Admin only - higher limits
  talk_rejected: { maxPerHour: 100, maxPerDay: 500 }, // Admin only - higher limits
  registration_open: { maxPerHour: 5, maxPerDay: 10 },
};

// Escape HTML entities to prevent XSS attacks in email templates
function escapeHtml(unsafe: string | undefined | null): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Check rate limits and return whether the request is allowed
async function checkRateLimit(
  supabase: any,
  userId: string,
  emailType: EmailType
): Promise<{ allowed: boolean; message?: string }> {
  const limits = RATE_LIMITS[emailType];
  if (!limits) {
    return { allowed: true };
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Check hourly limit
  const { count: hourlyCount, error: hourlyError } = await supabase
    .from("email_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("email_type", emailType)
    .gte("sent_at", oneHourAgo);

  if (hourlyError) {
    console.error("Error checking hourly rate limit:", hourlyError);
    // Allow on error to not block legitimate emails
    return { allowed: true };
  }

  if ((hourlyCount ?? 0) >= limits.maxPerHour) {
    return { 
      allowed: false, 
      message: `Rate limit exceeded: Maximum ${limits.maxPerHour} ${emailType} emails per hour` 
    };
  }

  // Check daily limit
  const { count: dailyCount, error: dailyError } = await supabase
    .from("email_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("email_type", emailType)
    .gte("sent_at", oneDayAgo);

  if (dailyError) {
    console.error("Error checking daily rate limit:", dailyError);
    return { allowed: true };
  }

  if ((dailyCount ?? 0) >= limits.maxPerDay) {
    return { 
      allowed: false, 
      message: `Rate limit exceeded: Maximum ${limits.maxPerDay} ${emailType} emails per day` 
    };
  }

  return { allowed: true };
}

// Record email send for rate limiting
async function recordEmailSend(
  supabase: any,
  userId: string,
  emailType: EmailType,
  recipient: string
): Promise<void> {
  const { error } = await supabase
    .from("email_rate_limits")
    .insert({
      user_id: userId,
      email_type: emailType,
      recipient: recipient,
    });

  if (error) {
    console.error("Error recording email send:", error);
    // Non-blocking - don't fail the email send if recording fails
  }
}

function getEmailContent(type: EmailType, data: EmailRequest["data"] = {}) {
  // Sanitize all user-provided data before using in templates
  const safeName = escapeHtml(data.name) || "there";
  const safeTalkTitle = escapeHtml(data.talkTitle);
  const safeTeamName = escapeHtml(data.teamName);
  const safeMemberName = escapeHtml(data.memberName);

  const templates: Record<EmailType, { subject: string; html: string }> = {
    welcome: {
      subject: "Welcome to NateCon 2026! 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Welcome to NateCon 2026!</h1>
          <p>Hi ${safeName},</p>
          <p>Thanks for signing up for NateCon 2026! We're excited to have you join our community of writers and creators.</p>
          <p>Here's what you can do now:</p>
          <ul>
            <li>📝 <strong>Submit a talk proposal</strong> - Share your expertise with the community</li>
            <li>👥 <strong>Join or create a team</strong> - Collaborate on hackathon projects</li>
            <li>📅 <strong>Stay tuned</strong> - We'll notify you when registration opens</li>
          </ul>
          <p>If you have any questions, feel free to reach out!</p>
          <p>See you at NateCon 2026!</p>
          <p style="color: #666;">— The NateCon Team</p>
        </div>
      `,
    },
    talk_accepted: {
      subject: "🎉 Your NateCon 2026 Talk Proposal Was Accepted!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Congratulations! 🎉</h1>
          <p>Hi ${safeName},</p>
          <p>Great news! Your talk proposal <strong>"${safeTalkTitle}"</strong> has been accepted for NateCon 2026!</p>
          <p>We'll be in touch soon with more details about scheduling and logistics.</p>
          <p>Thank you for contributing to NateCon 2026!</p>
          <p style="color: #666;">— The NateCon Team</p>
        </div>
      `,
    },
    talk_rejected: {
      subject: "Update on Your NateCon 2026 Talk Proposal",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Thank You for Your Submission</h1>
          <p>Hi ${safeName},</p>
          <p>Thank you for submitting your talk proposal <strong>"${safeTalkTitle}"</strong> for NateCon 2026.</p>
          <p>Unfortunately, we weren't able to include it in this year's program. We received many excellent proposals and had to make difficult decisions.</p>
          <p>We hope you'll still join us at NateCon 2026 and consider submitting again in the future!</p>
          <p style="color: #666;">— The NateCon Team</p>
        </div>
      `,
    },
    team_joined: {
      subject: "Welcome to the Team! 👋",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">New Team Member!</h1>
          <p>Hi ${safeName},</p>
          <p>Great news! <strong>${safeMemberName}</strong> has joined your team <strong>"${safeTeamName}"</strong> for NateCon 2026!</p>
          <p>Head over to your dashboard to see your full team and start collaborating.</p>
          <p style="color: #666;">— The NateCon Team</p>
        </div>
      `,
    },
    team_member_left: {
      subject: "Team Update",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Team Update</h1>
          <p>Hi ${safeName},</p>
          <p><strong>${safeMemberName}</strong> has left your team <strong>"${safeTeamName}"</strong>.</p>
          <p>You can invite new members from your dashboard.</p>
          <p style="color: #666;">— The NateCon Team</p>
        </div>
      `,
    },
    registration_open: {
      subject: "🎟️ NateCon 2026 Registration is Now Open!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Registration is Open! 🎟️</h1>
          <p>Hi ${safeName},</p>
          <p>The moment you've been waiting for is here! Registration for NateCon 2026 is now open.</p>
          <p>Secure your spot today and join us for an incredible experience!</p>
          <p><a href="#" style="display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Register Now</a></p>
          <p style="color: #666;">— The NateCon Team</p>
        </div>
      `,
    },
  };

  return templates[type];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-email function invoked");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Missing authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user auth for JWT verification
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("JWT verification failed:", claimsError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log(`Authenticated user: ${userId}`);

    const { type, to, data }: EmailRequest = await req.json();
    console.log(`Sending ${type} email to ${to}`);

    if (!type || !to) {
      throw new Error("Missing required fields: type and to");
    }

    // Create Supabase client with service role for rate limiting operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limits
    const rateLimitResult = await checkRateLimit(supabaseService, userId, type);
    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for user ${userId}, email type ${type}`);
      return new Response(
        JSON.stringify({ success: false, error: rateLimitResult.message }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailContent = getEmailContent(type, data);
    if (!emailContent) {
      throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Record email send for rate limiting (non-blocking)
    await recordEmailSend(supabaseService, userId, type, to);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);