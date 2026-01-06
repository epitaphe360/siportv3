# 🚀 BUGS FIXES ROADMAP - 37 Bugs Identifiés

## 📊 Résumé d'Exécution

**Total bugs**: 37  
**Commits requis**: ~15-20  
**Temps estimé**: 5-7 jours (8h/jour)  
**Priorité**: CRITIQUE (production blocking)

---

## 🔴 PHASE 1: BUGS CRITIQUES (5-6 bugs) - Jour 1-3

### ✅ COMPLÉTÉ
1. **XSS Sanitization** - ✅ ShortcodeRenderer uses DOMPurify
2. **Hardcoded Passwords** - ✅ Moved to env variables (TEST_PASSWORD)

### 🔲 À FAIRE (Priorité IMMÉDIATE)

#### Bug #3: API Key Security Review
**Location**: `src/services/supabaseService.ts`, `src/hooks/`, `src/pages/`  
**Issue**: API keys may be exposed in query params  
**Fix**:
- [ ] Search for API keys in URL params (Google Maps, OpenAI)
- [ ] Move to request headers (Authorization: Bearer)
- [ ] Use backend proxy for sensitive API calls
- [ ] Update .env.example with proper key formatting

**Files to check**:
- `src/services/supabaseService.ts` (search for API usage)
- `src/hooks/useGoogleMaps.ts` (if exists)
- `src/pages/media/MediaListPage.tsx` (API calls)

#### Bug #4: Server-side Validation (RPC Functions)
**Location**: `supabase/functions/`, `src/store/appointmentStore.ts`  
**Issue**: Validation only on client side  
**Fix**:
- [ ] Create RPC validation for appointments
- [ ] Create RPC validation for quotas
- [ ] Create RPC validation for user permissions
- [ ] All mutations must validate server-side

**RPC Functions to create**:
```sql
-- Validate appointment quota
CREATE FUNCTION validate_appointment_quota(
  user_id UUID,
  exhibitor_id UUID
) RETURNS BOOLEAN;

-- Validate user permissions for time slot creation
CREATE FUNCTION can_create_time_slot(
  user_id UUID
) RETURNS BOOLEAN;

-- Validate payment status
CREATE FUNCTION validate_payment_status(
  exhibitor_id UUID
) RETURNS BOOLEAN;
```

#### Bug #5: JWT Secret Configuration
**Location**: `capacitor.config.ts`, `.env.example`, deployment config  
**Issue**: JWT secret may be random per restart  
**Fix**:
- [ ] Verify SUPABASE_JWT_SECRET is set in .env
- [ ] Document that JWT_SECRET must be CONSTANT
- [ ] Add CI/CD check to ensure stable JWT secret
- [ ] Test: restart app, verify JWT still works

#### Bug #6: QR Code Cache Nonce
**Status**: ✅ ALREADY IMPLEMENTED in `qrCodeServiceOptimized.ts`

---

## 🟡 PHASE 2: FONCTIONNALITÉS MANQUANTES (5 bugs) - Jour 3-5

### Bug #7: Email Notifications Réelles
**Location**: `src/store/appointmentStore.ts:507-508`, `src/services/emailTemplateService.ts`  
**Current**: `console.log` (mock)  
**Fix**:
- [ ] Use existing Supabase Functions (`send-exhibitor-payment-instructions`, `send-visitor-welcome-email`)
- [ ] Create appointment notification function in Supabase
- [ ] Integrate Resend email service
- [ ] Send on: appointment created, confirmed, rejected, cancelled

**Implementation**:
```typescript
// appointmentStore.ts updateAppointmentStatus()
if (appointment.status === 'confirmed') {
  // Call Supabase function instead of console.log
  await supabase.functions.invoke('send-appointment-notification', {
    body: { appointmentId, recipientId: appointment.visitor_id }
  });
}
```

### Bug #8: Push Notifications RDV
**Location**: `src/services/notificationService.ts:444`  
**Current**: Mock only  
**Fix**:
- [ ] Use Capacitor push notifications
- [ ] Integrate Firebase Cloud Messaging (FCM)
- [ ] Send when: appointment confirmed/rejected/reminder (24h before)

### Bug #9: WCAG Validation Contraste
**Location**: `src/hooks/useAccessibility.ts` (if exists)  
**Current**: `return true` (always passes)  
**Fix**:
- [ ] Implement WCAG 2.1 AA contrast check
- [ ] Use `wcag-contrast-checker` library
- [ ] Check all text elements on page
- [ ] Add CI check for accessibility

### Bug #10: Quota Verification Réelle
**Location**: `src/store/appointmentStore.ts:327-349`  
**Current**: Basic check, missing edge cases  
**Fix**:
- [ ] Count ALL appointment types (confirmed + pending + proposed)
- [ ] Check transaction-level quota (database atomic)
- [ ] Handle quota reduction for declined appointments
- [ ] Prevent overbooking at RPC level

### Bug #11: Database Transactions
**Location**: Multiple RPC functions  
**Issue**: No atomic transactions  
**Fix**:
- [ ] Wrap appointment creation in transaction
- [ ] Wrap quota updates in transaction
- [ ] Wrap payment status in transaction
- [ ] Use `BEGIN...COMMIT` pattern

---

## 🟢 PHASE 3: QUALITÉ CODE (15 bugs) - Semaine 2

### Bug #12-#26: Code Quality Issues
**150+ `any` types** → Replace with strict types  
**40+ missing useEffect deps** → Add dependencies  
**40+ eslint-disable** → Justify or remove  
**200+ console.error** → Centralize logging  
**No retry logic** → Add exponential backoff  
**Fetch errors uncaught** → Add proper error handling  

**Tools**:
```bash
# Find all `any` types
grep -r ': any' src/ --include="*.ts" --include="*.tsx"

# Find missing useEffect dependencies
grep -r 'useEffect.*\[\]' src/ --include="*.tsx"

# Find console.errors
grep -r 'console\.error' src/ --include="*.ts"
```

---

## 💻 PHASE 4: APPS MOBILES (iOS/Android) - Semaine 2

### Bug #27: Missing Capacitor Plugins
**Current**: Not installed  
**Fix**:
```bash
npm install \
  @capacitor/camera \
  @capacitor/geolocation \
  @capacitor/share \
  @capacitor/filesystem \
  @capacitor/device \
  @capacitor/network \
  @capacitor/haptics \
  @capacitor/push-notifications \
  @capacitor/local-notifications \
  @capacitor/splash-screen \
  @capacitor/status-bar

npm run build
npx cap add ios
npx cap add android
```

---

## 🎨 PHASE 5: DARK MODE (1 bug) - Semaine 2-3

### Bug #28: Dark Mode Implementation
**Current**: 0% done  
**Files**:
- [ ] Update `tailwind.config.ts`: add `darkMode: 'class'`
- [ ] Create `ThemeProvider` context in `src/context/ThemeContext.tsx`
- [ ] Add `DarkModeToggle` to Header
- [ ] Replace hardcoded colors with CSS variables
- [ ] Test on all 8 dashboards + pages

---

## 📋 PHASE 6: BUGS MINEURS (11+ bugs) - Semaine 3-4

### Bug #29-#37: Minor Issues
- [ ] Remove 20+ TODOs or implement them
- [ ] Remove unused imports
- [ ] Remove demo data from production components
- [ ] Remove non-justified eslint-disable
- [ ] Add proper error boundaries
- [ ] Implement Sentry for error tracking
- [ ] Add skeleton loaders for slow components
- [ ] Add scroll animations
- [ ] E2E test coverage: 60%+ (currently <20%)

---

## ✅ EXECUTION CHECKLIST

### Jour 1-2: Security (Bugs #1-6)
- [ ] Commit #1: Hardcoded password removal ✅
- [ ] Commit #2: API key security audit
- [ ] Commit #3: Server-side RPC validation
- [ ] Commit #4: JWT config verification
- [ ] Commit #5: Security documentation

### Jour 3-5: Features (Bugs #7-11)
- [ ] Commit #6: Email notifications
- [ ] Commit #7: Push notifications
- [ ] Commit #8: WCAG contrast check
- [ ] Commit #9: Real quota verification
- [ ] Commit #10: Database transactions

### Week 2: Quality Code (Bugs #12-26)
- [ ] Commit #11: Replace `any` types
- [ ] Commit #12: Fix useEffect dependencies
- [ ] Commit #13: Add retry logic
- [ ] Commit #14: Centralize error logging
- [ ] Commit #15: Add error boundaries

### Week 2: Mobile (Bug #27)
- [ ] Commit #16: Install Capacitor plugins
- [ ] Commit #17: Build iOS app
- [ ] Commit #18: Build Android app
- [ ] Commit #19: Test on simulators

### Week 2-3: Dark Mode (Bug #28)
- [ ] Commit #20: Dark mode implementation
- [ ] Commit #21: Test on all pages

### Week 3-4: Polish (Bugs #29-37)
- [ ] Commit #22: Remove TODOs
- [ ] Commit #23: E2E test coverage
- [ ] Commit #24: Performance optimization
- [ ] Commit #25: Final cleanup

---

## 🎯 START HERE

**Next immediate action**: 
```bash
# Audit API key usage
grep -r "VITE_" src/ --include="*.ts" --include="*.tsx" | grep -v "env\|process"

# Check server-side validation functions
grep -r "RPC\|function\|trigger" supabase/ --include="*.sql"

# List all TODOs
grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" | wc -l
```

---

Generated: 6 Jan 2026  
Status: PLANNING PHASE  
Next: Start Phase 1 (Security) - ETA 2-3 days
