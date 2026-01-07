/**
 * Generic Email Sending Function
 *
 * Sends emails using SendGrid with custom templates
 * Supports HTML and plain text emails
 */

import { SendGrid } from 'npm:@sendgrid/mail';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailRequest {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get SendGrid API key from environment
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const DEFAULT_SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'no-reply@siports.com';

    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const {
      to,
      from,
      replyTo,
      subject,
      html,
      text,
      cc,
      bcc,
      attachments,
    }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

    // Initialize SendGrid
    const sgMail = new SendGrid(SENDGRID_API_KEY);

    // Prepare email message
    const message: any = {
      to,
      from: from || DEFAULT_SENDER_EMAIL,
      subject,
      html,
    };

    // Add optional fields
    if (text) message.text = text;
    if (replyTo) message.replyTo = replyTo;
    if (cc) message.cc = cc;
    if (bcc) message.bcc = bcc;
    if (attachments && attachments.length > 0) {
      message.attachments = attachments;
    }

    // Send email
    console.log('📧 Sending email to:', Array.isArray(to) ? to.join(', ') : to);
    console.log('📋 Subject:', subject);

    await sgMail.send(message);

    console.log('✅ Email sent successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        details: {
          to: Array.isArray(to) ? to : [to],
          subject,
          sentAt: new Date().toISOString(),
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Error in send-template-email:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred while sending email',
        details: error.toString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
