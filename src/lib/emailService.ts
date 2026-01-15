import { supabase } from "@/integrations/supabase/client";

type EmailType = 
  | "welcome"
  | "talk_accepted"
  | "talk_rejected"
  | "team_joined"
  | "team_member_left"
  | "registration_open";

interface SendEmailParams {
  type: EmailType;
  to: string;
  data?: {
    name?: string;
    talkTitle?: string;
    teamName?: string;
    memberName?: string;
  };
}

export async function sendEmail({ type, to, data }: SendEmailParams) {
  try {
    const { data: response, error } = await supabase.functions.invoke("send-email", {
      body: { type, to, data },
    });

    if (error) {
      console.error("Error invoking send-email function:", error);
      throw error;
    }

    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({ type: "welcome", to: email, data: { name } });
}

export async function sendTalkAcceptedEmail(email: string, name: string, talkTitle: string) {
  return sendEmail({ type: "talk_accepted", to: email, data: { name, talkTitle } });
}

export async function sendTalkRejectedEmail(email: string, name: string, talkTitle: string) {
  return sendEmail({ type: "talk_rejected", to: email, data: { name, talkTitle } });
}

export async function sendTeamJoinedEmail(email: string, name: string, teamName: string, memberName: string) {
  return sendEmail({ type: "team_joined", to: email, data: { name, teamName, memberName } });
}

export async function sendTeamMemberLeftEmail(email: string, name: string, teamName: string, memberName: string) {
  return sendEmail({ type: "team_member_left", to: email, data: { name, teamName, memberName } });
}

export async function sendRegistrationOpenEmail(email: string, name?: string) {
  return sendEmail({ type: "registration_open", to: email, data: { name } });
}
