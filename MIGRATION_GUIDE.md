# Guide de Migration: Intégration Complète des Niveaux et Quotas

## ✅ Déjà Complété

### Dashboards (100% ✓)
- [x] **VisitorDashboard** - Badge FREE/VIP + Quotas RDV
- [x] **PartnerDashboard** - Badge Museum/Silver/Gold/Platinium + Quotas complets
- [x] **ExhibitorDashboard** - Badge 9m²/18m²/36m²/54m²+ + Quotas complets

### Composants (100% ✓)
- [x] **QuotaWidget** - Affichage quotas avec progress bars
- [x] **LevelBadge** - Badges visuels tous types
- [x] **QuotaSummaryCard** - Carte récapitulative quotas
- [x] **Progress** - Barre de progression

### Configuration (100% ✓)
- [x] **partnerTiers.ts** - 4 niveaux partenaires complets
- [x] **exhibitorQuotas.ts** - 4 tailles stands complets
- [x] **quotas.ts** - Visiteurs FREE/VIP
- [x] **partnerPaymentService.ts** - Paiements partenaires
- [x] **paymentService.ts** - Paiements visiteurs

### Pages (100% ✓)
- [x] **VisitorUpgradePage** - Comparaison FREE vs VIP
- [x] **PartnerUpgradePage** - Comparaison 4 tiers
- [x] **VisitorPaymentPage** - Paiement multi-gateway
- [x] **BadgeScannerPage** - Scanner QR codes

### Migrations SQL (100% ✓)
- [x] **20251217000003_add_user_levels_and_quotas.sql** - Tables et fonctions RPC

---

## ⏳ À Compléter

### 1. Pages de Liste (30% fait)

#### **PartnersPage.tsx** (À METTRE À JOUR)

**Problème actuel:**
```typescript
// Ancien système
type: 'platinum' | 'gold' | 'silver' | 'bronze' | 'institutional'
sponsorshipLevel: string  // 'organisateur', 'platine', 'or', 'argent', 'bronze'
```

**Solution à implémenter:**
```typescript
// Nouveau système
import { LevelBadge } from '../components/common/QuotaWidget';
import { getPartnerTierConfig } from '../config/partnerTiers';

// Dans la carte partenaire:
<LevelBadge
  level={partner.partner_tier || 'museum'}
  type="partner"
  size="md"
/>

// Stats à mettre à jour:
const stats = {
  museum: data.filter(p => p.partner_tier === 'museum').length,
  silver: data.filter(p => p.partner_tier === 'silver').length,
  gold: data.filter(p => p.partner_tier === 'gold').length,
  platinium: data.filter(p => p.partner_tier === 'platinium').length,
  total: data.length
};
```

**Fichiers à modifier:**
- `src/pages/PartnersPage.tsx` (ligne 11-27, 59-66, 257-296, 337-400)
- `src/pages/PartnerDetailPage.tsx` (afficher badge + quotas)

---

#### **ExhibitorsPage.tsx** (À METTRE À JOUR)

**Solution à implémenter:**
```typescript
import { LevelBadge } from '../components/common/QuotaWidget';
import { getExhibitorLevelByArea } from '../config/exhibitorQuotas';

// Dans la carte exposant:
<LevelBadge
  level={getExhibitorLevelByArea(exhibitor.stand_area || 9)}
  type="exhibitor"
  size="sm"
/>

// Filtres à ajouter:
const [selectedLevel, setSelectedLevel] = useState<string>('');

const filtered = exhibitors.filter(exhibitor => {
  const level = getExhibitorLevelByArea(exhibitor.stand_area || 9);
  const matchesLevel = !selectedLevel || level === selectedLevel;
  return matchesSearch && matchesCategory && matchesLevel;
});

// Options de filtre:
<select onChange={(e) => setSelectedLevel(e.target.value)}>
  <option value="">Toutes les surfaces</option>
  <option value="basic_9">9m² Basic</option>
  <option value="standard_18">18m² Standard</option>
  <option value="premium_36">36m² Premium</option>
  <option value="elite_54plus">54m²+ Elite</option>
</select>
```

**Fichiers à modifier:**
- `src/pages/ExhibitorsPage.tsx`
- `src/pages/ExhibitorDetailPage.tsx`

---

#### **NetworkingPage.tsx** (À METTRE À JOUR)

**Solution à implémenter:**
```typescript
import { LevelBadge } from '../components/common/QuotaWidget';

// Dans la liste des visiteurs:
{user.type === 'visitor' && (
  <LevelBadge
    level={user.visitor_level || 'free'}
    type="visitor"
    size="sm"
  />
)}

// Filtres visiteurs:
const [visitorLevelFilter, setVisitorLevelFilter] = useState<string>('');

// Afficher icône VIP dans résultats:
{user.visitor_level === 'premium' && (
  <Crown className="h-4 w-4 text-yellow-500" />
)}
```

**Fichiers à modifier:**
- `src/pages/NetworkingPage.tsx`

---

### 2. Pages de Profil (0% fait)

#### **VisitorProfileSettings.tsx**

**Section à ajouter:**
```typescript
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
    <span>Mon Niveau</span>
    <LevelBadge level={user.visitor_level} type="visitor" />
  </h3>

  {user.visitor_level === 'free' ? (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-blue-900 mb-3">
        Passez au niveau VIP pour débloquer toutes les fonctionnalités !
      </p>
      <ul className="space-y-2 mb-4">
        <li className="flex items-center text-sm text-blue-800">
          <Check className="h-4 w-4 mr-2" />
          10 rendez-vous B2B actifs
        </li>
        <li className="flex items-center text-sm text-blue-800">
          <Check className="h-4 w-4 mr-2" />
          Accès complet dashboard
        </li>
        <li className="flex items-center text-sm text-blue-800">
          <Check className="h-4 w-4 mr-2" />
          Badge VIP premium
        </li>
      </ul>
      <Link to={ROUTES.VISITOR_UPGRADE}>
        <Button variant="default" className="w-full">
          <Crown className="h-4 w-4 mr-2" />
          Passer au VIP - 700€
        </Button>
      </Link>
    </div>
  ) : (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <p className="text-green-900 font-medium mb-2">
        ✓ Vous êtes VIP !
      </p>
      <p className="text-sm text-green-700">
        Vous bénéficiez de tous les avantages premium du SIPORT 2026.
      </p>
    </div>
  )}

  <QuotaSummaryCard
    title="Vos Quotas Actuels"
    level={user.visitor_level}
    type="visitor"
    quotas={[...]}
  />
</Card>
```

---

#### **PartnerProfileEdit.tsx** (À CRÉER)

**Fichier à créer: `src/pages/partner/PartnerProfileEdit.tsx`**

```typescript
export default function PartnerProfileEdit() {
  const { user } = useAuthStore();
  const partnerTier = user.partner_tier || 'museum';
  const tierConfig = getPartnerTierConfig(partnerTier);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Profil Partenaire</h1>
        <LevelBadge level={partnerTier} type="partner" size="lg" />
      </div>

      {/* Tier Info Card */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {tierConfig.displayName}
            </h3>
            <p className="text-gray-600 mb-4">
              Prix: ${tierConfig.price.toLocaleString()}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {tierConfig.quotas.appointments === -1 ? '∞' : tierConfig.quotas.appointments} RDV
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {tierConfig.quotas.teamMembers} équipe
              </span>
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {tierConfig.quotas.mediaUploads} média
              </span>
            </div>
          </div>

          {canUpgradeTo(partnerTier, 'platinium') && (
            <Link to="/partner/upgrade">
              <Button variant="default">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrader
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Quota Summary */}
      <QuotaSummaryCard {...} />

      {/* Profile Form */}
      <Card className="p-6">
        {/* Formulaire édition profil */}
      </Card>
    </div>
  );
}
```

---

#### **ExhibitorProfileEdit.tsx**

**Section à ajouter:**
```typescript
<Card className="p-6 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Mon Stand</h3>
    <LevelBadge
      level={getExhibitorLevelByArea(profile.stand_area || 9)}
      type="exhibitor"
      size="lg"
    />
  </div>

  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Surface du stand</label>
        <div className="text-2xl font-bold text-blue-900">
          {profile.stand_area || 9}m²
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Niveau</label>
        <div className="text-lg font-semibold text-blue-900">
          {getExhibitorQuotaConfig(getExhibitorLevelByArea(profile.stand_area || 9)).displayName}
        </div>
      </div>
    </div>
  </div>

  <QuotaSummaryCard
    title="Vos Quotas Exposant"
    level={getExhibitorLevelByArea(profile.stand_area || 9)}
    type="exhibitor"
    quotas={[...]}
  />

  <p className="text-sm text-gray-600 mt-4">
    💡 La surface de votre stand est fixée lors de l'inscription.
    Pour modifier, contactez l'administration.
  </p>
</Card>
```

---

### 3. Mini-Sites (0% fait)

#### **MiniSitePreview.tsx**

**Afficher le badge partenaire sur le mini-site:**
```typescript
// Dans le header du mini-site:
{miniSite.partner_tier && (
  <div className="absolute top-4 right-4">
    <LevelBadge
      level={miniSite.partner_tier}
      type="partner"
      size="lg"
    />
  </div>
)}

// Section "À propos du partenaire":
<Card className="p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-semibold">Partenaire Officiel</h3>
    <LevelBadge level={miniSite.partner_tier} type="partner" />
  </div>

  <div className="space-y-3">
    {tierConfig.features.map(feature => (
      <div key={feature} className="flex items-center text-sm">
        <Check className="h-4 w-4 text-green-600 mr-2" />
        <span>{feature}</span>
      </div>
    ))}
  </div>
</Card>
```

---

### 4. Endpoints RPC Supplémentaires (50% fait)

**Fonctions déjà créées dans migration SQL:**
- [x] `get_user_quota(user_id, quota_type)` - Retourne limite quota
- [x] `get_quota_usage(user_id, quota_type, period)` - Retourne usage actuel
- [x] `check_quota_available(user_id, quota_type, increment)` - Vérifie disponibilité
- [x] `increment_quota_usage(user_id, quota_type, increment, period)` - Incrémente usage
- [x] `reset_expired_quotas()` - Reset quotas expirés (CRON)

**Fonctions supplémentaires à créer:**

```sql
-- Obtenir tous les quotas d'un utilisateur avec usage actuel
CREATE OR REPLACE FUNCTION get_user_all_quotas(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_user_type text;
BEGIN
  SELECT type INTO v_user_type FROM users WHERE id = p_user_id;

  SELECT jsonb_object_agg(
    quota_type,
    jsonb_build_object(
      'limit', get_user_quota(p_user_id, quota_type),
      'current', get_quota_usage(p_user_id, quota_type, 'monthly'),
      'available', get_user_quota(p_user_id, quota_type) - get_quota_usage(p_user_id, quota_type, 'monthly')
    )
  ) INTO v_result
  FROM (
    SELECT DISTINCT quota_type FROM quota_usage WHERE user_id = p_user_id
    UNION
    SELECT 'appointments'
    UNION
    SELECT 'team_members'
    UNION
    SELECT 'media_uploads'
  ) q;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 5. CRON Job pour Reset Quotas

**Fichier à créer: `supabase/functions/reset-quotas-cron/index.ts`**

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Reset quotas expirés
  const { data, error } = await supabase.rpc('reset_expired_quotas');

  if (error) {
    console.error('Error resetting quotas:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log(`Reset ${data} expired quotas`);

  return new Response(JSON.stringify({
    success: true,
    quotas_reset: data
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**Configuration CRON dans Supabase:**
```
0 0 * * * # Tous les jours à minuit
curl -X POST https://xxxxx.supabase.co/functions/v1/reset-quotas-cron \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

---

## 📋 Checklist de Migration

### Priorité 1 (Critique) ✅
- [x] Dashboards mis à jour
- [x] Composants quotas créés
- [x] Configuration quotas complète
- [x] Migrations SQL créées

### Priorité 2 (Important) ⏳
- [ ] Appliquer migrations SQL à Supabase
- [ ] PartnersPage avec nouveaux badges
- [ ] ExhibitorsPage avec badges niveaux
- [ ] Pages profil avec sections quotas

### Priorité 3 (Utile) ⏳
- [ ] NetworkingPage badges visiteurs
- [ ] Mini-sites affichage niveaux
- [ ] Filtres par niveau dans listes
- [ ] CRON job reset quotas

### Priorité 4 (Nice to have) ⏳
- [ ] Analytics par niveau
- [ ] Exports leads avec quotas
- [ ] Notifications quota atteint
- [ ] Rapports usage quotas

---

## 🚀 Commandes de Déploiement

```bash
# 1. Appliquer migrations SQL
# Via Supabase Dashboard → SQL Editor
# Copier/coller: supabase/migrations/20251217000003_add_user_levels_and_quotas.sql

# 2. Tester les fonctions RPC
SELECT get_user_quota('user-id', 'appointments');
SELECT get_quota_usage('user-id', 'appointments', 'monthly');
SELECT check_quota_available('user-id', 'appointments', 1);

# 3. Déployer Edge Function CRON
npx supabase functions deploy reset-quotas-cron

# 4. Tester en local
npm run dev

# 5. Build production
npm run build
```

---

## 📊 Estimation Temps Restant

| Tâche | Temps | Priorité |
|-------|-------|----------|
| Appliquer migrations SQL | 10 min | P1 |
| Mettre à jour PartnersPage | 30 min | P2 |
| Mettre à jour ExhibitorsPage | 30 min | P2 |
| Ajouter sections profils | 1h | P2 |
| Mini-sites niveaux | 45 min | P3 |
| Filtres listes | 30 min | P3 |
| CRON job quotas | 20 min | P3 |

**Total estimé: ~4h de développement**

---

## 💡 Notes Importantes

1. **Migrations SQL** - À appliquer en PREMIER avant tout test
2. **Backward Compatibility** - Ancien système (`sponsorshipLevel`) coexiste avec nouveau (`partner_tier`)
3. **Performance** - Index créés sur toutes les colonnes de recherche
4. **Sécurité** - RLS activé sur toutes les nouvelles tables
5. **CRON** - Nécessaire pour reset quotas journaliers/mensuels
