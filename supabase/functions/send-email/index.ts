import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

function getEmailContent(type: EmailType, data: EmailRequest["data"] = {}) {
  const templates: Record<EmailType, { subject: string; html: string }> = {
    welcome: {
      subject: "Welcome to NateCon 2026! 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Welcome to NateCon 2026!</h1>
          <p>Hi ${data.name || "there"},</p>
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
          <p>Hi ${data.name || "there"},</p>
          <p>Great news! Your talk proposal <strong>"${data.talkTitle}"</strong> has been accepted for NateCon 2026!</p>
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
          <p>Hi ${data.name || "there"},</p>
          <p>Thank you for submitting your talk proposal <strong>"${data.talkTitle}"</strong> for NateCon 2026.</p>
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
          <p>Hi ${data.name || "there"},</p>
          <p>Great news! <strong>${data.memberName}</strong> has joined your team <strong>"${data.teamName}"</strong> for NateCon 2026!</p>
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
          <p>Hi ${data.name || "there"},</p>
          <p><strong>${data.memberName}</strong> has left your team <strong>"${data.teamName}"</strong>.</p>
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
          <p>Hi ${data.name || "there"},</p>
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
    const { type, to, data }: EmailRequest = await req.json();
    console.log(`Sending ${type} email to ${to}`);

    if (!type || !to) {
      throw new Error("Missing required fields: type and to");
    }

    const emailContent = getEmailContent(type, data);
    if (!emailContent) {
      throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "NateCon <onboarding@resend.dev>",
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

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
