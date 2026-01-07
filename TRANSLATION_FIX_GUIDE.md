# Diagnostic : Pourquoi seul le menu change de langue

## Problème
- ✅ Menu/Header change de langue
- ❌ Contenu des pages reste en français

## Cause racine
Il y a **deux systèmes de traduction disjoints** :

### 1. **languageStore.ts** (pour le menu)
```typescript
const translations = {
  fr: { 'nav.home': 'Accueil', ... },
  en: { 'nav.home': 'Home', ... },
  ar: { 'nav.home': 'الرئيسية', ... }
};
```
✅ Utilisé par : `Header.tsx`, `LanguageSelector.tsx`

### 2. **i18n/config.ts** (pour les pages)
```typescript
const resources = {
  fr: { translation: { ... } },
  en: { translation: { ... } }
};
```
❌ **Presque JAMAIS utilisé** - Seules quelques pages l'utilisent

## Composants concernés

### ✅ Composants qui changent de langue
- `Header` - Utilise `languageStore.translateText()`
- `LanguageSelector` - Utilise `languageStore.setLanguage()`
- `HeroSection` - Utilise `useTranslation()` du store

### ❌ Composants qui NE changent PAS
- `FeaturedExhibitors` - Texte dur codé en français
- `FeaturedPartners` - Texte dur codé en français
- `NetworkingSection` - Texte dur codé en français
- Toutes les pages exposants/partenaires/événements

## Solution

### Étape 1 : Fusionner les deux systèmes
Utiliser **UNIQUEMENT** `languageStore` partout (c'est plus simple et plus cohérent)

### Étape 2 : Ajouter les clés manquantes
Pour chaque texte statique, ajouter une clé dans `languageStore.ts` :
```typescript
fr: {
  'home.featured_exhibitors': 'Exposants en vedette',
  'home.discover_button': 'Découvrir',
  ...
}
```

### Étape 3 : Utiliser `useTranslation()` partout
```typescript
const { t } = useTranslation();
<h2>{t('home.featured_exhibitors')}</h2>
```

## Fichiers à modifier

1. **`src/store/languageStore.ts`**
   - Ajouter TOUTES les clés manquantes pour le contenu des pages

2. **Tous les composants de contenu**
   - `src/components/home/FeaturedExhibitors.tsx`
   - `src/components/home/FeaturedPartners.tsx`
   - `src/components/home/NetworkingSection.tsx`
   - Pages exposants, partenaires, événements, etc.

3. **Optionnel : Supprimer `i18n/config.ts`**
   - Ce fichier crée une confusion et n'est pas utilisé

## Implémentation recommandée

```typescript
// Dans chaque composant
import { useTranslation } from '../hooks/useTranslation';

export const MonComposant = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('mycomponent.title')}</h2>
      <p>{t('mycomponent.description')}</p>
    </div>
  );
};
```

Voulez-vous que je fasse cette correction ? ✅
