import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  email: string
  name: string
  level: 'free' | 'vip'
  userId: string
}

/**
 * Template email pour visiteur GRATUIT
 */
function getFreeVisitorEmailHTML(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue à SIPORTS 2026</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bienvenue à SIPORTS 2026</h1>
    <p style="color: #e8f5e9; margin: 10px 0 0 0; font-size: 16px;">Pass Gratuit confirmé</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Bonjour <strong>${name}</strong>,</p>

    <p style="font-size: 16px;">
      Félicitations ! Votre inscription gratuite au <strong>Salon International des Ports et de la Logistique Maritime (SIPORTS) 2026</strong> a été confirmée avec succès.
    </p>

    <div style="background: white; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #16a34a;">✅ Votre Pass Gratuit inclut :</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Accès au salon SIPORTS 2026</li>
        <li>Badge QR sécurisé d'entrée</li>
        <li>Accès aux zones publiques et hall d'exposition</li>
        <li>Participation aux conférences publiques</li>
      </ul>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #d97706;">📅 Informations du salon</h3>
      <p style="margin: 5px 0;"><strong>Dates :</strong> 15-18 Avril 2026</p>
      <p style="margin: 5px 0;"><strong>Lieu :</strong> Parc des Expositions de Casablanca, Maroc</p>
      <p style="margin: 5px 0;"><strong>Horaires :</strong> 9h00 - 18h00</p>
    </div>

    <div style="background: white; border: 2px dashed #22c55e; padding: 20px; margin: 25px 0; border-radius: 5px; text-align: center;">
      <h3 style="margin-top: 0; color: #16a34a;">🎫 Votre Badge</h3>
      <p style="margin: 10px 0;">
        Votre badge QR sera disponible dans votre espace personnel.<br>
        Connectez-vous sur <a href="${Deno.env.get('PUBLIC_SITE_URL') || 'https://siports2026.com'}/badge" style="color: #16a34a; text-decoration: none; font-weight: bold;">siports2026.com/badge</a>
      </p>
      <p style="font-size: 14px; color: #666; margin: 10px 0;">
        Présentez ce badge QR à l'entrée du salon pour accéder à l'événement.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #d97706;">👑 Envie d'une expérience premium ?</h3>
      <p style="margin: 10px 0;">
        Passez au <strong>Pass VIP Premium</strong> et profitez de :
      </p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Rendez-vous B2B ILLIMITÉS</strong> avec exposants et partenaires</li>
        <li>Accès zones VIP exclusives</li>
        <li>Badge sécurisé avec photo</li>
        <li>Gala de clôture premium</li>
        <li>Ateliers et networking area VIP</li>
      </ul>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${Deno.env.get('PUBLIC_SITE_URL') || 'https://siports2026.com'}/visitor/upgrade"
           style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Passer au VIP - 700 EUR
        </a>
      </div>
    </div>

    <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #0369a1;">📞 Besoin d'aide ?</h3>
      <p style="margin: 5px 0;">Email : <a href="mailto:contact@siports2026.com" style="color: #0ea5e9;">contact@siports2026.com</a></p>
      <p style="margin: 5px 0;">Téléphone : +212 5 22 XX XX XX</p>
      <p style="margin: 5px 0;">WhatsApp : +212 6 XX XX XX XX</p>
    </div>

    <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
      Nous avons hâte de vous accueillir au SIPORTS 2026 !<br>
      L'équipe SIPORTS
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© 2026 SIPORTS - Salon International des Ports et de la Logistique Maritime</p>
    <p>Parc des Expositions, Casablanca, Maroc</p>
  </div>
</body>
</html>
  `
}

/**
 * Template email pour visiteur VIP
 */
function getVIPVisitorEmailHTML(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compte VIP créé - Paiement requis</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">👑 Compte VIP Premium Créé</h1>
    <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Finalisez votre paiement pour activer votre accès</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Bonjour <strong>${name}</strong>,</p>

    <p style="font-size: 16px;">
      Votre compte <strong>Pass VIP Premium</strong> pour SIPORTS 2026 a été créé avec succès ! 🎉
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #d97706;">⚠️ Action requise : Finaliser le paiement</h3>
      <p style="margin: 10px 0;">
        Pour activer votre accès VIP et profiter de tous les avantages premium, veuillez finaliser le paiement de <strong>700 EUR</strong>.
      </p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${Deno.env.get('PUBLIC_SITE_URL') || 'https://siports2026.com'}/visitor/subscription"
           style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          💳 Finaliser le paiement
        </a>
      </div>
    </div>

    <div style="background: white; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #16a34a;">✨ Votre Pass VIP Premium inclut :</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Rendez-vous B2B ILLIMITÉS</strong> - Planifiez autant de meetings que souhaité</li>
        <li><strong>Badge ultra-sécurisé avec photo</strong> - QR code JWT rotatif</li>
        <li><strong>Accès zones VIP</strong> - Salons premium et networking area</li>
        <li><strong>Gala de clôture exclusif</strong> - Événement réseau premium</li>
        <li><strong>Ateliers et conférences VIP</strong> - Contenus exclusifs</li>
        <li><strong>Tableau de bord complet</strong> - Gestion rendez-vous et networking</li>
        <li><strong>Support prioritaire</strong> - Assistance dédiée</li>
      </ul>
    </div>

    <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #0369a1;">📅 Informations du salon</h3>
      <p style="margin: 5px 0;"><strong>Dates :</strong> 15-18 Avril 2026</p>
      <p style="margin: 5px 0;"><strong>Lieu :</strong> Parc des Expositions de Casablanca, Maroc</p>
      <p style="margin: 5px 0;"><strong>Horaires :</strong> 9h00 - 18h00</p>
    </div>

    <div style="background: white; border: 2px dashed #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #d97706;">💳 Modes de paiement acceptés</h3>
      <p style="margin: 10px 0; text-align: center;">
        <strong>Carte bancaire (Visa, Mastercard)</strong> • <strong>PayPal</strong> • <strong>Virement CMI Maroc</strong>
      </p>
      <p style="font-size: 14px; color: #666; margin: 10px 0; text-align: center;">
        Paiement sécurisé SSL - Vos données sont protégées
      </p>
    </div>

    <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #dc2626;">🚫 Important</h3>
      <p style="margin: 10px 0;">
        Votre compte VIP ne sera <strong>activé qu'après validation du paiement</strong>. Vous ne pourrez pas vous connecter au tableau de bord tant que le paiement n'est pas finalisé.
      </p>
      <p style="margin: 10px 0;">
        Une fois le paiement validé, vous recevrez immédiatement :
      </p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Email de confirmation avec badge VIP (avec votre photo)</li>
        <li>Accès complet au tableau de bord</li>
        <li>Instructions pour planifier vos rendez-vous B2B</li>
      </ul>
    </div>

    <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #0369a1;">📞 Besoin d'aide ?</h3>
      <p style="margin: 5px 0;">Email : <a href="mailto:vip@siports2026.com" style="color: #0ea5e9;">vip@siports2026.com</a></p>
      <p style="margin: 5px 0;">Téléphone : +212 5 22 XX XX XX</p>
      <p style="margin: 5px 0;">WhatsApp : +212 6 XX XX XX XX</p>
      <p style="margin: 10px 0; font-size: 14px; color: #666;">
        Notre équipe VIP est à votre disposition pour toute question concernant votre inscription ou le paiement.
      </p>
    </div>

    <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
      Merci d'avoir choisi le Pass VIP Premium !<br>
      L'équipe SIPORTS
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© 2026 SIPORTS - Salon International des Ports et de la Logistique Maritime</p>
    <p>Parc des Expositions, Casablanca, Maroc</p>
  </div>
</body>
</html>
  `
}

/**
 * Version texte simple (fallback)
 */
function getFreeVisitorEmailText(name: string): string {
  return `
Bonjour ${name},

Félicitations ! Votre inscription gratuite au Salon International des Ports et de la Logistique Maritime (SIPORTS) 2026 a été confirmée avec succès.

VOTRE PASS GRATUIT INCLUT :
- Accès au salon SIPORTS 2026
- Badge QR sécurisé d'entrée
- Accès aux zones publiques et hall d'exposition
- Participation aux conférences publiques

INFORMATIONS DU SALON :
Dates : 15-18 Avril 2026
Lieu : Parc des Expositions de Casablanca, Maroc
Horaires : 9h00 - 18h00

VOTRE BADGE :
Votre badge QR sera disponible dans votre espace personnel.
Connectez-vous sur ${Deno.env.get('PUBLIC_SITE_URL') || 'https://siports2026.com'}/badge

BESOIN D'AIDE ?
Email : contact@siports2026.com
Téléphone : +212 5 22 XX XX XX

Nous avons hâte de vous accueillir au SIPORTS 2026 !
L'équipe SIPORTS
  `
}

function getVIPVisitorEmailText(name: string): string {
  return `
Bonjour ${name},

Votre compte Pass VIP Premium pour SIPORTS 2026 a été créé avec succès !

ACTION REQUISE : FINALISER LE PAIEMENT
Pour activer votre accès VIP, veuillez finaliser le paiement de 700 EUR sur :
${Deno.env.get('PUBLIC_SITE_URL') || 'https://siports2026.com'}/visitor/subscription

VOTRE PASS VIP PREMIUM INCLUT :
- Rendez-vous B2B ILLIMITÉS
- Badge ultra-sécurisé avec photo
- Accès zones VIP
- Gala de clôture exclusif
- Ateliers et conférences VIP
- Tableau de bord complet
- Support prioritaire

INFORMATIONS DU SALON :
Dates : 15-18 Avril 2026
Lieu : Parc des Expositions de Casablanca, Maroc
Horaires : 9h00 - 18h00

IMPORTANT :
Votre compte ne sera activé qu'après validation du paiement. Vous recevrez un email de confirmation avec votre badge VIP une fois le paiement finalisé.

BESOIN D'AIDE ?
Email : vip@siports2026.com
Téléphone : +212 5 22 XX XX XX

Merci d'avoir choisi le Pass VIP Premium !
L'équipe SIPORTS
  `
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, level, userId }: EmailRequest = await req.json()

    // Validation
    if (!email || !name || !level || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Préparer le contenu de l'email selon le niveau
    const subject = level === 'free'
      ? '🎉 Bienvenue à SIPORTS 2026 - Pass Gratuit Confirmé'
      : '👑 Compte VIP créé - Finaliser le paiement - SIPORTS 2026'

    const htmlContent = level === 'free'
      ? getFreeVisitorEmailHTML(name)
      : getVIPVisitorEmailHTML(name)

    const textContent = level === 'free'
      ? getFreeVisitorEmailText(name)
      : getVIPVisitorEmailText(name)

    // Utiliser Resend pour envoyer l'email (nécessite RESEND_API_KEY en variable d'environnement)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured - email not sent')
      // En dev, on simule le succès
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email skipped (no RESEND_API_KEY configured)',
          preview: { subject, to: email }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Envoyer via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SIPORTS 2026 <noreply@siports2026.com>',
        to: email,
        subject: subject,
        html: htmlContent,
        text: textContent,
        tags: [
          { name: 'type', value: 'visitor_welcome' },
          { name: 'level', value: level },
          { name: 'userId', value: userId }
        ]
      })
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
    }

    console.log(`Welcome email sent to ${email} (${level}) - ID: ${resendData.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email envoyé avec succès à ${email}`,
        emailId: resendData.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
