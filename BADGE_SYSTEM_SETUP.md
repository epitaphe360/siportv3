# Badge System - Setup Instructions

## Overview
The badge system generates QR code badges for all users (visitors, exhibitors, partners) with automatic generation via database triggers.

## Features
- ✅ Automatic badge generation on user creation
- ✅ QR code with unique badge code (format: PREFIX-SUFFIX)
- ✅ Badge scanning with counter tracking
- ✅ Access level management (standard, vip, exhibitor, partner, admin)
- ✅ Validity period (3 days for attendees, 1 year for admins)
- ✅ RLS policies for security

## Database Migrations

### Option 1: Apply via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Navigate to your project at https://supabase.com
   - Go to SQL Editor

2. **Execute migrations in order:**

   **Step 1:** Copy and execute `supabase/migrations/20251217000001_create_user_badges.sql`
   - Creates `user_badges` table
   - Creates badge generation functions
   - Sets up RLS policies

   **Step 2:** Copy and execute `supabase/migrations/20251217000002_auto_generate_badges.sql`
   - Creates automatic badge generation triggers
   - Triggers on user INSERT/UPDATE
   - Triggers on exhibitor/partner profile changes

3. **Verify installation:**
   ```sql
   -- Check if table exists
   SELECT * FROM user_badges LIMIT 1;

   -- Check if functions exist
   SELECT proname FROM pg_proc WHERE proname LIKE '%badge%';
   ```

### Option 2: Apply via Supabase CLI

```bash
# If you have Supabase CLI configured
npx supabase db push
```

### Option 3: Combined SQL File

A combined SQL file is available for convenience:
```bash
/tmp/badge_migrations_combined.sql
```

You can copy this entire file and execute it in the Supabase SQL Editor.

## Badge Access Levels

| User Type | Level | Access Level | Validity |
|-----------|-------|--------------|----------|
| Visitor FREE | `free` | `standard` | 3 days |
| Visitor VIP | `premium` | `vip` | 3 days |
| Exhibitor | N/A | `exhibitor` | 3 days |
| Partner | N/A | `partner` | 3 days |
| Admin | N/A | `admin` | 1 year |

## Automatic Badge Generation

Badges are automatically generated when:

1. **New User Registration** (status = active)
   - Visitor: Badge with `standard` or `vip` access
   - Exhibitor/Partner: Badge with respective access level

2. **Visitor Level Change**
   - FREE → VIP: Badge updated to `vip` access
   - VIP → FREE: Badge updated to `standard` access

3. **Profile Updates**
   - Name, company, position, phone, avatar changes
   - Badge information automatically synchronized

4. **Exhibitor/Partner Profile Changes**
   - Company name updates
   - Stand number changes (exhibitors only)

## Badge Code Format

Badge codes follow the pattern: `PREFIX-SUFFIX`
- **PREFIX**: First 6 characters of user ID (uppercase, no hyphens)
- **SUFFIX**: Random 6-character hash (uppercase)
- **Example**: `A1B2C3-D4E5F6`

## QR Code Data

Each badge contains a JSON payload in the QR code:
```json
{
  "user_id": "uuid",
  "badge_code": "PREFIX-SUFFIX",
  "user_type": "visitor|exhibitor|partner|admin",
  "access_level": "standard|vip|exhibitor|partner|admin",
  "generated_at": "2025-12-17T12:00:00Z"
}
```

## Badge Scanning

Use the `scan_badge()` function to scan and validate badges:

```sql
SELECT * FROM scan_badge('A1B2C3-D4E5F6');
```

This function:
- ✅ Increments scan counter
- ✅ Updates `last_scanned_at` timestamp
- ✅ Validates badge is active
- ✅ Validates badge hasn't expired
- ❌ Throws error if badge not found/inactive/expired

## Security (RLS Policies)

- ✅ Users can view/update their own badges
- ✅ Admins can view/manage all badges
- ✅ Badge creation restricted to badge owners
- ✅ All operations logged with timestamps

## Integration with Frontend

### Badge Display Component
Location: `src/pages/BadgePage.tsx`
- Generates QR code using `qrcode.react`
- Downloads badge as PNG using `html2canvas`
- Shows user information and access level

### Badge Service
Location: `src/services/badgeService.ts` (to be created)
- Fetch user badge
- Generate badge data
- Download badge image

## Testing

After applying migrations, test badge generation:

```sql
-- Test badge generation for a user
SELECT upsert_user_badge(
  p_user_id := 'user-uuid-here',
  p_user_type := 'visitor',
  p_user_level := 'premium',
  p_full_name := 'John Doe',
  p_company_name := 'Tech Corp',
  p_email := 'john@example.com'
);

-- Verify badge was created
SELECT * FROM user_badges WHERE user_id = 'user-uuid-here';

-- Test badge scanning
SELECT * FROM scan_badge('generated-badge-code');
```

## Troubleshooting

### Issue: Badges not auto-generating
**Solution:** Check if triggers are enabled:
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%badge%';
```

### Issue: RLS blocking access
**Solution:** Verify user authentication and RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_badges';
```

### Issue: Badge code conflicts
**Solution:** The `generate_badge_code()` function has built-in retry logic (10 attempts). If issues persist, check for data corruption.

## Next Steps

1. ✅ Apply database migrations
2. ⬜ Create badge service (`src/services/badgeService.ts`)
3. ⬜ Update BadgePage component to fetch from database
4. ⬜ Create badge download functionality
5. ⬜ Implement badge scanner app/page
6. ⬜ Test end-to-end badge generation flow

## Support

For issues or questions:
- Check Supabase logs in Dashboard
- Review migration files for detailed SQL
- Contact development team
