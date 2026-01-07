# 📋 PLAN DÉTAILLÉ - 250 TESTS MANQUANTS

**Date**: 19 décembre 2025

---

## 🔴 PHASE 1: PAIEMENT (50 tests) - 1 JOUR

### Visitor Payment Flows (25 tests)

#### Stripe (8 tests)
```typescript
test('Visitor: Should navigate to payment page', async ({page}) => {
  // Route: /visitor/payment
  // Test: Click payment button
})

test('Visitor: Should display Stripe checkout', async ({page}) => {
  // Route: /visitor/payment
  // Test: Payment form loads
})

test('Visitor: Should validate payment form', async ({page}) => {
  // Test: Empty field validation
  // Test: Invalid card validation
  // Test: Email validation
})

test('Visitor: Should process Stripe payment', async ({page}) => {
  // Test: Submit valid payment
  // Test: Redirect to success page
  // Test: Update user to VIP
})

test('Visitor: Should handle Stripe errors', async ({page}) => {
  // Test: Declined card
  // Test: Network error
  // Test: Timeout error
})

test('Visitor: Should display payment success page', async ({page}) => {
  // Route: /visitor/payment-success
  // Test: Show badge button
  // Test: Show next steps
})

test('Visitor: Should display payment instructions', async ({page}) => {
  // Route: /visitor/payment-instructions
  // Test: Show CMI instructions
  // Test: Show bank transfer info
})

test('Visitor: Should show payment history', async ({page}) => {
  // Route: /profile or dashboard
  // Test: List past payments
  // Test: Invoice download
})
```

#### PayPal (6 tests)
```typescript
test('Visitor: Should select PayPal payment', async ({page}) => {
  // Test: Click PayPal button
  // Test: Redirect to PayPal
})

test('Visitor: Should create PayPal order', async ({page}) => {
  // Test: Order creation
  // Test: Correct amount
})

test('Visitor: Should capture PayPal payment', async ({page}) => {
  // Test: Order capture
  // Test: VIP upgrade
})

test('Visitor: Should handle PayPal cancel', async ({page}) => {
  // Test: User cancels payment
  // Test: Return to payment page
})

test('Visitor: Should verify PayPal status', async ({page}) => {
  // Test: Check payment status
  // Test: Update UI accordingly
})

test('Visitor: Should save PayPal history', async ({page}) => {
  // Test: Record transaction
  // Test: Show in history
})
```

#### CMI (6 tests)
```typescript
test('Visitor: Should select CMI payment', async ({page}) => {
  // Test: Click CMI option
})

test('Visitor: Should create CMI payment request', async ({page}) => {
  // Test: CMI form loads
  // Test: Request created
})

test('Visitor: Should validate CMI data', async ({page}) => {
  // Test: Email validation
  // Test: Card validation
})

test('Visitor: Should handle CMI response', async ({page}) => {
  // Test: Success response
  // Test: Error response
})

test('Visitor: Should verify CMI payment', async ({page}) => {
  // Test: Payment confirmation
  // Test: VIP upgrade
})

test('Visitor: Should log CMI transaction', async ({page}) => {
  // Test: Record in database
})
```

#### Bank Transfer (5 tests)
```typescript
test('Visitor: Should show bank transfer info', async ({page}) => {
  // Test: Account details visible
  // Test: Reference number generated
})

test('Visitor: Should allow bank transfer timeout', async ({page}) => {
  // Test: User can wait for transfer
  // Test: Auto-verify after transfer
})

test('Visitor: Should verify bank transfer', async ({page}) => {
  // Test: Check received amount
  // Test: Confirm payment
})

test('Visitor: Should update status when paid', async ({page}) => {
  // Test: Auto-detect payment
  // Test: Upgrade to VIP
})

test('Visitor: Should show transfer history', async ({page}) => {
  // Test: List transfers
  // Test: Status per transfer
})
```

### Partner Payment Flows (25 tests)

#### Partner Stripe (8 tests)
```typescript
test('Partner: Should navigate to upgrade page', async ({page}) => {
  // Route: /partner/upgrade
  // Test: Click upgrade button
})

test('Partner: Should display tier options', async ({page}) => {
  // Test: Silver tier
  // Test: Gold tier
  // Test: Platinum tier
  // Test: Prices visible
})

test('Partner: Should select tier', async ({page}) => {
  // Test: Click silver
  // Test: Click gold
  // Test: Click platinum
})

test('Partner: Should display Stripe checkout', async ({page}) => {
  // Test: Payment form
  // Test: Amount correct
})

test('Partner: Should process Stripe payment', async ({page}) => {
  // Test: Submit payment
  // Test: Redirect to success
  // Test: Upgrade tier
})

test('Partner: Should show new tier benefits', async ({page}) => {
  // Test: New features unlocked
  // Test: Dashboard updated
})

test('Partner: Should handle payment errors', async ({page}) => {
  // Test: Declined card
  // Test: Retry option
})

test('Partner: Should show payment receipt', async ({page}) => {
  // Test: Invoice generated
  // Test: Download available
})
```

#### Partner PayPal (6 tests)
```typescript
test('Partner: Should select PayPal', async ({page}) => {
  // Test: Click PayPal button
})

test('Partner: Should create PayPal order', async ({page}) => {
  // Test: Correct amount
  // Test: Correct tier
})

test('Partner: Should authorize PayPal payment', async ({page}) => {
  // Test: Redirect to PayPal
  // Test: Approve payment
})

test('Partner: Should capture PayPal order', async ({page}) => {
  // Test: Order captured
  // Test: Tier upgraded
})

test('Partner: Should handle PayPal error', async ({page}) => {
  // Test: Payment failed
  // Test: Retry available
})

test('Partner: Should verify PayPal status', async ({page}) => {
  // Test: Check order status
})
```

#### Partner Bank Transfer (6 tests)
```typescript
test('Partner: Should select bank transfer', async ({page}) => {
  // Route: /partner/payment-selection
  // Test: Click bank transfer
})

test('Partner: Should navigate to bank transfer page', async ({page}) => {
  // Route: /partner/bank-transfer
  // Test: Page loads
})

test('Partner: Should display bank details', async ({page}) => {
  // Test: Account number
  // Test: Bank name
  // Test: Reference
})

test('Partner: Should create transfer request', async ({page}) => {
  // Test: Amount selected
  // Test: Request created
})

test('Partner: Should allow transfer waiting', async ({page}) => {
  // Test: Can wait for payment
  // Test: Can check status
})

test('Partner: Should verify transfer received', async ({page}) => {
  // Test: Payment detected
  // Test: Tier upgraded
})

test('Partner: Should admin approve transfer', async ({page}) => {
  // Route: /admin (ADMIN)
  // Test: See pending transfers
  // Test: Approve transfer
  // Test: Reject transfer
})
```

#### Partner CMI (5 tests)
```typescript
test('Partner: Should select CMI payment', async ({page}) => {
  // Test: Click CMI option
})

test('Partner: Should create CMI payment', async ({page}) => {
  // Test: Form loads
  // Test: Request created
})

test('Partner: Should handle CMI response', async ({page}) => {
  // Test: Success
  // Test: Failure
})

test('Partner: Should verify CMI payment', async ({page}) => {
  // Test: Payment confirmed
})

test('Partner: Should upgrade partner tier', async ({page}) => {
  // Test: New tier active
  // Test: Features unlocked
})
```

---

## 🟠 PHASE 2: ADMIN WORKFLOWS (60 tests) - 1.5 JOURS

### Create Exhibitor (15 tests)

```typescript
test('Admin: Should navigate to create exhibitor', async ({page}) => {
  // Route: /admin/create-exhibitor
  // Test: Page loads
})

test('Admin: Should display exhibitor form', async ({page}) => {
  // Test: All fields visible
  // Test: Form structure correct
})

test('Admin: Should validate exhibitor email', async ({page}) => {
  // Test: Duplicate email error
  // Test: Invalid email error
  // Test: Required field error
})

test('Admin: Should validate exhibitor company', async ({page}) => {
  // Test: Required field
  // Test: Max length
  // Test: Min length
})

test('Admin: Should validate exhibitor description', async ({page}) => {
  // Test: Required field
  // Test: Min 50 chars
  // Test: Max 500 chars
})

test('Admin: Should validate exhibitor contact', async ({page}) => {
  // Test: Phone format
  // Test: Website URL
  // Test: Email format
})

test('Admin: Should allow file upload', async ({page}) => {
  // Test: Upload logo
  // Test: Upload valid image types
  // Test: Reject invalid types
})

test('Admin: Should select exhibitor tier', async ({page}) => {
  // Test: Basic tier
  // Test: Standard tier
  // Test: Premium tier
  // Test: Elite tier
})

test('Admin: Should create exhibitor account', async ({page}) => {
  // Test: Submit form
  // Test: Account created
  // Test: Email sent
  // Test: Redirect to exhibitor
})

test('Admin: Should display success message', async ({page}) => {
  // Test: Success toast
  // Test: Account details shown
})

test('Admin: Should send invitation email', async ({page}) => {
  // Test: Email in inbox
  // Test: Correct link
  // Test: Password reset link
})

test('Admin: Should allow exhibitor login', async ({page}) => {
  // Test: Use new credentials
  // Test: Access exhibitor dashboard
})

test('Admin: Should auto-assign pavilion', async ({page}) => {
  // Test: Pavilion assigned
  // Test: Booth number
})

test('Admin: Should set initial inventory', async ({page}) => {
  // Test: Default inventory set
  // Test: Can modify before publish
})

test('Admin: Should display exhibitor in list', async ({page}) => {
  // Route: /admin/dashboard or exhibitor list
  // Test: Exhibitor appears
  // Test: Status correct
})
```

### Create Partner (12 tests)

```typescript
test('Admin: Should navigate to create partner', async ({page}) => {
  // Route: /admin/create-partner
  // Test: Page loads
})

test('Admin: Should display partner form', async ({page}) => {
  // Test: All fields visible
})

test('Admin: Should validate partner email', async ({page}) => {
  // Test: Unique email
  // Test: Valid format
})

test('Admin: Should validate partner name', async ({page}) => {
  // Test: Required field
  // Test: Max length
})

test('Admin: Should validate partner description', async ({page}) => {
  // Test: Required field
  // Test: Min/max length
})

test('Admin: Should allow partner logo upload', async ({page}) => {
  // Test: Upload image
  // Test: Validate format
  // Test: Show preview
})

test('Admin: Should select partner tier', async ({page}) => {
  // Test: Bronze
  // Test: Silver
  // Test: Gold
  // Test: Platinum
})

test('Admin: Should create partner account', async ({page}) => {
  // Test: Submit form
  // Test: Account created
  // Test: Email sent
})

test('Admin: Should assign partner sector', async ({page}) => {
  // Test: Select sector
  // Test: Save correctly
})

test('Admin: Should allow partner login', async ({page}) => {
  // Test: Use credentials
  // Test: Access partner dashboard
})

test('Admin: Should configure partner settings', async ({page}) => {
  // Test: Set quotas
  // Test: Set permissions
  // Test: Set features
})

test('Admin: Should display partner in list', async ({page}) => {
  // Test: Partner visible
  // Test: Status correct
  // Test: Tier displayed
})
```

### Create Event (12 tests)

```typescript
test('Admin: Should navigate to create event', async ({page}) => {
  // Route: /admin/create-event
})

test('Admin: Should display event form', async ({page}) => {
  // Test: All fields visible
})

test('Admin: Should validate event name', async ({page}) => {
  // Test: Required
  // Test: Max length
})

test('Admin: Should validate event dates', async ({page}) => {
  // Test: Start date required
  // Test: End date after start
  // Test: Valid format
})

test('Admin: Should validate event location', async ({page}) => {
  // Test: Location required
  // Test: Pavilion mapping
})

test('Admin: Should validate event capacity', async ({page}) => {
  // Test: Numeric
  // Test: Min value
})

test('Admin: Should allow event description', async ({page}) => {
  // Test: Long text
  // Test: Formatting
  // Test: Link insertion
})

test('Admin: Should allow speaker assignment', async ({page}) => {
  // Test: Add multiple speakers
  // Test: Remove speakers
  // Test: Validate speaker exists
})

test('Admin: Should set event visibility', async ({page}) => {
  // Test: Public/Private toggle
  // Test: Registration settings
})

test('Admin: Should create event', async ({page}) => {
  // Test: Submit form
  // Test: Event created
  // Test: Appears in list
})

test('Admin: Should auto-publish event', async ({page}) => {
  // Test: Event visible to visitors
  // Test: Registration available
})

test('Admin: Should send event notifications', async ({page}) => {
  // Test: Speakers notified
  // Test: Partners notified
  // Test: Exhibitors notified
})
```

### Create News (12 tests)

```typescript
test('Admin: Should navigate to create news', async ({page}) => {
  // Route: /admin/create-news
})

test('Admin: Should display news form', async ({page}) => {
  // Test: All fields visible
})

test('Admin: Should validate article title', async ({page}) => {
  // Test: Required
  // Test: Max length
})

test('Admin: Should validate article content', async ({page}) => {
  // Test: Required
  // Test: Min 100 chars
  // Test: Rich text editor
})

test('Admin: Should allow featured image', async ({page}) => {
  // Test: Upload image
  // Test: Crop/resize
  // Test: Preview
})

test('Admin: Should allow article tags', async ({page}) => {
  // Test: Add multiple tags
  // Test: Remove tags
  // Test: Suggest existing
})

test('Admin: Should set publication date', async ({page}) => {
  // Test: Immediate publish
  // Test: Schedule for later
  // Test: Auto-publish validation
})

test('Admin: Should create article', async ({page}) => {
  // Test: Submit form
  // Test: Article created
  // Test: Appears in news list
})

test('Admin: Should generate audio version', async ({page}) => {
  // Test: Audio generation starts
  // Test: Audio file created
  // Test: Available for play
})

test('Admin: Should set article category', async ({page}) => {
  // Test: Select category
  // Test: Multiple categories
})

test('Admin: Should allow article preview', async ({page}) => {
  // Test: Preview modal
  // Test: Show as published
})

test('Admin: Should send article notifications', async ({page}) => {
  // Test: Email subscribers
  // Test: In-app notifications
})
```

### Create User (9 tests)

```typescript
test('Admin: Should navigate to create user', async ({page}) => {
  // Route: /admin/users/create
})

test('Admin: Should display user form', async ({page}) => {
  // Test: All fields visible
})

test('Admin: Should validate user email', async ({page}) => {
  // Test: Unique
  // Test: Valid format
})

test('Admin: Should validate user role', async ({page}) => {
  // Test: Admin role
  // Test: Moderator role
  // Test: Support role
})

test('Admin: Should validate user name', async ({page}) => {
  // Test: Required
  // Test: Max length
})

test('Admin: Should set user permissions', async ({page}) => {
  // Test: Per-role permissions
  // Test: Custom permissions
})

test('Admin: Should create user account', async ({page}) => {
  // Test: Submit form
  // Test: Account created
  // Test: Email sent with credentials
})

test('Admin: Should allow password reset', async ({page}) => {
  // Test: Send reset email
  // Test: User resets password
})

test('Admin: Should display user in list', async ({page}) => {
  // Test: User visible
  // Test: Role displayed
  // Test: Status shown
})
```

### Admin Dashboard Tests (4 tests)

```typescript
test('Admin: Should load admin dashboard', async ({page}) => {
  // Route: /admin/dashboard
  // Test: All metrics load
})

test('Admin: Should display system metrics', async ({page}) => {
  // Test: User count
  // Test: Event count
  // Test: Revenue
  // Test: Uptime
})

test('Admin: Should show pending validations', async ({page}) => {
  // Test: Count badge
  // Test: Link to validation page
})

test('Admin: Should show moderation queue', async ({page}) => {
  // Test: Count badge
  // Test: Link to moderation
})
```

### Validation & Moderation (6 tests)

```typescript
test('Admin: Should navigate to validation page', async ({page}) => {
  // Route: /admin/validation
})

test('Admin: Should display pending exhibitors', async ({page}) => {
  // Test: List visible
  // Test: Status badges
})

test('Admin: Should approve exhibitor', async ({page}) => {
  // Test: Click approve
  // Test: Exhibitor activated
  // Test: Email sent
})

test('Admin: Should reject exhibitor', async ({page}) => {
  // Test: Click reject
  // Test: Reason required
  // Test: Email sent
})

test('Admin: Should navigate to moderation', async ({page}) => {
  // Route: /admin/moderation
})

test('Admin: Should moderate content', async ({page}) => {
  // Test: Flag/unflag content
  // Test: Delete inappropriate content
  // Test: Warn user
})
```

---

## 🟠 PHASE 3: PARTENAIRES (40 tests) - 1 JOUR

### Partner Dashboard (5 tests)

```typescript
test('Partner: Should load partner dashboard', async ({page}) => {
  // Route: /partner/dashboard
  // Test: All sections load
})

test('Partner: Should display partner metrics', async ({page}) => {
  // Test: Visitors count
  // Test: Leads count
  // Test: Events count
  // Test: Revenue
})

test('Partner: Should show upcoming events', async ({page}) => {
  // Test: Events list
  // Test: Dates visible
})

test('Partner: Should show recent leads', async ({page}) => {
  // Test: Leads list
  // Test: Contact info
})

test('Partner: Should display partner tier benefits', async ({page}) => {
  // Test: Current benefits
  // Test: Upgrade button
})
```

### Partner Activity (5 tests)

```typescript
test('Partner: Should navigate to activity page', async ({page}) => {
  // Route: /partner/activity
})

test('Partner: Should display activity log', async ({page}) => {
  // Test: Chronological order
  // Test: Full details
})

test('Partner: Should filter activity by type', async ({page}) => {
  // Test: Filter by action
  // Test: Filter by date
})

test('Partner: Should search activity', async ({page}) => {
  // Test: Search by keyword
  // Test: Results filtered
})

test('Partner: Should export activity', async ({page}) => {
  // Test: Download CSV
  // Test: Download PDF
})
```

### Partner Analytics (5 tests)

```typescript
test('Partner: Should navigate to analytics', async ({page}) => {
  // Route: /partner/analytics
})

test('Partner: Should display visitor analytics', async ({page}) => {
  // Test: Chart displays
  // Test: Date range selectable
  // Test: Metrics accurate
})

test('Partner: Should show conversion metrics', async ({page}) => {
  // Test: Leads/visitors ratio
  // Test: Conversion rate
})

test('Partner: Should allow date filtering', async ({page}) => {
  // Test: Custom date range
  // Test: Preset ranges
  // Test: Data updates
})

test('Partner: Should export analytics report', async ({page}) => {
  // Test: PDF download
  // Test: CSV download
  // Test: Report formatted
})
```

### Partner Leads (5 tests)

```typescript
test('Partner: Should navigate to leads page', async ({page}) => {
  // Route: /partner/leads
})

test('Partner: Should display leads list', async ({page}) => {
  // Test: All leads shown
  // Test: Contact info visible
  // Test: Status badges
})

test('Partner: Should filter leads by status', async ({page}) => {
  // Test: New
  // Test: Contacted
  // Test: Qualified
  // Test: Converted
})

test('Partner: Should contact lead', async ({page}) => {
  // Test: Email button
  // Test: Phone button
  // Test: Message button
})

test('Partner: Should update lead status', async ({page}) => {
  // Test: Mark as contacted
  // Test: Mark as qualified
  // Test: Mark as converted
})
```

### Partner Events (5 tests)

```typescript
test('Partner: Should navigate to partner events', async ({page}) => {
  // Route: /partner/events
})

test('Partner: Should display upcoming events', async ({page}) => {
  // Test: Events list
  // Test: Date order
})

test('Partner: Should display event details', async ({page}) => {
  // Test: Full info
  // Test: Speakers
  // Test: Location
})

test('Partner: Should register for event', async ({page}) => {
  // Test: Click register
  // Test: Confirmation
  // Test: Calendar added
})

test('Partner: Should unregister from event', async ({page}) => {
  // Test: Click unregister
  // Test: Confirmation
})
```

### Partner Media (5 tests)

```typescript
test('Partner: Should navigate to media page', async ({page}) => {
  // Route: /partner/media
})

test('Partner: Should display media library', async ({page}) => {
  // Test: Images shown
  // Test: Videos shown
  // Test: PDFs shown
})

test('Partner: Should upload media', async ({page}) => {
  // Test: Select file
  // Test: Upload progress
  // Test: File appears in library
})

test('Partner: Should delete media', async ({page}) => {
  // Test: Click delete
  // Test: Confirmation
  // Test: File removed
})

test('Partner: Should organize media', async ({page}) => {
  // Test: Create folders
  // Test: Move files
  // Test: Tag files
})
```

### Partner Networking (5 tests)

```typescript
test('Partner: Should navigate to networking', async ({page}) => {
  // Route: /partner/networking
})

test('Partner: Should display available partners', async ({page}) => {
  // Test: Partners list
  // Test: Filter by sector
  // Test: Filter by tier
})

test('Partner: Should view partner profile', async ({page}) => {
  // Test: Click on partner
  // Test: Full details shown
})

test('Partner: Should connect with partner', async ({page}) => {
  // Test: Click connect
  // Test: Request sent
  // Test: Status badge updated
})

test('Partner: Should message partner', async ({page}) => {
  // Test: Click message
  // Test: Chat opens
  // Test: Message sent
})
```

---

## 🟡 PHASE 4: AUTRES FONCTIONNALITÉS (100 tests) - 2 JOURS

### Chat (15 tests)
### Appointments/Calendar (15 tests)
### Minisite Creation (20 tests)
### Minisite Editor (25 tests)
### Badge/QR (15 tests)
### News Management (10 tests)

---

## 📊 TOTAL

**Phase 1**: 50 tests (Paiement)
**Phase 2**: 60 tests (Admin)
**Phase 3**: 40 tests (Partenaires)
**Phase 4**: 100 tests (Autres)

**TOTAL**: 250 tests

**Temps total**: 4-5 jours

---

**Ne pas créer de fichiers doc, créer SEULEMENT des tests**
