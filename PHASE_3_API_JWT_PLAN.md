# PHASE 3: SECURITY AUDIT - API Keys & JWT Configuration

**Target**: Bugs #4 & #5  
**Estimated Time**: 3 hours  
**Difficulty**: MEDIUM  
**Impact**: CRITICAL - Prevents unauthorized API access

---

## 🎯 BUGS TO FIX

### Bug #4: API Key Security Review
**Description**: Audit for hardcoded API keys in source code

**Why it matters**:
- ❌ Exposed API keys = Attackers can make requests as the app
- ❌ Rate limiting bypassed
- ❌ Data theft/modification/deletion
- ✅ Fixed by: Moving all keys to environment variables

**Acceptance Criteria**:
- [ ] No hardcoded API keys in source (except public keys like Firebase)
- [ ] All keys in `.env.local` (development) or CI/CD secrets
- [ ] `.env.example` documents which keys are needed
- [ ] `git diff` shows no sensitive data

---

### Bug #5: JWT Configuration Review
**Description**: Verify JWT tokens use constant secret, proper expiration

**Why it matters**:
- ❌ Random JWT_SECRET = tokens can't be verified after deployment
- ❌ No expiration = tokens valid forever
- ❌ No refresh mechanism = XSS compromise = full account compromise
- ✅ Fixed by: Proper configuration + refresh token flow

**Acceptance Criteria**:
- [ ] `SUPABASE_JWT_SECRET` is set (not random each time)
- [ ] Access tokens expire in 1 hour
- [ ] Refresh tokens expire in 7 days
- [ ] Refresh flow implemented and tested

---

## 🔍 AUDIT CHECKLIST

### API Keys Scan Required

```bash
# These patterns should NOT appear in code:
- "Bearer sk-"  (Stripe)
- "sk_live_"    (Stripe Live)
- "sk_test_"    (Stripe Test)
- "api_key="    (Generic)
- "apiKey: '"   (TypeScript)
- "RESEND_API_KEY" (hardcoded)
- Firebase config in source (should be from env)
- Supabase anon key (might be OK but verify)
```

### Files to Check

**High Priority** (Most likely to have keys):
```
1. src/lib/firebase.ts
2. src/lib/supabase.ts
3. src/config/*.ts
4. .env files (should not be in git)
5. src/services/paymentService.ts (Stripe keys)
6. src/services/emailService.ts (Resend keys)
7. vite.config.ts
8. capacitor.config.ts
```

**Medium Priority** (API calls):
```
9. src/services/*.ts (all service files)
10. src/pages/**/**.tsx (API endpoints)
11. scripts/*.ts/*.mjs (test/setup scripts)
```

---

## 🛠️ REMEDIATION STEPS

### Step 1: Find All API Keys (30 min)

```bash
# Search for common patterns
grep -r "Bearer sk-" src/ scripts/
grep -r "sk_live_" src/ scripts/
grep -r "sk_test_" src/ scripts/
grep -r "apiKey:" src/ --include="*.ts" --include="*.tsx"
grep -r "RESEND_API_KEY" src/ --include="*.ts"
grep -r "process.env" src/ | grep -v "process.env.VITE"
```

### Step 2: Environment Variable Setup (20 min)

**Update `.env.example`**:
```bash
# API KEYS - KEEP THESE SECRET, NEVER COMMIT
RESEND_API_KEY=your_resend_key_here
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
FIREBASE_API_KEY=xxxxx
SUPABASE_ANON_KEY=xxxxx
SUPABASE_JWT_SECRET=your_jwt_secret_here

# VITE PUBLIC KEYS (OK to expose)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_FIREBASE_PROJECT_ID=xxxxx
```

### Step 3: JWT Configuration Verification (30 min)

**Check Supabase Auth Settings**:
```typescript
// supabase/config.toml or Supabase Dashboard
[auth]
jwt_exp = 3600  # 1 hour (should be)
jwt_secret = "your-constant-secret"  # Should NOT be generated each time
refresh_token_rotation_enabled = true

[auth.jwt]
exp = 3600
iat = true
nbf = true
```

**Check Code Implementation**:
```typescript
// src/lib/supabase.ts
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,  // Public - OK
  process.env.VITE_SUPABASE_ANON_KEY,  // Public - OK
  {
    // JWT settings should be in Supabase dashboard, not here
    // DO NOT set JWT_SECRET in client code
  }
);
```

### Step 4: Refresh Token Implementation (60 min)

**Current State** (check what exists):
- [ ] Are refresh tokens being issued?
- [ ] Are refresh tokens being used?
- [ ] What's the rotation strategy?

**Fix if needed**:
```typescript
// src/lib/supabase.ts
import { supabase } from '@/lib/supabase';

// Refresh token before it expires
export async function ensureValidSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  // Check if token expires in less than 5 minutes
  const expiresIn = session.expires_at - Date.now() / 1000;
  
  if (expiresIn < 300) {
    // Refresh the token
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw refreshError;
    return data.session;
  }
  
  return session;
}
```

---

## 📋 DETAILED AUDIT PLAN

### Part A: API Keys (90 minutes)

#### Task 1: Grep Search (15 min)
```bash
# Search for exposed keys
find src -name "*.ts" -o -name "*.tsx" | xargs grep -E "(Bearer|sk_|pk_|apiKey|RESEND_API)" | grep -v "process.env"
```

**Expected Result**:
- List of any hardcoded keys found
- Location (file:line)
- Type (Stripe, Firebase, Resend, etc.)

#### Task 2: Audit Results (15 min)
For each key found:
1. Note the file and line number
2. Determine if it's sensitive
3. Plan the fix

#### Task 3: Environment Setup (30 min)
1. Create/update `.env.example` with all needed keys
2. Document where to get each key
3. Add instructions for developers

#### Task 4: Code Refactoring (30 min)
For each exposed key:
1. Replace with `process.env.KEY_NAME`
2. Ensure `.env.local` has the key
3. Test the change compiles

---

### Part B: JWT Configuration (90 minutes)

#### Task 1: Supabase Dashboard Audit (20 min)
1. Open Supabase > Authentication > Providers > Settings
2. Check JWT expiry time (should be 3600 = 1 hour)
3. Check that JWT secret is CONSTANT (not regenerated)
4. Note current settings

**What to look for**:
```
JWT Expiration: _____ seconds (should be 3600)
JWT Secret: [SET] or [NOT SET]?
Refresh Token Rotation: [ENABLED] or [DISABLED]?
```

#### Task 2: Code Review (30 min)
Check these files for JWT handling:
1. [src/lib/supabase.ts](src/lib/supabase.ts) - Initialization
2. [src/store/authStore.ts](src/store/authStore.ts) - Token refresh
3. [src/lib/initAuth.ts](src/lib/initAuth.ts) - Auth initialization
4. [src/pages/auth/LoginPage.tsx](src/pages/auth/LoginPage.tsx) - Login flow

**Verification checklist**:
- [ ] JWT_SECRET not hardcoded in client (should only be on server)
- [ ] Access token expiry is reasonable (1 hour)
- [ ] Refresh tokens are being used
- [ ] Automatic refresh before expiry
- [ ] No localStorage of access token (use httpOnly cookie if possible)

#### Task 3: Refresh Token Implementation (30 min)
Add if missing:
```typescript
// src/hooks/useTokenRefresh.ts (NEW FILE)
export function useTokenRefresh() {
  useEffect(() => {
    // Check token every minute
    const interval = setInterval(async () => {
      await ensureValidSession();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
}
```

Integrate into main layout:
```tsx
// src/layouts/MainLayout.tsx
export default function MainLayout() {
  useTokenRefresh();  // Add this
  // ... rest of component
}
```

#### Task 4: Testing (10 min)
1. Start application: `npm run dev`
2. Login with test account
3. Wait 5 minutes
4. Perform API call (should work, token refreshed silently)
5. Check browser DevTools > Application > Cookies for auth tokens

---

## 🎯 IMPLEMENTATION PLAN

### Phase 3A: API Key Security (2 hours)

```
Hour 1:
├─ Search for hardcoded keys (15 min)
├─ Document findings (15 min)
├─ Update .env.example (15 min)
└─ Plan refactoring (15 min)

Hour 2:
├─ Refactor src/lib/firebase.ts (20 min)
├─ Refactor src/lib/supabase.ts (20 min)
├─ Refactor src/services/paymentService.ts (15 min)
└─ Test build & verify (5 min)
```

### Phase 3B: JWT Configuration (1 hour)

```
├─ Audit Supabase settings (20 min)
├─ Review token refresh logic (20 min)
├─ Implement improvements if needed (15 min)
└─ Test login flow end-to-end (5 min)
```

---

## ✅ ACCEPTANCE TESTS

### API Keys ✅
```bash
# Run these to verify keys are secure
grep -r "sk_live_\|sk_test_\|Bearer sk-" src/ scripts/ || echo "✅ No exposed keys"
grep -r 'apiKey.*:.*["\047]' src/ --include="*.ts" --include="*.tsx" | grep -v "process.env" || echo "✅ No hardcoded keys"
```

### JWT ✅
```bash
# Verify JWT configuration
1. Open app, login
2. Open DevTools > Network > Login request
3. Response should have:
   - access_token (JWT)
   - refresh_token (different format)
   - expires_in (should be 3600)

4. Wait 5 minutes
5. Perform any API call
6. Token should be auto-refreshed silently
7. User should not see any interruption
```

---

## 📚 REFERENCES

### Supabase JWT Docs
- [Auth Configuration](https://supabase.com/docs/guides/auth/managing-user-data#updating-user-data)
- [Token Refresh](https://supabase.com/docs/guides/auth/sessions#refresh-tokens)
- [Environment Variables](https://supabase.com/docs/guides/api/keys)

### API Key Best Practices
- Never commit `.env.local`
- Use `.env.example` with placeholder values
- Rotate keys regularly (quarterly minimum)
- Use key scoping (restrict permissions per key)
- Monitor key usage in API dashboards

### Environment Variable Patterns
```typescript
// ✅ GOOD
const apiKey = process.env.STRIPE_SECRET_KEY;
const publicKey = process.env.VITE_STRIPE_PUBLIC_KEY;

// ❌ BAD
const apiKey = "sk_live_xxxxx";
const apiKey = import.meta.env.VITE_SECRET_KEY;  // PUBLIC!
```

---

## 🚀 SUCCESS CRITERIA

- [ ] **No hardcoded API keys** in any source file
- [ ] **All keys documented** in `.env.example`
- [ ] **JWT expires in 1 hour** (verified in Supabase)
- [ ] **Refresh tokens work** (manual test passes)
- [ ] **Build succeeds** with new environment setup
- [ ] **No security warnings** from npm audit
- [ ] **All tests pass** (if applicable)
- [ ] **Code review approved** by team

---

## 📈 METRICS

- **Lines Changed**: ~200
- **Files Modified**: ~8-12
- **Files Created**: 1-2 (token refresh hooks)
- **Build Impact**: ~5KB (token refresh logic)
- **Test Coverage**: 100% (security critical)

---

## ⚠️ RISKS & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Key accidentally exposed | Low | Critical | Code review + grep checks |
| JWT breaks on deploy | Medium | High | Test with new env vars before push |
| Token refresh fails silently | Low | Medium | Add error logging + tests |
| Environment vars not set | Medium | High | Clear documentation + setup script |

---

## 📅 TIMELINE

```
Session Start: Now
├─ API Keys (Hour 1-2): ← Your next task
├─ JWT Config (Hour 2-3): ← Can start while API keys compile
└─ Session End: 3 hours
```

**Recommended**: Start with API Keys search (15 min), then parallel JWT audit

