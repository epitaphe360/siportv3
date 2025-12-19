# 🧪 GUIDE TESTS PRATIQUES - WORKFLOWS VISITEUR

**Date:** 19 Décembre 2025  
**Objectif:** Valider les workflows en local et en production

---

## 🔧 SETUP LOCAL

### Prérequis
```bash
# Backend
npm install
npm run build
node server.js  # Port 3000

# Frontend (autre terminal)
npm run dev  # Port 5173

# Supabase (déjà en place)
✅ Authenticated users
✅ Digital badges table
✅ Edge functions deployed
```

### Vérifier Setup
```bash
# 1. Frontend accessible
curl http://localhost:5173

# 2. Backend accessible
curl http://localhost:3000

# 3. Routes correctes
Navigate to: http://localhost:5173/visitor/register
Expected: Choice page (FREE vs VIP)
```

---

## 📝 TEST #1: INSCRIPTION VISITEUR GRATUIT

### Étape 1: Naviguer vers la page
```
URL: http://localhost:5173/visitor/register
Expected: Choice page avec deux boutons
  - "S'inscrire gratuitement" → GREEN
  - "Passer au VIP" → GOLD/PURPLE
```

### Étape 2: Cliquer "S'inscrire gratuitement"
```
Expected: Redirect to /visitor/register/free
Form visible with fields:
  ✅ Prénom (required)
  ✅ Nom (required)
  ✅ Email (required, email format)
  ✅ Téléphone (required, 8+ chars)
  ✅ Pays (dropdown, required)
  ✅ Secteur (dropdown, required)
  ✅ Position (optional)
  ✅ Entreprise (optional)
```

### Étape 3: Remplir le formulaire
```
Prénom: Jean
Nom: Dupont
Email: jean.dupont@example.com
Téléphone: +33612345678
Pays: France
Secteur: Transport Maritime
Position: Manager
Entreprise: Maersk

Click: "S'inscrire"
```

### Étape 4: Vérifier Supabase Auth
```sql
SELECT id, email, created_at FROM auth.users 
WHERE email = 'jean.dupont@example.com'
ORDER BY created_at DESC LIMIT 1;

Expected: ✅ Row created
```

### Étape 5: Vérifier Users table
```sql
SELECT id, email, visitor_level, status, type FROM users 
WHERE email = 'jean.dupont@example.com'
ORDER BY created_at DESC LIMIT 1;

Expected: 
✅ visitor_level = 'free'
✅ status = 'pending'
✅ type = 'visitor'
```

### Étape 6: Vérifier Digital Badges
```sql
SELECT id, badge_type, is_active FROM digital_badges 
WHERE user_id = '[user-id-from-above]';

Expected:
✅ badge_type = 'visitor_free'
✅ is_active = true
✅ qr_data contains JWT token
```

### Étape 7: Vérifier Email
```
⏱️ Wait 1-2 minutes

Check inbox: jean.dupont@example.com

Expected email:
✅ From: noreply@siports2026.com
✅ Subject: 🎉 Bienvenue à SIPORTS 2026 - Pass Gratuit Confirmé
✅ Contains: Badge QR link
✅ Contains: CTA "Passer au VIP"
✅ Contains: Salon details (dates, lieu, horaires)
```

### Étape 8: Vérifier Redirect & Session
```
Browser console should show:
✅ Redirect to HOME after 3 seconds
✅ Session cleared (no auth user)
✅ Message: "Vérifiez votre email..."

Try to access: /visitor/dashboard
Expected: Redirect to /login (not authenticated)
```

### Résumé Test #1
- ✅ Form validation works
- ✅ Auth created with temp password
- ✅ User inserted with correct level/status
- ✅ Badge generated automatically
- ✅ Email sent with correct template
- ✅ Session cleared
- ✅ Redirect to home

**Status:** 🟢 PASS if all checkmarks

---

## 💳 TEST #2: INSCRIPTION VISITEUR VIP (Avant paiement)

### Étape 1: Naviguer vers la page
```
URL: http://localhost:5173/visitor/register
Click: "Passer au VIP" (GOLD/PURPLE button)
Expected: Redirect to /visitor/register/vip
```

### Étape 2: Vérifier formulaire VIP
```
Expected form fields:
  ✅ Prénom (required)
  ✅ Nom (required)
  ✅ Email (required)
  ✅ Mot de passe (required, 8+, maj/min/chiffre)
  ✅ Confirmer mot de passe (must match)
  ✅ Téléphone (required)
  ✅ Pays (dropdown)
  ✅ Secteur (dropdown)
  ✅ Position (required) ← VIP only
  ✅ Entreprise (required) ← VIP only
  ✅ Photo (file input, required) ← VIP only

Additional UI:
  ✅ Crown icon header
  ✅ Purple/Gold gradient background
  ✅ Photo preview area
  ✅ Price: 700 EUR mentioned
```

### Étape 3: Remplir le formulaire
```
Prénom: Marie
Nom: Martin
Email: marie.martin@example.com
Mot de passe: SecurePass123
Confirmer mot de passe: SecurePass123
Téléphone: +33698765432
Pays: France
Secteur: Autorité Portuaire
Position: Directeur Général
Entreprise: Port de Marseille
Photo: [select test image, max 5MB]

Verify:
  ✅ Photo preview shows selected image
  ✅ Password strength indicator green
  ✅ Confirm password matches
  ✅ All fields filled

Click: "S'inscrire VIP"
```

### Étape 4: Vérifier Supabase Auth
```sql
SELECT id, email, created_at FROM auth.users 
WHERE email = 'marie.martin@example.com'
ORDER BY created_at DESC LIMIT 1;

Expected: ✅ Row created with REAL password (not temp)
```

### Étape 5: Vérifier Users table
```sql
SELECT id, email, visitor_level, status, type 
FROM users 
WHERE email = 'marie.martin@example.com'
ORDER BY created_at DESC LIMIT 1;

Expected:
✅ visitor_level = 'vip'
✅ status = 'pending_payment' (LOCKED 🔴)
✅ type = 'visitor'
✅ profile.photoUrl contains URL
```

### Étape 6: Vérifier Supabase Storage
```
Check bucket: 'public'
Check path: 'visitor-photos/'

Expected:
✅ File uploaded
✅ Name: [timestamp]-[random].ext
✅ Accessible via public URL
✅ Size: <5MB
```

### Étape 7: Vérifier Payment Request
```sql
SELECT id, user_id, amount, status FROM payment_requests 
WHERE user_id = '[user-id-from-above]'
ORDER BY created_at DESC LIMIT 1;

Expected:
✅ amount = 299.99
✅ status = 'pending'
✅ payment_method = NULL
```

### Étape 8: Vérifier Email
```
⏱️ Wait 1-2 minutes

Check inbox: marie.martin@example.com

Expected email:
✅ From: noreply@siports2026.com
✅ Subject: 👑 Compte VIP Premium Créé - Finaliser le paiement - SIPORTS 2026
✅ Contains: "Finaliser le paiement"
✅ Contains: "700 EUR"
✅ Contains: Payment button/link
✅ Contains: VIP benefits list
✅ ⚠️ "Accès activé après paiement"
```

### Étape 9: Vérifier Redirect
```
Browser expected:
✅ Redirect to /visitor/subscription
✅ State passed: { userId, email, name, fromRegistration: true }

Try to login:
  Email: marie.martin@example.com
  Password: SecurePass123
Expected: ❌ ERROR "Compte non activé" (status != 'active')
```

### Résumé Test #2
- ✅ Photo upload works
- ✅ Auth created with REAL password
- ✅ User inserted with VIP level
- ✅ Status = 'pending_payment' (LOCKED)
- ✅ Payment request created (299.99)
- ✅ Email sent with payment instructions
- ✅ Can't login yet (not active)

**Status:** 🟢 PASS if all checkmarks

---

## 💰 TEST #3: PAIEMENT STRIPE & WEBHOOK

### Prérequis
```
✅ Stripe test mode enabled
✅ Webhook secret configured
✅ Environment variables set
✅ Edge functions deployed
```

### Étape 1: Naviguer vers page paiement
```
URL: http://localhost:5173/visitor/subscription
Expected:
✅ Stripe checkout form visible
✅ Amount: 299.99
✅ Email: marie.martin@example.com (from previous test)
```

### Étape 2: Remplir formulaire Stripe
```
Card: 4242 4242 4242 4242 (Success in test mode)
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
Name: Marie Martin

Click: "Pay" / "Payer"

Expected:
✅ Processing spinner shows
✅ "Payment succeeded" or similar
✅ Redirect after 2-3 seconds
```

### Étape 3: Vérifier Webhook Stripe
```
Option A: Stripe Dashboard
  URL: https://dashboard.stripe.com/test/events
  Filter: "checkout.session.completed"
  Expected: ✅ Event received and processed (200 OK)

Option B: Railway Logs
  Check logs for stripe-webhook function
  Expected lines:
  ✅ "📥 Webhook Stripe reçu: checkout.session.completed"
  ✅ "✅ Paiement réussi pour session: cs_test_..."
  ✅ "📌 Appel generate-visitor-badge..."
  ✅ "✅ Badge généré avec succès"
  ✅ "📧 Envoi email de confirmation..."
  ✅ "✅ Email de confirmation envoyé"
  ✅ "🔄 Activation du compte utilisateur..."
  ✅ "✅ Compte utilisateur activé"
```

### Étape 4: Vérifier Database - Badge
```sql
SELECT id, user_id, badge_type, photo_url FROM digital_badges 
WHERE user_id = '[marie-user-id]'
ORDER BY created_at DESC LIMIT 1;

Expected:
✅ badge_type = 'visitor_premium'
✅ photo_url = URL to Marie's photo
✅ current_token contains JWT
✅ is_active = true
```

### Étape 5: Vérifier Database - User Status
```sql
SELECT email, visitor_level, status FROM users 
WHERE email = 'marie.martin@example.com';

Expected:
✅ visitor_level = 'vip' (unchanged)
✅ status = 'active' (CHANGED from pending_payment!)
```

### Étape 6: Vérifier Email Confirmation
```
⏱️ Wait 1-2 minutes

Check inbox: marie.martin@example.com

Expected NEW email:
✅ From: noreply@siports2026.com
✅ Subject: Something like "Paiement confirmé - Badge VIP"
✅ Contains: "✅ Paiement reçu avec succès"
✅ Contains: "Badge VIP généré avec votre photo"
✅ Contains: "Accès immédiat tableau de bord"
✅ Contains: Badge/QR link
✅ Contains: Dashboard link
```

### Étape 7: Vérifier Login Maintenant Possible
```
URL: http://localhost:5173/login

Email: marie.martin@example.com
Password: SecurePass123

Click: "Se connecter"

Expected:
✅ Login success ✅
✅ Redirect to /visitor/dashboard
✅ Dashboard loads with:
  - Badge visible (with photo)
  - Profile info
  - B2B appointments area
  - VIP status indicator
```

### Étape 8: Vérifier Badge Page
```
URL: http://localhost:5173/badge

Expected:
✅ Badge displays with:
  - QR code (scannable)
  - User photo (Marie's uploaded photo!)
  - Badge type: "VIP Premium"
  - User name: "Marie Martin"
  - Zones: Includes VIP lounge + networking
```

### Résumé Test #3
- ✅ Stripe payment processed
- ✅ Webhook triggered and succeeded
- ✅ Badge generated with photo
- ✅ Email confirmation sent
- ✅ User status changed to 'active'
- ✅ Login now possible
- ✅ Dashboard accessible
- ✅ Badge with photo visible

**Status:** 🟢 PASS if all checkmarks

---

## ❌ TEST #4: EDGE CASES & ERRORS

### Test 4A: Form Validation
```
Test case: Submit empty form
Expected: ❌ Form validation errors shown
✅ "Prénom requis"
✅ "Nom requis"
✅ "Email invalide"
✅ "Téléphone requis"
Etc.

Test case: Invalid email
Input: "notanemail"
Expected: ❌ "Email invalide"

Test case: Weak password (VIP only)
Input: "weak"
Expected: ❌ "Minimum 8 caractères"
Input: "NoNumbers"
Expected: ❌ "Doit contenir majuscule, minuscule et chiffre"

Test case: Mismatched passwords
Input: "Pass123" vs "Pass124"
Expected: ❌ "Les mots de passe ne correspondent pas"

Test case: Photo too large (VIP only)
Upload: >5MB file
Expected: ❌ "La photo ne doit pas dépasser 5MB"

Test case: Wrong file type
Upload: .txt file
Expected: ❌ "Veuillez sélectionner une image"
```

### Test 4B: Stripe Card Errors
```
Test card: 4000 0000 0000 0002 (Decline)
Expected: ❌ "Your card was declined"
No webhook triggered
No user status change

Test card: 4000 0025 0000 3155 (Auth required)
Expected: ❌ "Your card requires authentication"
May require 3D Secure
```

### Test 4C: Double Payment
```
First payment: 4242... → Success ✅
User status: 'active'

Second payment: Try same user again
Expected: ❌ Error or validation
(Webhook should handle idempotency)
```

### Test 4D: Webhook Failure
```
Simulate webhook error:
  - Manually create payment_request
  - Don't create user with status='pending_payment'
  - Trigger webhook
Expected: ❌ Error logged, user not activated

Retry:
  - Fix prerequisite
  - Trigger webhook again
Expected: ✅ Success (idempotency)
```

---

## 📊 TEST #5: LOAD & PERFORMANCE

### Setup
```bash
# Install artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << 'EOF'
config:
  target: 'http://localhost:5173'
  phases:
    - duration: 60
      arrivalRate: 5
      name: 'Ramp up'
scenarios:
  - name: 'Free Registration Flow'
    flow:
      - get:
          url: '/visitor/register'
      - get:
          url: '/visitor/register/free'
      - post:
          url: '/api/register'
          json:
            firstName: 'Test'
            lastName: 'User'
            email: 'test{{ $randomNumber(1, 10000) }}@example.com'
            phone: '+33600000000'
            country: 'France'
            sector: 'Tech'
EOF

# Run test
artillery run load-test.yml
```

### Metrics to Check
```
Response time:
  ✅ p95 < 1000ms
  ✅ p99 < 2000ms
  ✅ mean < 500ms

Success rate:
  ✅ > 99% (only expected validation failures)

Errors:
  ✅ None (except known validation errors)

Database:
  ✅ No locks or timeouts
  ✅ Supabase connection pool OK
```

---

## 📋 CHECKLIST FINAL

### Avant Production
- [ ] Test #1 FREE Registration - PASS ✅
- [ ] Test #2 VIP Registration (pre-payment) - PASS ✅
- [ ] Test #3 Payment + Webhook - PASS ✅
- [ ] Test #4 Edge Cases - PASS ✅
- [ ] Test #5 Load Test - PASS ✅
- [ ] Email delivery verified
- [ ] Database consistency verified
- [ ] Logs reviewed (no errors)
- [ ] Build successful (npm run build)
- [ ] No console errors

### Production Deployment
- [ ] Deploy to Railway
- [ ] Verify all env vars
- [ ] Verify webhooks configured
- [ ] Run full test suite again
- [ ] Monitor logs for 24h
- [ ] Check metrics dashboard

---

## 🆘 TROUBLESHOOTING

### Webhook not triggering
```
1. Verify Stripe test mode is ON
2. Check webhook URL in Stripe dashboard
3. Check STRIPE_WEBHOOK_SECRET in env
4. Look for errors in Railway logs
5. Stripe CLI test: stripe trigger checkout.session.completed
```

### Email not received
```
1. Check Resend API key is set
2. Check from: address is configured
3. Look in spam folder
4. Check Resend dashboard for errors
5. Test with curl to Resend API
```

### Badge not generating
```
1. Check generate-visitor-badge function logs
2. Verify JWT_SECRET is set
3. Check digital_badges table exists
4. Verify user exists in users table
5. Check Supabase service role key is valid
```

### User can't login after payment
```
1. Verify status='active' in database
2. Try clearing browser cache
3. Check auth logs in Supabase
4. Try password reset
5. Check email for any auth issues
```

---

**Happy Testing! 🎉**

All tests should PASS before production deployment.
