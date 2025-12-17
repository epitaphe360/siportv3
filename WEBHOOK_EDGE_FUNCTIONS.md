# Payment Webhook Edge Functions

## Overview
This project includes three Supabase Edge Functions for handling payment webhooks from different payment providers:
- **Stripe** (Credit/Debit cards international)
- **PayPal** (PayPal accounts worldwide)
- **CMI Morocco** (Moroccan cards via CMI payment gateway)

## Edge Functions

### 1. Stripe Webhook (`stripe-webhook`)
**Location:** `supabase/functions/stripe-webhook/index.ts`

**Purpose:** Handles Stripe checkout session completion events

**Event Type:** `checkout.session.completed`

**Functionality:**
- ✅ Validates webhook signature using `STRIPE_WEBHOOK_SECRET`
- ✅ Extracts userId and visitorLevel from session metadata
- ✅ Updates user's `visitor_level` in database
- ✅ Creates in-app notification for user
- ✅ Records transaction in `payment_transactions` table

**Required Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 2. PayPal Webhook (`paypal-webhook`)
**Location:** `supabase/functions/paypal-webhook/index.ts`

**Purpose:** Handles PayPal payment capture completion events

**Event Type:** `PAYMENT.CAPTURE.COMPLETED`

**Functionality:**
- ✅ Parses PayPal webhook event
- ✅ Extracts userId from `custom_id` field (format: "userId:visitorLevel")
- ✅ Updates user's `visitor_level` in database
- ✅ Creates in-app notification for user
- ✅ Records transaction in `payment_transactions` table

**Required Environment Variables:**
```bash
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 3. CMI Morocco Webhook (`cmi-webhook`)
**Location:** `supabase/functions/cmi-webhook/index.ts`

**Purpose:** Handles CMI payment gateway callbacks (Moroccan cards)

**Callback Method:** POST form-data

**Functionality:**
- ✅ Validates HASH signature using SHA512 for security
- ✅ Checks payment approval status (`response: "Approved"`, `ProcReturnCode: "00"`)
- ✅ Extracts userId and visitorLevel from custom fields
- ✅ Updates user's `visitor_level` in database
- ✅ Creates in-app notification for user
- ✅ Records transaction in `payment_transactions` table
- ✅ Returns `ACTION=POSTAUTH` for successful processing

**Required Environment Variables:**
```bash
CMI_STORE_KEY=xxxxx
CMI_CLIENT_ID=xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## Database Schema

### `payment_transactions` table (required)

```sql
CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe fields
  stripe_session_id text,
  stripe_payment_intent text,

  -- PayPal fields
  paypal_order_id text,
  paypal_capture_id text,

  -- CMI fields
  cmi_order_id text,
  cmi_transaction_id text,
  cmi_auth_code text,

  -- Common fields
  amount bigint NOT NULL,  -- Amount in smallest unit (cents/millimes)
  currency text NOT NULL,  -- 'usd', 'eur', 'mad'
  visitor_level text NOT NULL,  -- 'free', 'premium'
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'cmi')),
  error_message text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_payment_method ON payment_transactions(payment_method);
```

### `notifications` table (required)

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('system', 'payment', 'appointment', 'message')),
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

## Deployment

### 1. Deploy Edge Functions

```bash
# Deploy all payment webhooks
npx supabase functions deploy stripe-webhook
npx supabase functions deploy paypal-webhook
npx supabase functions deploy cmi-webhook

# Or deploy individually
npx supabase functions deploy stripe-webhook --project-ref your-project-ref
```

### 2. Set Environment Variables

```bash
# Via Supabase CLI
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
npx supabase secrets set PAYPAL_CLIENT_ID=xxxxx
npx supabase secrets set PAYPAL_CLIENT_SECRET=xxxxx
npx supabase secrets set CMI_STORE_KEY=xxxxx
npx supabase secrets set CMI_CLIENT_ID=xxxxx

# Or via Supabase Dashboard → Edge Functions → Secrets
```

### 3. Get Edge Function URLs

After deployment, your Edge Function URLs will be:
```
Stripe:  https://xxxxx.supabase.co/functions/v1/stripe-webhook
PayPal:  https://xxxxx.supabase.co/functions/v1/paypal-webhook
CMI:     https://xxxxx.supabase.co/functions/v1/cmi-webhook
```

## Provider Configuration

### Stripe Webhook Setup

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://xxxxx.supabase.co/functions/v1/stripe-webhook`
4. Select events: `checkout.session.completed`
5. Copy the webhook signing secret (`whsec_xxxxx`)
6. Add to Supabase secrets: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

### PayPal Webhook Setup

1. Go to [PayPal Developer Dashboard → Applications](https://developer.paypal.com/dashboard/applications)
2. Select your app
3. Scroll to "Webhooks"
4. Click "Add Webhook"
5. Enter URL: `https://xxxxx.supabase.co/functions/v1/paypal-webhook`
6. Select event: `PAYMENT.CAPTURE.COMPLETED`
7. Save

### CMI Webhook Setup

1. Contact CMI technical support to configure callback URL
2. Provide URL: `https://xxxxx.supabase.co/functions/v1/cmi-webhook`
3. Configure callback method: POST
4. Request HASH validation enabled
5. Ensure custom fields `userId` and `visitorLevel` are passed

## Testing

### Test Stripe Webhook

```bash
# Using Stripe CLI
stripe listen --forward-to https://xxxxx.supabase.co/functions/v1/stripe-webhook
stripe trigger checkout.session.completed
```

### Test PayPal Webhook

Use PayPal Sandbox:
1. Complete a test payment in PayPal Sandbox
2. Check PayPal Developer Dashboard → Webhooks → Events
3. Verify webhook delivery

### Test CMI Webhook

Use CMI test environment:
1. Perform a test payment via CMI test gateway
2. Monitor Edge Function logs in Supabase Dashboard
3. Verify callback received with correct signature

## Monitoring

### View Edge Function Logs

```bash
# Via Supabase Dashboard
# Edge Functions → Select function → Logs

# Via CLI
npx supabase functions logs stripe-webhook
npx supabase functions logs paypal-webhook
npx supabase functions logs cmi-webhook
```

### Check Transaction Records

```sql
-- View all payment transactions
SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 10;

-- Check user upgrade status
SELECT id, email, visitor_level, updated_at
FROM users
WHERE visitor_level = 'premium'
ORDER BY updated_at DESC;

-- View notifications sent
SELECT * FROM notifications
WHERE type = 'system'
ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### Issue: Stripe webhook signature verification fails
**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret in Stripe Dashboard
- Ensure Stripe is sending to the correct URL
- Check Edge Function logs for detailed error messages

### Issue: PayPal webhook not receiving userId
**Solution:**
- Verify `custom_id` is set when creating PayPal order
- Format must be: `userId:visitorLevel`
- Check payment creation code in `paymentService.ts`

### Issue: CMI hash validation fails
**Solution:**
- Verify `CMI_STORE_KEY` is correct
- Ensure CMI is sending all required fields
- Check hash calculation formula matches CMI specification
- Review Edge Function logs for hash comparison details

### Issue: User not upgraded after successful payment
**Solution:**
```sql
-- Check if transaction was recorded
SELECT * FROM payment_transactions WHERE user_id = 'user-uuid';

-- Manually upgrade user if needed
UPDATE users SET visitor_level = 'premium' WHERE id = 'user-uuid';
```

## Security Considerations

- ✅ All webhooks validate signatures/hashes before processing
- ✅ Supabase Service Role Key used for database writes
- ✅ CORS headers configured for Edge Functions
- ✅ Error messages don't expose sensitive information
- ✅ Transaction records include all audit fields
- ⚠️ Keep webhook secrets secure (never commit to git)
- ⚠️ Monitor webhook logs for suspicious activity
- ⚠️ Implement rate limiting if needed (via Supabase)

## Support

For issues with:
- **Stripe**: Check [Stripe Webhook Docs](https://stripe.com/docs/webhooks)
- **PayPal**: Check [PayPal Webhook Docs](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- **CMI**: Contact CMI technical support
- **Edge Functions**: Check [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
