# 🔐 SECURITY ACTION PLAN - IMMEDIATE
**CRITICAL**: Follow these steps BEFORE any production deployment

---

## ✅ GOOD NEWS: .env Never Committed to Git
- ✅ `.env` is properly in `.gitignore`
- ✅ `.env` has NEVER been committed to git history
- ✅ Credentials are only exposed locally (not in remote repository)
- ⚠️ **Still must rotate** as a security best practice

---

## 🚨 STEP 1: ROTATE SUPABASE CREDENTIALS (15 minutes)

### 1.1 Access Supabase Dashboard
1. Go to: https://app.supabase.com/project/eqjoqgpbxhsfgcovipgu
2. Log in with your account

### 1.2 Regenerate Project API Keys
1. Click **Settings** (gear icon) in left sidebar
2. Click **API** section
3. Scroll to **Project API keys**
4. Click **Generate new anon key** (regenerate)
5. Click **Generate new service_role key** (regenerate)
6. **IMPORTANT**: Copy both new keys immediately

### 1.3 Update Local .env File
```bash
# Replace in .env:
VITE_SUPABASE_ANON_KEY=<new_anon_key_here>

# REMOVE THIS LINE (service role key should NOT be in client .env):
# VITE_SUPABASE_SERVICE_ROLE_KEY=...
```

### 1.4 Update Server-Side Configuration
If you need service role key for backend operations, add to **server.js** or backend .env (NOT client .env):
```bash
# In backend/server .env ONLY (not accessible to client):
SUPABASE_SERVICE_ROLE_KEY=<new_service_role_key_here>
```

---

## 🔑 STEP 2: ROTATE JWT SECRET (5 minutes)

### 2.1 Generate New JWT Secret
```bash
# Run in terminal:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# OR using OpenSSL:
openssl rand -base64 64
```

### 2.2 Update .env
```bash
# Replace in .env:
JWT_SECRET=<your_new_64_character_secret_here>
```

### 2.3 Impact Assessment
⚠️ **WARNING**: Changing JWT_SECRET will:
- Invalidate ALL existing user sessions
- Require all users to log in again
- This is EXPECTED and NECESSARY for security

---

## 📧 STEP 3: ROTATE SMTP PASSWORD (10 minutes)

### 3.1 Access Email Provider
1. Go to your email hosting control panel
2. Navigate to **Email Accounts** or **Mail Settings**
3. Find account: `jalal@siportevent.com`

### 3.2 Change Password
1. Click **Change Password** or **Reset Password**
2. Generate a strong password (20+ characters)
3. **RECOMMENDED**: Use a password manager to generate:
   - Length: 24 characters
   - Include: uppercase, lowercase, numbers, symbols
   - Example generator: https://passwordsgenerator.net/

### 3.3 Update .env
```bash
# Replace in .env:
SMTP_PASS=<your_new_strong_password_here>
```

### 3.4 Test Email Functionality
```bash
# After updating, test email sending:
# 1. Start your server
# 2. Trigger a test email (password reset, welcome email, etc.)
# 3. Verify receipt
```

---

## 🌐 STEP 4: CONFIGURE CORS (5 minutes)

### 4.1 Identify Production Domains
List all domains that need API access:
```
Example:
- https://siport-event.com
- https://www.siport-event.com
- https://app.siport-event.com
- https://staging.siport-event.com (if applicable)
```

### 4.2 Update server.js
**File**: `server.js` (lines 22-34)

**Replace this**:
```javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // ❌ DANGEROUS
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
```

**With this**:
```javascript
// Whitelist only your production domains
const allowedOrigins = [
  'https://siport-event.com',           // ← Update with YOUR domain
  'https://www.siport-event.com',       // ← Update with YOUR domain
  'https://app.siport-event.com',       // ← Update with YOUR domain
  'http://localhost:5173',              // ← Keep for local development
  'http://localhost:5000'               // ← Keep for local development
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
```

---

## 🔧 STEP 5: DISABLE DEMO LOGINS (1 minute)

### 5.1 Update .env
```bash
# Change from:
VITE_SHOW_DEMO_LOGINS=true

# To:
VITE_SHOW_DEMO_LOGINS=false
```

---

## 🛡️ STEP 6: ENABLE TLS CERTIFICATE VALIDATION (2 minutes)

### 6.1 Update server.js
**File**: `server.js` (around lines 56-57)

**Remove this**:
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // ❌ REMOVE THIS LINE
  }
});
```

**Replace with**:
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
  // tls validation is now enabled by default (secure)
});
```

---

## 📊 STEP 7: DISABLE CONSOLE LOGS IN PRODUCTION (2 minutes)

### 7.1 Update vite.config.ts
**File**: `vite.config.ts`

**Find**:
```javascript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: false, // ❌ Change this
      drop_debugger: true,
    },
  },
}
```

**Change to**:
```javascript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,  // ✅ Remove console.* in production
      drop_debugger: true,
    },
  },
}
```

---

## ✅ STEP 8: VERIFICATION CHECKLIST

After completing all steps, verify:

```bash
# 1. Build the application
npm run build

# 2. Check for build errors
npx tsc --noEmit

# 3. Test locally
npm run preview

# 4. Verify in browser:
# - Can you log in? (JWT rotation will log out existing users)
# - Can you send emails? (Test password reset)
# - Are console logs hidden? (Open DevTools → Console)
# - Does CORS work? (Check Network tab for CORS errors)
```

### Expected Results:
- ✅ Build succeeds without errors
- ✅ TypeScript: 0 errors
- ✅ Login works (users need to re-authenticate)
- ✅ Email sending works
- ✅ No console.log visible in browser
- ✅ No CORS errors in Network tab

---

## 📋 FINAL .env TEMPLATE (After All Changes)

```bash
# Supabase Configuration (Client-side)
VITE_SUPABASE_URL=https://eqjoqgpbxhsfgcovipgu.supabase.co
VITE_SUPABASE_ANON_KEY=<NEW_ANON_KEY_HERE>

# Supabase Configuration (Server-side ONLY - move to backend .env)
SUPABASE_URL=https://eqjoqgpbxhsfgcovipgu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<NEW_SERVICE_ROLE_KEY_HERE>

# JWT Secret (Server-side)
JWT_SECRET=<NEW_64_CHAR_SECRET_HERE>

# Server Port
PORT=5000

# Demo Logins (Disabled for Production)
VITE_SHOW_DEMO_LOGINS=false

# Firebase Configuration (Complete if using push notifications)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=siport-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=siport-2026
VITE_FIREBASE_STORAGE_BUCKET=siport-2026.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=

# OpenAI Configuration (Optional)
VITE_OPENAI_API_KEY=

# SMTP Configuration (Email)
SMTP_HOST=mail.siportevent.com
SMTP_PORT=465
SMTP_USER=jalal@siportevent.com
SMTP_PASS=<NEW_STRONG_PASSWORD_HERE>
SMTP_SECURE=true
```

---

## ⏱️ ESTIMATED COMPLETION TIME

| Step | Task | Time |
|------|------|------|
| 1 | Rotate Supabase credentials | 15 min |
| 2 | Rotate JWT secret | 5 min |
| 3 | Rotate SMTP password | 10 min |
| 4 | Configure CORS | 5 min |
| 5 | Disable demo logins | 1 min |
| 6 | Enable TLS validation | 2 min |
| 7 | Disable console logs | 2 min |
| 8 | Verification & testing | 30 min |
| **TOTAL** | **All security fixes** | **~70 minutes** |

---

## 🚀 AFTER COMPLETION

Once all steps are complete:
1. ✅ Application is production-ready (security-wise)
2. ✅ All critical blockers resolved
3. ✅ Safe to deploy to staging environment
4. ⚠️ Test thoroughly in staging (1-2 days recommended)
5. 🚀 Deploy to production with monitoring

---

## 📞 SUPPORT

If you encounter issues during credential rotation:
- **Supabase Issues**: Check https://app.supabase.com/support
- **Email Issues**: Contact email hosting provider support
- **Build Errors**: Run `npm run build` and check error messages

---

**Document Created**: 2026-01-28
**Priority**: 🔴 CRITICAL - Complete BEFORE production deployment
**Estimated Time**: 70 minutes
**Impact**: Resolves ALL critical security blockers
