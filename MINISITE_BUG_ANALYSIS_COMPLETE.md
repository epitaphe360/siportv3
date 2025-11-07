# RAPPORT COMPLET D'ANALYSE - MINI SITE WEB SIPORTS

## 1. FICHIERS DU MINI SITE WEB

### Frontend Components
- `/home/user/siportv3/src/components/minisite/MiniSiteEditor.tsx` - Éditeur mini-site
- `/home/user/siportv3/src/components/minisite/MiniSitePreview.tsx` - Aperçu mini-site
- `/home/user/siportv3/src/components/minisite/MiniSiteBuilder.tsx` - Constructeur mini-site
- `/home/user/siportv3/src/components/minisite/MiniSiteGalleryManager.tsx` - Gestionnaire galerie
- `/home/user/siportv3/src/components/minisite/MiniSiteWizard.tsx` - Assistant mini-site
- `/home/user/siportv3/src/components/minisite/MiniSiteHeroEditor.tsx` - Éditeur hero
- `/home/user/siportv3/src/components/minisite/MiniSitePreviewModal.tsx` - Modal aperçu
- `/home/user/siportv3/src/components/minisite/editor/` - Composants éditeur (utils, types, etc.)

### Backend Services
- `/home/user/siportv3/src/services/supabaseService.ts` - Service Supabase (getMiniSite, updateMiniSite, incrementMiniSiteViews)
- `/home/user/siportv3/src/services/apiService.ts` - Service API public (read-only)
- `/home/user/siportv3/server/create-mini-site.js` - Serveur création mini-site
- `/home/user/siportv3/server/exhibitors-server.js` - Serveur exposants public
- `/home/user/siportv3/server/metrics-server.js` - Serveur métriques

### Data Models & Types
- `/home/user/siportv3/src/types/index.ts` - Types TypeScript (Exhibitor, Partner, MiniSite, etc.)

---

## 2. MODÈLES DE DONNÉES

### Modèle Exhibitor (TypeScript)
```typescript
interface Exhibitor {
  id: string;
  userId: string;
  companyName: string;
  category: ExhibitorCategory;
  sector: string;
  description: string;
  logo?: string;
  website?: string;
  products: Product[];
  miniSite: MiniSite | null;
  verified: boolean;
  featured: boolean;
  contactInfo: ContactInfo;
}
```

### Modèle Partner (TypeScript)
```typescript
interface Partner {
  id: string;
  userId: string;
  organizationName: string;
  partnerType: 'institutional' | 'platinum' | 'gold' | 'silver' | 'bronze';
  sector: string;
  country: string;
  website?: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactPosition: string;
  sponsorshipLevel: string;
  verified: boolean;
  featured: boolean;
}
```

### Modèle MiniSite (Database vs TypeScript)
**Database (actual)**:
```
- id: UUID
- exhibitor_id: UUID
- theme: string (e.g., 'default')
- custom_colors: JSON/JSONB (Record<string, string>)
- sections: JSON/JSONB (array of sections)
- published: boolean
- views: integer
- last_updated: timestamp
```

**TypeScript (MiniSitePreview.tsx)** ❌ INCORRECT:
```typescript
interface MiniSiteData {
  id: string;
  exhibitor_id: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  sections: any[];
  published: boolean;
  views: number;
  last_updated: string;
}
```

**Section Structure**:
```typescript
interface Section {
  type: 'hero' | 'about' | 'products' | 'gallery' | 'contact' | 'news';
  title: string;
  content: any; // Contains properties like backgroundImage, title, subtitle, etc.
  visible: boolean;
  order: number;
}
```

---

## 3. ROUTES API & ENDPOINTS

### Public API (apiService.ts)
- **GET** `/api/exhibitors` - Récupère tous les exposants
- **GET** `/api/exhibitors/{id}` - Récupère un exposant par ID
- **GET** `/api/partners` - Récupère tous les partenaires
- **GET** `/api/partners/{id}` - Récupère un partenaire par ID
- **GET** `/api/mini_sites` - Récupère tous les mini-sites
- **GET** `/api/mini_sites/{id}` - Récupère un mini-site par ID

### Backend Servers
- **POST** `http://localhost:4000/create-mini-site` - Créer mini-site
- **GET** `http://localhost:4002/exhibitors` - Récupère exposants (authentifiés)

### Supabase Service Methods
- `getMiniSite(exhibitorId)` - Récupère mini-site
- `updateMiniSite(exhibitorId, data)` - Met à jour mini-site
- `getExhibitorProducts(exhibitorId)` - Récupère produits exposant
- `incrementMiniSiteViews(exhibitorId)` - Incrémente vues
- `getExhibitorForMiniSite(exhibitorId)` - Récupère données exposant

---

## 4. BUGS DÉTECTÉS - RAPPORT COMPLET

### BUG #1 - STRUCTURE DE DONNÉES INCOHÉRENTE (CRITIQUE)
**Localisation**: `/home/user/siportv3/src/components/minisite/MiniSitePreview.tsx` (lignes 30-43, 177-182, 223)
**Sévérité**: CRITIQUE ⚠️
**Type**: Data Structure Mismatch

**Problème**:
- Interface `MiniSiteData` ligne 30-43 attendus que `theme` soit un objet:
  ```
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  }
  ```
- Mais la base de données stocke `theme` comme une string ('default')
- Les couleurs sont dans `custom_colors` (Record<string, string>)

**Code problématique** (ligne 177-182):
```typescript
const theme = miniSiteData.theme || {
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  fontFamily: 'Inter'
};
```

**Résultat**: Crash à ligne 223:
```typescript
${theme.primaryColor}, ${theme.secondaryColor}
```
`theme.primaryColor` sera undefined car `miniSiteData.theme` est une string.

**Correction**:
```typescript
// Créer l'objet theme à partir de custom_colors et theme string
const theme = {
  primaryColor: miniSiteData.custom_colors?.primaryColor || '#1e40af',
  secondaryColor: miniSiteData.custom_colors?.secondaryColor || '#3b82f6',
  accentColor: miniSiteData.custom_colors?.accentColor || '#60a5fa',
  fontFamily: miniSiteData.custom_colors?.fontFamily || 'Inter'
};
```

---

### BUG #2 - MAUVAIS ACCESSEUR DE PROPRIÉTÉ (CRITIQUE)
**Localisation**: `/home/user/siportv3/src/components/minisite/MiniSitePreview.tsx` (lignes 137-140, 221-269)
**Sévérité**: CRITIQUE ⚠️
**Type**: Wrong Property Accessor

**Problème**:
La fonction `getSection` (ligne 137-140):
```typescript
const getSection = (sectionName: string) => {
  if (!miniSiteData?.sections) return null;
  return miniSiteData.sections.find((s: any) => s.type === sectionName);
};
```
Retourne: `{ type: 'hero', title: '...', content: {...}, visible, order }`

Mais le code accède via `.data` au lieu de `.content`:

**Locations des bugs**:
| Ligne | Code actuel (FAUX) | Devrait être |
|-------|-------------------|-------------|
| 221 | `heroSection.data?.backgroundImage` | `heroSection.content?.backgroundImage` |
| 222 | `heroSection.data.backgroundImage` | `heroSection.content.backgroundImage` |
| 245 | `heroSection.data?.title` | `heroSection.content?.title` |
| 253 | `heroSection.data?.subtitle` | `heroSection.content?.subtitle` |
| 255 | `heroSection.data?.ctaText` | `heroSection.content?.ctaText` |
| 265 | `heroSection.data.ctaLink` | `heroSection.content.ctaLink` |
| 269 | `heroSection.data.ctaText` | `heroSection.content.ctaText` |
| 288 | `aboutSection.data?.title` | `aboutSection.content?.title` |
| 290 | `aboutSection.data?.description` | `aboutSection.content?.description` |
| 291 | `aboutSection.data?.description` | `aboutSection.content?.description` |

**Résultat**: Tous les champs seront `undefined`, le rendu du mini-site échouera complètement.

**Correction**: Remplacer tous `.data?` par `.content?` dans le fichier.

---

### BUG #3 - MAUVAIS IDENTIFIANT UTILISÉ (CRITIQUE)
**Localisation**: `/home/user/siportv3/src/components/minisite/MiniSiteEditor.tsx` (lignes 359, 403)
**Sévérité**: CRITIQUE ⚠️
**Type**: Wrong Identifier Type

**Problème**:
`getMiniSite()` et `updateMiniSite()` attendent un `exhibitorId`, mais le code passe `user.id`.

**Code problématique** (ligne 359):
```typescript
const miniSite = await SupabaseService.getMiniSite(user.id);
```
Devrait être:
```typescript
const miniSite = await SupabaseService.getMiniSite(exhibitorId);
```

**Code problématique** (ligne 403):
```typescript
await SupabaseService.updateMiniSite(user.id, miniSiteData);
```
Devrait être:
```typescript
await SupabaseService.updateMiniSite(exhibitorId, miniSiteData);
```

**Résultat**:
- `getMiniSite` ferait: `.eq('exhibitor_id', user.id)`
- Aucun mini-site trouvé (l'exhibitor_id ≠ user.id)
- Message d'erreur: "Impossible de charger le mini-site"
- Les données ne seront jamais sauvegardées

**Correction**: Remplacer `user.id` par la variable `exhibitorId` (qui doit être disponible dans le contexte utilisateur).

**NOTE**: Il faut d'abord récupérer l'exhibitorId à partir du user.id:
```typescript
const exhibitor = await SupabaseService.getExhibitorByUserId(user.id);
const exhibitorId = exhibitor?.id;
```

---

### BUG #4 - VALIDATION INCOMPLÈTE DES PRODUITS
**Localisation**: `/home/user/siportv3/server/create-mini-site.js` (lignes 114-117)
**Sévérité**: MEDIUM 🔶
**Type**: Incomplete Validation

**Problème**:
```javascript
// Validate products array
if (products && (!Array.isArray(products) || products.length > 100)) {
  return res.status(400).json({ error: 'Invalid products array' });
}
```

Validation partielle:
- ✓ Vérifie si c'est un array
- ✓ Vérifie le nombre max (100)
- ✗ N'a PAS vérifié la structure de chaque produit
- ✗ N'a PAS vérifié les champs obligatoires (name, description, image)
- ✗ N'a PAS vérifié les longueurs de chaîne

**Correction**:
```javascript
if (products && Array.isArray(products)) {
  if (products.length > 100) {
    return res.status(400).json({ error: 'Products array too large (max 100)' });
  }
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (typeof p !== 'object' || p === null) {
      return res.status(400).json({ 
        error: `Product ${i}: must be an object` 
      });
    }
    if (!p.name || typeof p.name !== 'string' || p.name.length > 200) {
      return res.status(400).json({ 
        error: `Product ${i}: invalid name` 
      });
    }
    if (!p.description || typeof p.description !== 'string' || p.description.length > 5000) {
      return res.status(400).json({ 
        error: `Product ${i}: invalid description` 
      });
    }
  }
}
```

---

### BUG #5 - STRUCTURE DE SECTION INCORRECTE
**Localisation**: `/home/user/siportv3/server/create-mini-site.js` (lignes 151-156)
**Sévérité**: HIGH 🔴
**Type**: Wrong Data Structure

**Problème**:
Les sections créées ne correspondent pas à la structure attendue:

**Code actuel (FAUX)**:
```javascript
const sections = [
  { type: 'hero', content: { company, description, logo: logoUrl } },
  { type: 'products', content: { products } },
  { type: 'socials', content: { socials } },
  { type: 'documents', content: { documents } }
];
```

**Champs incorrects**:
- `company` → devrait être `title`
- `description` → devrait être `subtitle`
- `logo` → devrait être `backgroundImage`
- Manquent: `ctaText`, `ctaLink`, `visible`, `order`

**Correction**:
```javascript
const sections = [
  {
    id: Date.now().toString(),
    type: 'hero',
    title: 'Section Hero',
    content: {
      title: company,
      subtitle: description,
      backgroundImage: logoUrl,
      ctaText: 'En savoir plus',
      ctaLink: '#products'
    },
    visible: true,
    order: 0
  },
  {
    id: (Date.now() + 1).toString(),
    type: 'products',
    title: 'Produits & Services',
    content: {
      title: 'Nos Produits',
      products: products || []
    },
    visible: true,
    order: 1
  }
  // Optionnel: socials et documents
];
```

---

### BUG #6 - CUSTOM COLORS VIDES
**Localisation**: `/home/user/siportv3/server/create-mini-site.js` (ligne 161)
**Sévérité**: MEDIUM 🔶
**Type**: Invalid Initialization

**Problème**:
```javascript
custom_colors: {},
```
Les couleurs sont vides au lieu d'avoir les valeurs par défaut.

**Correction**:
```javascript
custom_colors: {
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  fontFamily: 'Inter'
},
```

---

### BUG #7 - VALIDATION MANQUANTE POUR SOCIALS/DOCUMENTS
**Localisation**: `/home/user/siportv3/server/create-mini-site.js` (lignes 85-120)
**Sévérité**: LOW 🟡
**Type**: Missing Validation

**Problème**:
Les champs `socials` et `documents` ne sont pas validés du tout.

**Correction**: Ajouter à `validateMiniSiteInput`:
```javascript
// Validate socials object
if (socials && typeof socials !== 'object') {
  return res.status(400).json({ error: 'Socials must be an object' });
}

// Validate documents array
if (documents && (!Array.isArray(documents) || documents.length > 50)) {
  return res.status(400).json({ error: 'Invalid documents array' });
}
```

---

### BUG #8 - MAUVAIS NOM DE PARAMÈTRE RPC
**Localisation**: `/home/user/siportv3/src/services/supabaseService.ts` (ligne 872)
**Sévérité**: MEDIUM 🔶
**Type**: Incorrect RPC Parameter

**Problème**:
```typescript
await safeSupabase.rpc('increment_view_count', { exhibitor_id_param: exhibitorId });
```

Le paramètre `exhibitor_id_param` peut ne pas correspondre au vrai paramètre de la fonction SQL.

**Risque**: La fonction RPC échouera silencieusement si le nom du paramètre est différent.

**Correction**: Vérifier le nom du paramètre exact de la fonction RPC dans Supabase et l'adapter.

---

### BUG #9 - GESTION D'ERREUR MANQUANTE
**Localisation**: `/home/user/siportv3/src/services/supabaseService.ts` (lignes 867-876)
**Sévérité**: LOW 🟡
**Type**: Silent Error Handling

**Problème**:
```typescript
static async incrementMiniSiteViews(exhibitorId: string): Promise<void> {
  if (!this.checkSupabaseConnection()) return;
  const safeSupabase = supabase!;
  try {
    await safeSupabase.rpc('increment_view_count', { exhibitor_id_param: exhibitorId });
  } catch (error) {
    console.error('Erreur incrémentation vues:', error);
    // L'erreur est silencieusement ignorée
  }
}
```

L'erreur est logguée mais ne remonte pas au caller.

**Correction**:
```typescript
static async incrementMiniSiteViews(exhibitorId: string): Promise<void> {
  if (!this.checkSupabaseConnection()) return;
  
  if (!exhibitorId || typeof exhibitorId !== 'string') {
    console.warn('⚠️ Invalid exhibitorId for view increment:', exhibitorId);
    return;
  }
  
  const safeSupabase = supabase!;
  try {
    const { error } = await safeSupabase.rpc('increment_view_count', { 
      exhibitor_id_param: exhibitorId 
    });
    
    if (error) {
      console.error('Erreur incrémentation vues:', error);
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel RPC increment_view_count:', error);
  }
}
```

---

### BUG #10 - COHÉRENCE FRONTEND/BACKEND SUR CUSTOM_COLORS
**Localisation**: Multiple files
**Sévérité**: HIGH 🔴
**Type**: Schema Mismatch

**Problème**:
- Database schema: `custom_colors: JSON` = `{ key: value }` pairs
- MiniSiteEditor.tsx: Utilisateurs peuvent personnaliser les couleurs
- MiniSitePreview.tsx: Attend un objet theme avec propriétés nommées
- create-mini-site.js: Initialise avec objet vide `{}`

**Correction**: Standardiser le format à travers toute l'application:
```javascript
// Format final standardisé
custom_colors: {
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  fontFamily: 'Inter'
}
```

---

## 5. TABLEAU RÉCAPITULATIF

| # | Bug | Fichier | Ligne(s) | Sévérité | Type | Statut |
|---|-----|---------|----------|----------|------|--------|
| 1 | Structure theme incohérente | MiniSitePreview.tsx | 30-43, 177-182, 223 | CRITIQUE | Mismatch | ❌ |
| 2 | Mauvais accessor .data au lieu .content | MiniSitePreview.tsx | 221-269 | CRITIQUE | Accessor | ❌ |
| 3 | Mauvais identifiant user.id vs exhibitorId | MiniSiteEditor.tsx | 359, 403 | CRITIQUE | ID Type | ❌ |
| 4 | Validation produits incomplète | create-mini-site.js | 114-117 | MEDIUM | Validation | ❌ |
| 5 | Structure section incorrecte | create-mini-site.js | 151-156 | HIGH | Structure | ❌ |
| 6 | Custom colors vides | create-mini-site.js | 161 | MEDIUM | Init | ❌ |
| 7 | Validation socials/documents manquante | create-mini-site.js | 85-120 | LOW | Validation | ❌ |
| 8 | Mauvais paramètre RPC | supabaseService.ts | 872 | MEDIUM | RPC | ❌ |
| 9 | Gestion erreur manquante | supabaseService.ts | 867-876 | LOW | ErrorHandling | ❌ |
| 10 | Cohérence custom_colors | Multiple | Various | HIGH | Schema | ❌ |

---

## 6. PRIORITÉS DE CORRECTION

### Phase 1 - CRITIQUE (Bloque complètement l'utilisation)
1. BUG #2 - Remplacer `.data` par `.content` (MiniSitePreview.tsx)
2. BUG #3 - Remplacer `user.id` par `exhibitorId` (MiniSiteEditor.tsx)
3. BUG #1 - Transformer `custom_colors` en objet `theme` (MiniSitePreview.tsx)

### Phase 2 - HIGH (Fonctionnalité partiellement cassée)
4. BUG #5 - Corriger structure des sections (create-mini-site.js)
5. BUG #10 - Standardiser format custom_colors (Global)

### Phase 3 - MEDIUM (Amélioration robustesse)
6. BUG #4 - Valider structure produits (create-mini-site.js)
7. BUG #6 - Initialiser custom_colors correctement (create-mini-site.js)
8. BUG #8 - Vérifier nom paramètre RPC (supabaseService.ts)

### Phase 4 - LOW (Optimisation)
9. BUG #7 - Valider socials/documents (create-mini-site.js)
10. BUG #9 - Améliorer gestion erreurs (supabaseService.ts)

---

## 7. POINTS DE RISQUE SUPPLÉMENTAIRES

### RLS (Row Level Security)
- ✓ Le serveur create-mini-site.js utilise la clé de service (contournement RLS)
- ✓ Le serveur exhibitors-server.js valide le secret
- ⚠️ À vérifier: Les politiques RLS pour mini_sites permettent-elles les accès correctement?

### Authentification
- ✓ Le middleware authenticate vérifie le token JWT
- ⚠️ À vérifier: Comment mappe-t-on user.id → exhibitorId?
- ⚠️ À vérifier: Un utilisateur peut-il accéder au mini-site d'un autre exhibitor?

### Validation
- ⚠️ Pas de whitelist de domaines pour logoUrl
- ⚠️ Pas de validation MIME type pour images
- ⚠️ Pas de validation HTML dans description (risque XSS)

