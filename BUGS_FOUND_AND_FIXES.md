# 🐛 BUGS TROUVÉS ET CORRECTIONS - SIPORTS 2026

## ✅ BUILD STATUS
**TypeScript Build**: ✅ **SUCCÈS** (Pas d'erreurs, seulement des warnings sur les imports dynamiques)

---

## 🔴 BUGS CRITIQUES DÉTECTÉS

### BUG #1: Méthode `updatePartner` inexistante dans SupabaseService
**Fichier**: `src/components/partner/PartnerProfileScrapper.tsx`
**Ligne**: 69
**Code problématique**:
```typescript
await SupabaseService.updatePartner(partnerId, {
  company_name: scrapResult.companyName,
  // ...
});
```

**Problème**: La méthode `updatePartner` n'existe PAS dans `SupabaseService.ts`

**Impact**: ❌ **ERREUR D'EXÉCUTION** - Le composant crashera lors de la sauvegarde du profil partenaire

**Solution**:
```typescript
// Option 1: Utiliser Supabase directement
import { supabase } from '../../lib/supabase';

await supabase
  .from('partner_profiles')
  .upsert({
    user_id: partnerId,
    company_name: scrapResult.companyName,
    description: scrapResult.description,
    sector: scrapResult.sector,
    logo_url: scrapResult.logoUrl,
    website: websiteUrl,
    contact_email: scrapResult.contactEmail,
    contact_phone: scrapResult.contactPhone,
    address: scrapResult.address,
    services: scrapResult.services,
    founded_year: scrapResult.foundedYear,
    employee_count: scrapResult.employeeCount,
    social_links: scrapResult.socialLinks,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  });

// Option 2: Créer la méthode dans SupabaseService.ts
static async updatePartner(userId: string, data: Partial<PartnerProfile>): Promise<void> {
  const { error } = await supabase
    .from('partner_profiles')
    .upsert({
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) throw error;
}
```

---

### BUG #2: Même problème dans PartnerProfileEditor
**Fichier**: `src/components/partner/PartnerProfileEditor.tsx`
**Ligne**: ~200 (dans handleSave)

**Code problématique**:
```typescript
await supabase
  .from('partner_profiles')
  .update({...})
  .eq('user_id', partnerId);
```

**Problème**: Utilise `.update()` qui échouera si le profil n'existe pas encore

**Impact**: ❌ **ERREUR** - Ne créera pas de profil si premier usage

**Solution**: Utiliser `.upsert()` à la place de `.update()`:
```typescript
await supabase
  .from('partner_profiles')
  .upsert({
    user_id: partnerId,
    company_name: profile.company_name,
    // ... tous les champs
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  });
```

---

### BUG #3: Méthode `getMiniSiteByExhibitorId` inexistante
**Fichier**: `src/components/exhibitor/ExhibitorMiniSiteScrapper.tsx`
**Ligne**: ~250

**Code problématique**:
```typescript
const existingMiniSite = await SupabaseService.getMiniSiteByExhibitorId(userId);
```

**Problème**: La méthode n'existe probablement pas, ou s'appelle différemment

**Recherche dans SupabaseService**:
- `getMiniSite(exhibitorId)` ✅ EXISTE (ligne 1588)

**Solution**: Utiliser `getMiniSite()` au lieu de `getMiniSiteByExhibitorId()`:
```typescript
const existingMiniSite = await SupabaseService.getMiniSite(userId);
```

---

### BUG #4: Méthodes `createMiniSite` et `updateMiniSite` inexistantes
**Fichier**: `src/components/exhibitor/ExhibitorMiniSiteScrapper.tsx`
**Lignes**: ~255-260

**Code problématique**:
```typescript
if (existingMiniSite) {
  await SupabaseService.updateMiniSite(existingMiniSite.id, miniSiteData);
} else {
  await SupabaseService.createMiniSite(miniSiteData);
}
```

**Problème**:
- `createMiniSite` existe mais prend `(exhibitorId, data)` (ligne 1052)
- `updateMiniSite` n'existe PAS

**Solution**:
```typescript
// Pour créer (si pas de mini-site existant)
if (!existingMiniSite) {
  await SupabaseService.createMiniSite(userId, miniSiteData);
} else {
  // Pour mettre à jour, utiliser supabase directement
  await supabase
    .from('mini_sites')
    .update(miniSiteData)
    .eq('id', existingMiniSite.id);
}
```

---

### BUG #5: Validation URL manquante dans AI Scrapper Service
**Fichier**: `src/services/aiScrapperService.ts`
**Ligne**: 84

**Code problématique**:
```typescript
if (!data.contents) {
  throw new Error('Impossible de récupérer le contenu du site');
}
```

**Problème**: Ne vérifie pas si `data` existe avant d'accéder à `data.contents`

**Solution**:
```typescript
if (!data || !data.contents) {
  throw new Error('Impossible de récupérer le contenu du site');
}
```

---

### BUG #6: Gestion d'erreur JSON parsing incomplète
**Fichier**: `src/services/aiScrapperService.ts`
**Lignes**: 194, 309

**Code actuel**: Lance une erreur si JSON invalide, mais pas de retry

**Amélioration suggérée**:
```typescript
try {
  const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  extractedData = JSON.parse(cleanedResponse);
} catch (parseError) {
  console.error('Erreur parsing JSON:', aiResponse);
  // Tenter un nettoyage plus agressif
  try {
    const fallbackClean = aiResponse
      .replace(/^[^{]*/, '') // Enlever tout avant le premier {
      .replace(/[^}]*$/, ''); // Enlever tout après le dernier }
    extractedData = JSON.parse(fallbackClean);
  } catch (fallbackError) {
    throw new Error('L\'IA n\'a pas retourné un JSON valide');
  }
}
```

---

## ⚠️ BUGS MINEURS / WARNINGS

### WARNING #1: Import React inutilisé
**Fichiers**: Plusieurs composants
**Code**: `import React from 'react';`

**Problème**: React 18+ n'exige plus l'import de React pour JSX

**Solution**: Supprimer ou changer en:
```typescript
import { useState, useEffect } from 'react';
// au lieu de
import React, { useState } from 'react';
```

---

### WARNING #2: Types `any` dans scrapResult
**Fichiers**: PartnerProfileScrapper.tsx, ExhibitorMiniSiteScrapper.tsx

**Code problématique**:
```typescript
const [scrapResult, setScrapResult] = useState<any>(null);
```

**Solution**: Définir des types stricts:
```typescript
type ScrapResultData = {
  companyName: string;
  description: string;
  sector: string;
  services: string[];
  // ...
};

const [scrapResult, setScrapResult] = useState<ScrapResultData | null>(null);
```

---

### WARNING #3: Gestion d'erreur catch(error: any)
**Fichiers**: Tous les composants

**Code problématique**:
```typescript
} catch (error: any) {
  toast.error(error.message || 'Erreur');
}
```

**Solution**: Type-safe error handling:
```typescript
} catch (error) {
  const message = error instanceof Error ? error.message : 'Erreur inconnue';
  toast.error(message);
}
```

---

## 🟡 PROBLÈMES POTENTIELS D'EXÉCUTION

### POTENTIEL #1: API OpenAI Key manquante
**Fichier**: `aiScrapperService.ts`
**Ligne**: 66

**Problème**: Si `VITE_OPENAI_API_KEY` n'est pas définie, le service échouera silencieusement

**Solution actuelle**: ✅ Déjà géré - retourne une erreur explicite
```typescript
if (!this.apiKey) {
  return {
    success: false,
    error: 'Clé API OpenAI non configurée'
  };
}
```

**Amélioration suggérée**: Ajouter un toast au chargement du dashboard:
```typescript
// Dans PartnerDashboard useEffect
const checkAPIKey = async () => {
  const hasKey = await aiScrapperService.testConnection();
  if (!hasKey) {
    toast.warning('AI Scrapper non configuré - Ajoutez VITE_OPENAI_API_KEY dans .env');
  }
};
```

---

### POTENTIEL #2: CORS Proxy peut échouer
**Fichier**: `aiScrapperService.ts`
**Ligne**: 80

**Problème**: Le proxy `allorigins.win` peut être down ou bloqué

**Solution**: Ajouter un fallback proxy:
```typescript
const proxies = [
  `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  `https://corsproxy.io/?${encodeURIComponent(url)}`,
  `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

for (const proxyUrl of proxies) {
  try {
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.contents || data.content) {
        return data.contents || data.content;
      }
    }
  } catch (e) {
    continue; // Essayer le prochain
  }
}

throw new Error('Tous les proxys CORS ont échoué');
```

---

### POTENTIEL #3: Limite de tokens OpenAI dépassée
**Fichier**: `aiScrapperService.ts`
**Ligne**: 104

**Code actuel**: Limite à 5000 caractères
```typescript
return textContent.trim().slice(0, 5000);
```

**Problème**: Peut couper au milieu d'un mot/phrase important

**Amélioration suggérée**:
```typescript
// Limiter à 5000 chars mais couper au dernier espace
const limited = textContent.trim().slice(0, 5000);
const lastSpace = limited.lastIndexOf(' ');
return lastSpace > 4500 ? limited.slice(0, lastSpace) : limited;
```

---

### POTENTIEL #4: Storage bucket 'media' manquant
**Fichier**: `ArticleEditor.tsx`
**Ligne**: 110

**Code**:
```typescript
const { data, error } = await supabase.storage
  .from('media')
  .upload(filePath, file, {...});
```

**Problème**: Si le bucket `media` n'existe pas dans Supabase, l'upload échouera

**Solution**: Ajouter vérification + création automatique:
```typescript
// Vérifier si bucket existe
const { data: buckets } = await supabase.storage.listBuckets();
const mediaExists = buckets?.some(b => b.name === 'media');

if (!mediaExists) {
  toast.error('Bucket storage "media" manquant - Contactez l\'admin');
  return;
}
```

---

## 📋 CHECKLIST DE VÉRIFICATION

### Base de données Supabase
- [ ] Table `partner_profiles` existe avec colonnes:
  - `user_id` (UUID, FK vers users)
  - `company_name` (TEXT)
  - `description` (TEXT)
  - `sector` (TEXT)
  - `logo_url` (TEXT)
  - `website` (TEXT)
  - `contact_email` (TEXT)
  - `contact_phone` (TEXT)
  - `address` (TEXT)
  - `services` (TEXT[] ou JSONB)
  - `founded_year` (INTEGER)
  - `employee_count` (TEXT)
  - `social_links` (JSONB)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- [ ] Table `mini_sites` existe avec colonnes:
  - `id` (UUID)
  - `exhibitor_id` (UUID, FK vers users)
  - `theme` (TEXT)
  - `sections` (JSONB)
  - `is_published` (BOOLEAN)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- [ ] Table `news_articles` existe avec colonnes:
  - `id` (UUID)
  - `title` (TEXT)
  - `content` (TEXT)
  - `excerpt` (TEXT)
  - `author` (TEXT)
  - `published` (BOOLEAN)
  - `published_at` (TIMESTAMP)
  - `scheduled_at` (TIMESTAMP)
  - `category` (TEXT)
  - `tags` (TEXT[])
  - `image_url` (TEXT)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- [ ] Storage bucket `media` existe et est PUBLIC

### Variables d'environnement
- [ ] `.env` contient `VITE_OPENAI_API_KEY=sk-...`
- [ ] Clé API OpenAI valide et avec crédit

### Permissions Supabase
- [ ] RLS (Row Level Security) configuré correctement
- [ ] Utilisateurs peuvent UPDATE leur propre `partner_profiles`
- [ ] Utilisateurs peuvent CREATE/UPDATE leur `mini_sites`
- [ ] Utilisateurs peuvent upload dans storage `media`

---

## 🔧 CORRECTIONS À APPLIQUER (Par priorité)

### PRIORITÉ HAUTE (Blocants)
1. ✅ **Corriger `updatePartner` dans PartnerProfileScrapper**
2. ✅ **Corriger `.update()` en `.upsert()` dans PartnerProfileEditor**
3. ✅ **Corriger `getMiniSiteByExhibitorId` → `getMiniSite`**
4. ✅ **Corriger `createMiniSite` et `updateMiniSite` dans ExhibitorMiniSiteScrapper**

### PRIORITÉ MOYENNE (Amélioration stabilité)
5. ⚠️ Ajouter validation `data` avant `data.contents`
6. ⚠️ Améliorer parsing JSON avec fallback
7. ⚠️ Ajouter fallback CORS proxies

### PRIORITÉ BASSE (Qualité code)
8. 📝 Remplacer types `any` par types stricts
9. 📝 Améliorer error handling (error: any → error instanceof Error)
10. 📝 Supprimer imports React inutilisés

---

## ✅ CE QUI FONCTIONNE CORRECTEMENT

- ✅ **Build TypeScript**: Pas d'erreurs de compilation
- ✅ **Structure des composants**: Props, states, effects bien organisés
- ✅ **Intégration Framer Motion**: Animations correctes
- ✅ **Toast notifications**: Sonner configuré correctement
- ✅ **Validation URL**: Gestion d'erreur présente
- ✅ **Loading states**: isLoading géré dans tous les composants
- ✅ **ArticleEditor React-Quill**: Imports et configuration corrects
- ✅ **Dashboard integrations**: Modals et boutons bien implémentés

---

## 📊 RÉSUMÉ

| Catégorie | Nombre | Statut |
|-----------|--------|--------|
| Bugs Critiques | 6 | 🔴 À corriger immédiatement |
| Bugs Mineurs | 3 | ⚠️ À corriger quand possible |
| Problèmes Potentiels | 4 | 🟡 À surveiller |
| **TOTAL** | **13** | |

---

## 🚀 PROCHAINES ÉTAPES

1. **Appliquer les corrections critiques** (Bugs #1-4)
2. **Tester avec clé API OpenAI réelle**
3. **Vérifier schéma base de données**
4. **Tester en environnement dev**
5. **Monitoring des erreurs en production**

---

*Document créé le: 2026-01-31*
*Dernière mise à jour: 2026-01-31 17:00 UTC*
