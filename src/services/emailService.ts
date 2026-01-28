/**
 * 📧 Email Service - Real Email Sending with Resend
 * 
 * Replaces all console.log() mocks with actual email delivery
 * Integrates with Supabase Email function (send-visitor-welcome-email)
 * which uses Resend.com API
 * 
 * Usage:
 * await EmailService.sendWelcomeEmail(user.email, user.profile.firstName, 'visitor')
 * await EmailService.sendAppointmentConfirmation(appointment)
 * await EmailService.sendAppointmentReminder(appointment)
 */

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface AppointmentEmailData {
  visitorEmail: string;
  visitorName: string;
  exhibitorName: string;
  exhibitorEmail: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'rejected' | 'cancelled';
  appointmentId: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.VITE_EMAIL_FROM_ADDRESS || 'noreply@siportevent.com';
  private static readonly SUPPORT_EMAIL = 'support@siportevent.com';
  private static readonly APP_URL = process.env.VITE_APP_URL || 'https://siportevent.com';
  // Use VITE_API_URL if defined, otherwise default to localhost:5000 (prod) or 3000 (dev)
  // For safety in this environment, defaulting to localhost:3000 as per server.js default
  private static readonly API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

  /**
   * Send email via Node.js Backend API (using SMTP)
   * Replaces Supabase Edge Function to use local SMTP credentials
   */
  private static async sendViaSupabase(options: SendEmailOptions): Promise<boolean> {
    try {
      console.log('📧 Sending email via Backend API...', options.to);
      
      const response = await fetch(`${this.API_BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to send email via API:', errorData);
        // Fallback or just return false
        return false;
      }

      const result = await response.json();
      console.log('✅ Email sent successfully via API:', result);
      return true;

    } catch (error) {
      console.error('❌ Error sending email via API:', error);
      return false;
    }
  }


  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(
    email: string,
    firstName: string,
    accountType: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIPORT 2026</h1>
          <p style="margin: 10px 0 0 0;">Salon International des Ports</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #111827;">Bienvenue ${firstName} ! 🎉</h2>
          
          <p>Merci de vous être inscrit sur SIPORT 2026 en tant que <strong>${accountType}</strong>.</p>
          
          <p>Votre compte a été créé avec succès. Vous pouvez dès maintenant accéder à votre tableau de bord et profiter de toutes les fonctionnalités de la plateforme.</p>
          
          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0;"><strong>📧 Adresse email:</strong> ${email}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${this.APP_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Accéder à mon compte</a>
          </div>
          
          <p style="margin-top: 30px;">Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a></p>
          
          <p>À bientôt,<br><strong>L'équipe SIPORT 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 10px 0;">
            SIPORT 2026 - Salon International des Ports<br>
            1-3 Avril 2026, Casablanca, Maroc
          </p>
          <p style="font-size: 12px; margin: 10px 0 0 0;">
            Vous recevez cet email car vous êtes inscrit sur siportevent.com
          </p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: email,
      subject: 'Bienvenue sur SIPORT 2026 ! 🎉',
      html,
      text: `Bienvenue ${firstName} !\n\nMerci de vous être inscrit sur SIPORT 2026.\n\nAccédez à votre compte: ${this.APP_URL}/dashboard`,
    });
  }

  /**
   * Send appointment confirmation email
   */
  static async sendAppointmentConfirmation(data: AppointmentEmailData): Promise<boolean> {
    const statusLabels = {
      confirmed: '✓ Confirmé',
      pending: '⏳ En attente de confirmation',
      rejected: '❌ Refusé',
      cancelled: '🗑️ Annulé',
    };

    const statusColor = {
      confirmed: '#10b981',
      pending: '#f59e0b',
      rejected: '#ef4444',
      cancelled: '#6b7280',
    };

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIPORT 2026</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #111827;">Rendez-vous ${statusLabels[data.status]}</h2>
          
          <p>Bonjour ${data.visitorName},</p>
          
          <p>Votre rendez-vous avec <strong>${data.exhibitorName}</strong> est maintenant <span style="color: ${statusColor[data.status]}; font-weight: bold;">${statusLabels[data.status].toLowerCase()}</span>.</p>
          
          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> ${data.date}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Heure:</strong> ${data.time}</p>
            <p style="margin: 0;"><strong>💼 Exposant:</strong> ${data.exhibitorName}</p>
          </div>
          
          ${data.status === 'confirmed' ? `
            <p>Nous vous enverrons un rappel 24 heures avant votre rendez-vous.</p>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/dashboard/appointments" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Voir mes rendez-vous</a>
          </div>
          
          <p style="margin-top: 30px;">À bientôt,<br><strong>L'équipe SIPORT 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">SIPORT 2026 - Salon International des Ports</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: data.visitorEmail,
      subject: `Rendez-vous ${statusLabels[data.status]} avec ${data.exhibitorName}`,
      html,
      replyTo: data.exhibitorEmail,
    });
  }

  /**
   * Send appointment reminder (24h before)
   */
  static async sendAppointmentReminder(data: AppointmentEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIPORT 2026</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #111827;">⏰ Rappel de rendez-vous demain !</h2>
          
          <p>Bonjour ${data.visitorName},</p>
          
          <p>Ceci est un rappel que vous avez un rendez-vous demain avec <strong>${data.exhibitorName}</strong>.</p>
          
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> ${data.date}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Heure:</strong> ${data.time}</p>
            <p style="margin: 0;"><strong>💼 Exposant:</strong> ${data.exhibitorName}</p>
          </div>
          
          <p>Préparez-vous pour cette rencontre importante !</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/dashboard/appointments" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Voir mes rendez-vous</a>
          </div>
          
          <p style="margin-top: 30px;">À bientôt,<br><strong>L'équipe SIPORT 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">SIPORT 2026 - Salon International des Ports</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: data.visitorEmail,
      subject: `⏰ Rappel: Rendez-vous demain à ${data.time} avec ${data.exhibitorName}`,
      html,
    });
  }

  /**
   * Send appointment rejection email
   */
  static async sendAppointmentRejection(data: AppointmentEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIPORT 2026</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #ef4444;">❌ Rendez-vous refusé</h2>
          
          <p>Bonjour ${data.visitorName},</p>
          
          <p>Malheureusement, votre demande de rendez-vous avec <strong>${data.exhibitorName}</strong> a été refusée.</p>
          
          <div style="background: #FEE2E2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Date demandée:</strong> ${data.date}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Heure demandée:</strong> ${data.time}</p>
            <p style="margin: 0;"><strong>💼 Exposant:</strong> ${data.exhibitorName}</p>
          </div>
          
          <p>Vous pouvez proposer un autre créneau auprès de cet exposant.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/exhibitors/${data.exhibitorName.replace(/\s+/g, '-')}" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Proposer un autre créneau</a>
          </div>
          
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe SIPORT 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">SIPORT 2026 - Salon International des Ports</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: data.visitorEmail,
      subject: `Rendez-vous refusé - ${data.exhibitorName}`,
      html,
    });
  }

  /**
   * Send exhibitor appointment notification
   */
  static async sendExhibitorNotification(data: AppointmentEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIPORT 2026</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #111827;">📅 Nouvelle demande de rendez-vous</h2>
          
          <p>Bonjour,</p>
          
          <p><strong>${data.visitorName}</strong> a demandé un rendez-vous avec vous.</p>
          
          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>👤 Visiteur:</strong> ${data.visitorName}</p>
            <p style="margin: 0 0 10px 0;"><strong>📅 Date demandée:</strong> ${data.date}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Heure demandée:</strong> ${data.time}</p>
            <p style="margin: 0;"><strong>📧 Email:</strong> ${data.visitorEmail}</p>
          </div>
          
          <p>Vous pouvez confirmer ou refuser cette demande depuis votre tableau de bord.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/dashboard/appointments" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Gérer mes demandes</a>
          </div>
          
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe SIPORT 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">SIPORT 2026 - Salon International des Ports</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: data.exhibitorEmail,
      subject: `Nouvelle demande de rendez-vous de ${data.visitorName}`,
      html,
    });
  }
}

export default EmailService;
