import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentInstructionRequest {
  email: string;
  name: string;
  companyName: string;
  subscriptionLevel: string;
  standArea: number;
  amount: number;
  paymentReference: string;
  userId: string;
}

/**
 * Template HTML pour l'email d'instructions de paiement exposant
 */
function getPaymentInstructionHTML(data: PaymentInstructionRequest): string {
  const {
    name,
    companyName,
    subscriptionLevel,
    standArea,
    amount,
    paymentReference
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 3px solid #2563EB;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #2563EB;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #6B7280;
      font-size: 14px;
    }
    .content {
      padding: 30px 0;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 20px;
    }
    .subscription-box {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      margin: 25px 0;
    }
    .subscription-box h3 {
      margin-top: 0;
      font-size: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.3);
      padding-bottom: 10px;
    }
    .subscription-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .detail-item {
      background: rgba(255,255,255,0.1);
      padding: 12px;
      border-radius: 6px;
    }
    .detail-label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 18px;
      font-weight: 600;
    }
    .payment-box {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .payment-box h3 {
      color: #92400E;
      margin-top: 0;
      font-size: 18px;
    }
    .bank-details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .bank-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .bank-row:last-child {
      border-bottom: none;
    }
    .bank-label {
      font-weight: 600;
      color: #374151;
    }
    .bank-value {
      color: #1F2937;
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }
    .reference-highlight {
      background-color: #DBEAFE;
      color: #1E40AF;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      font-size: 16px;
      font-weight: bold;
      border: 2px dashed #3B82F6;
    }
    .warning-box {
      background-color: #FEE2E2;
      border-left: 4px solid #DC2626;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .warning-box p {
      color: #7F1D1D;
      margin: 8px 0;
      font-size: 14px;
    }
    .steps {
      margin: 25px 0;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .step-number {
      background-color: #2563EB;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
      margin-right: 15px;
    }
    .step-content h4 {
      margin: 0 0 8px 0;
      color: #1F2937;
      font-size: 16px;
    }
    .step-content p {
      margin: 0;
      color: #6B7280;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 13px;
    }
    .contact-info {
      background-color: #F3F4F6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .contact-info h4 {
      margin-top: 0;
      color: #1F2937;
    }
    .contact-item {
      margin: 10px 0;
      color: #374151;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563EB;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px;
      }
      .subscription-details {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">⚓ SIPORTS 2026</div>
      <p class="subtitle">Salon International des Ports & Services Maritimes</p>
      <p class="subtitle">5-7 Février 2026 • Casablanca, Maroc</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Bonjour ${name},</p>

      <p style="font-size: 16px; color: #374151;">
        Félicitations ! 🎉 Votre inscription en tant qu'<strong>exposant SIPORTS 2026</strong> a été créée avec succès pour <strong>${companyName}</strong>.
      </p>

      <!-- Subscription Details -->
      <div class="subscription-box">
        <h3>📦 Votre Abonnement</h3>
        <div class="subscription-details">
          <div class="detail-item">
            <div class="detail-label">Niveau</div>
            <div class="detail-value">${subscriptionLevel}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Surface</div>
            <div class="detail-value">${standArea}m²</div>
          </div>
          <div class="detail-item" style="grid-column: 1 / -1;">
            <div class="detail-label">Montant Total</div>
            <div class="detail-value" style="font-size: 28px;">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <!-- Payment Instructions -->
      <div class="payment-box">
        <h3>💰 Instructions de Paiement</h3>
        <p style="color: #78350F; margin-bottom: 15px;">
          Pour activer votre compte exposant, veuillez effectuer un virement bancaire avec les coordonnées suivantes :
        </p>

        <div class="bank-details">
          <div class="bank-row">
            <span class="bank-label">Bénéficiaire :</span>
            <span class="bank-value">SIPORTS SARL</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">Banque :</span>
            <span class="bank-value">Banque Populaire du Maroc</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">IBAN :</span>
            <span class="bank-value">MA64 0001 1000 1234 5678 9012 34</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">SWIFT/BIC :</span>
            <span class="bank-value">BCPOMAMC</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">Montant :</span>
            <span class="bank-value" style="color: #DC2626; font-size: 18px; font-weight: bold;">
              $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </span>
          </div>
        </div>

        <div class="reference-highlight">
          <div style="font-size: 12px; margin-bottom: 5px; opacity: 0.8;">Référence obligatoire :</div>
          <div style="font-size: 20px; letter-spacing: 1px;">${paymentReference}</div>
        </div>

        <div class="warning-box">
          <p style="margin-top: 0;"><strong>⚠️ IMPORTANT :</strong></p>
          <p>• La référence <strong>${paymentReference}</strong> est <strong>OBLIGATOIRE</strong> dans le libellé du virement</p>
          <p>• Sans cette référence, votre paiement ne pourra pas être traité automatiquement</p>
          <p>• Conservez votre preuve de virement</p>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="steps">
        <h3 style="color: #1F2937; font-size: 18px;">📋 Prochaines Étapes</h3>

        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Effectuer le virement bancaire</h4>
            <p>Utilisez les coordonnées ci-dessus et n'oubliez pas d'inclure la référence ${paymentReference}</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Envoyez-nous la preuve de paiement</h4>
            <p>Envoyez votre reçu bancaire à <strong>paiements@siports.com</strong> pour accélérer le traitement</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Validation par notre équipe</h4>
            <p>Nous validerons votre paiement sous 1-2 jours ouvrables et activerons votre compte</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>Accès au tableau de bord</h4>
            <p>Vous recevrez un email de confirmation et pourrez accéder à votre espace exposant</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h4>Création de votre mini-site</h4>
            <p>Notre système vous aidera à créer automatiquement votre mini-site exposant</p>
          </div>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="contact-info">
        <h4>💬 Besoin d'aide ?</h4>
        <div class="contact-item">
          <strong>Email :</strong> <a href="mailto:support@siports.com">support@siports.com</a>
        </div>
        <div class="contact-item">
          <strong>Téléphone :</strong> +212 5 22 XX XX XX
        </div>
        <div class="contact-item">
          <strong>WhatsApp :</strong> +212 6 XX XX XX XX
        </div>
        <div class="contact-item">
          <strong>Horaires :</strong> Lun-Ven 9h-18h (GMT+1)
        </div>
      </div>

      <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
        Nous sommes impatients de vous accueillir au salon SIPORTS 2026 ! 🚢
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 10px;">
        <strong>SIPORTS 2026</strong> - Salon International des Ports & Services Maritimes
      </p>
      <p style="margin: 5px 0;">
        5-7 Février 2026 • Mohammed VI Exhibition Center • Casablanca, Maroc
      </p>
      <p style="margin: 5px 0; font-size: 12px;">
        © 2024 SIPORTS. Tous droits réservés.
      </p>
      <p style="margin-top: 15px; font-size: 11px; color: #9CA3AF;">
        Vous recevez cet email car vous vous êtes inscrit en tant qu'exposant pour SIPORTS 2026.
        <br>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter immédiatement.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: PaymentInstructionRequest = await req.json();

    const {
      email,
      name,
      companyName,
      subscriptionLevel,
      standArea,
      amount,
      paymentReference,
      userId
    } = requestData;

    // Validation
    if (!email || !name || !companyName || !subscriptionLevel || !standArea || !amount || !paymentReference) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes pour l\'envoi de l\'email' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Générer le contenu HTML
    const htmlContent = getPaymentInstructionHTML(requestData);

    // Envoyer l'email via Resend
    if (!RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured');
      // En développement, continuer sans erreur
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email skipped (RESEND_API_KEY not configured)',
          dev_mode: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const emailPayload = {
      from: 'SIPORTS 2026 <noreply@siports.com>',
      to: [email],
      subject: `💰 Instructions de Paiement - Abonnement Exposant SIPORTS 2026`,
      html: htmlContent,
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('Resend API error:', errorData);
      throw new Error(`Resend API error: ${resendResponse.status}`);
    }

    const emailData = await resendResponse.json();

    console.log(`✅ Email de paiement envoyé à ${email} (${companyName}) - Ref: ${paymentReference}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de paiement envoyé avec succès',
        email_id: emailData.id,
        paymentReference
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-exhibitor-payment-instructions:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi de l\'email'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
