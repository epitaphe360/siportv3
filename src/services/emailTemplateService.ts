/**
 * Email Template Service
 * Templates HTML professionnels pour tous les emails
 */

import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface WelcomeEmailData {
  firstName: string;
  email: string;
  accountType: string;
  loginUrl: string;
}

export interface AppointmentEmailData {
  firstName: string;
  exhibitorName: string;
  date: string;
  time: string;
  location?: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  cancelUrl?: string;
}

export interface PaymentConfirmationData {
  firstName: string;
  amount: string;
  receiptNumber: string;
  date: string;
  downloadUrl: string;
}

class EmailTemplateService {
  private baseUrl = import.meta.env.VITE_APP_URL || 'https://siportevent.com';

  /**
   * Base HTML template
   */
  private getBaseTemplate(content: string, previewText?: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>SIPORT 2026</title>
  ${previewText ? `<!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->` : ''}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
    }
    .content {
      padding: 40px 20px;
      color: #1f2937;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #3B82F6;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #3B82F6;
      text-decoration: none;
    }
    h1 {
      color: #111827;
      font-size: 28px;
      margin: 0 0 20px 0;
    }
    p {
      margin: 0 0 16px 0;
    }
    .highlight {
      background-color: #EFF6FF;
      border-left: 4px solid #3B82F6;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px;
      }
      h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" role="presentation" cellpadding="0" cellspacing="0" border="0">
          <!-- Header -->
          <tr>
            <td class="header">
              <a href="${this.baseUrl}" class="logo">SIPORT 2026</a>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                Salon International des Ports
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <div class="social-links">
                <a href="https://facebook.com/siport2026">Facebook</a>
                <a href="https://twitter.com/siport2026">Twitter</a>
                <a href="https://linkedin.com/company/siport2026">LinkedIn</a>
              </div>

              <p>
                SIPORT 2026 - Salon International des Ports<br>
                1-3 Avril 2026, Casablanca, Maroc
              </p>

              <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                Vous recevez cet email car vous êtes inscrit sur siportevent.com<br>
                <a href="${this.baseUrl}/unsubscribe" style="color: #3B82F6;">Se désabonner</a> |
                <a href="${this.baseUrl}/preferences" style="color: #3B82F6;">Préférences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Welcome Email
   */
  generateWelcomeEmail(data: WelcomeEmailData): EmailTemplate {
    const content = `
      <h1>Bienvenue ${data.firstName} ! 🎉</h1>

      <p>Merci de vous être inscrit sur SIPORT 2026 en tant que <strong>${data.accountType}</strong>.</p>

      <p>Votre compte a été créé avec succès. Vous pouvez dès maintenant accéder à votre tableau de bord et profiter de toutes les fonctionnalités de la plateforme.</p>

      <div class="highlight">
        <p style="margin: 0;"><strong>📧 Adresse email:</strong> ${data.email}</p>
      </div>

      <center>
        <a href="${data.loginUrl}" class="button">Accéder à mon compte</a>
      </center>

      <p>Si vous avez des questions, n'hésitez pas à nous contacter à support@siportevent.com</p>

      <p>À bientôt,<br>L'équipe SIPORT 2026</p>
    `;

    const text = `
Bienvenue ${data.firstName} !

Merci de vous être inscrit sur SIPORT 2026 en tant que ${data.accountType}.

Votre compte a été créé avec succès. Connectez-vous sur ${data.loginUrl}

Adresse email: ${data.email}

Si vous avez des questions, contactez-nous à support@siportevent.com

À bientôt,
L'équipe SIPORT 2026
    `.trim();

    return {
      subject: 'Bienvenue sur SIPORT 2026 ! 🎉',
      html: this.getBaseTemplate(content, 'Bienvenue sur SIPORT 2026 !'),
      text,
    };
  }

  /**
   * Appointment Confirmation
   */
  generateAppointmentConfirmation(data: AppointmentEmailData): EmailTemplate {
    const typeLabels = {
      'in-person': 'En présentiel',
      'virtual': 'Virtuel',
      'hybrid': 'Hybride',
    };

    const content = `
      <h1>Rendez-vous confirmé ✓</h1>

      <p>Bonjour ${data.firstName},</p>

      <p>Votre rendez-vous avec <strong>${data.exhibitorName}</strong> a été confirmé.</p>

      <div class="highlight">
        <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> ${data.date}</p>
        <p style="margin: 0 0 10px 0;"><strong>🕐 Heure:</strong> ${data.time}</p>
        <p style="margin: 0 0 10px 0;"><strong>📍 Type:</strong> ${typeLabels[data.type]}</p>
        ${data.location ? `<p style="margin: 0;"><strong>📍 Lieu:</strong> ${data.location}</p>` : ''}
      </div>

      <p>Nous vous rappelons ce rendez-vous 24h avant la date prévue.</p>

      ${data.cancelUrl ? `
        <p style="font-size: 14px; color: #6b7280;">
          Besoin d'annuler ? <a href="${data.cancelUrl}" style="color: #3B82F6;">Cliquez ici</a>
        </p>
      ` : ''}

      <p>À bientôt,<br>L'équipe SIPORT 2026</p>
    `;

    const text = `
Rendez-vous confirmé ✓

Bonjour ${data.firstName},

Votre rendez-vous avec ${data.exhibitorName} a été confirmé.

Date: ${data.date}
Heure: ${data.time}
Type: ${typeLabels[data.type]}
${data.location ? `Lieu: ${data.location}` : ''}

Nous vous rappelons ce rendez-vous 24h avant.

${data.cancelUrl ? `Annuler: ${data.cancelUrl}` : ''}

À bientôt,
L'équipe SIPORT 2026
    `.trim();

    return {
      subject: `Rendez-vous confirmé avec ${data.exhibitorName}`,
      html: this.getBaseTemplate(content, 'Votre rendez-vous est confirmé'),
      text,
    };
  }

  /**
   * Payment Confirmation
   */
  generatePaymentConfirmation(data: PaymentConfirmationData): EmailTemplate {
    const content = `
      <h1>Paiement confirmé ✓</h1>

      <p>Bonjour ${data.firstName},</p>

      <p>Nous avons bien reçu votre paiement. Merci !</p>

      <div class="highlight">
        <p style="margin: 0 0 10px 0;"><strong>💳 Montant:</strong> ${data.amount}</p>
        <p style="margin: 0 0 10px 0;"><strong>📋 Numéro de reçu:</strong> ${data.receiptNumber}</p>
        <p style="margin: 0;"><strong>📅 Date:</strong> ${data.date}</p>
      </div>

      <center>
        <a href="${data.downloadUrl}" class="button">📥 Télécharger le reçu</a>
      </center>

      <p>Votre compte a été activé et vous avez maintenant accès à toutes les fonctionnalités.</p>

      <p>Merci de votre confiance,<br>L'équipe SIPORT 2026</p>
    `;

    const text = `
Paiement confirmé ✓

Bonjour ${data.firstName},

Nous avons bien reçu votre paiement de ${data.amount}.

Numéro de reçu: ${data.receiptNumber}
Date: ${data.date}

Téléchargez votre reçu: ${data.downloadUrl}

Merci de votre confiance,
L'équipe SIPORT 2026
    `.trim();

    return {
      subject: 'Paiement confirmé - SIPORT 2026',
      html: this.getBaseTemplate(content, 'Votre paiement a été confirmé'),
      text,
    };
  }

  /**
   * Send email via Node.js Backend API
   */
  async sendEmail(
    to: string,
    template: EmailTemplate,
    options?: { from?: string; replyTo?: string }
  ): Promise<boolean> {
    try {
      logger.info('Sending email via API', { to, subject: template.subject });

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject: template.subject,
          html: template.html,
          text: template.text,
          replyTo: options?.replyTo,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        logger.error('API Email error', new Error('API failed'), { err });
        return false;
      }

      return true;
    } catch (error) {
       logger.error('Email exception', error as Error);
       return false;
    }
  }

      if (!data?.success) {
        logger.error('Email sending failed', new Error(data?.error || 'Unknown error'), { to });
        return false;
      }

      logger.info('Email sent successfully', { to, subject: template.subject });
      return true;
    } catch (error) {
      logger.error('Failed to send email', error as Error, { to });
      return false;
    }
  }
}

export const emailTemplateService = new EmailTemplateService();
export default emailTemplateService;
