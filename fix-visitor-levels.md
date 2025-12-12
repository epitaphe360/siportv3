# Fix Visitor Levels Migration - Plan d'Action

## Contexte
Migration du 2025-12-04: Simplification des niveaux visiteur
- Suppression: 'basic', 'vip'
- Conservation: 'free', 'premium'
- Conversion: basic → free, vip → premium

## Fichiers à Corriger

### 1. src/lib/qrCodeSystem.ts
**Changements requis:**
- Ligne 4: `accessLevel` garde 'basic' et 'vip' (utilisés pour événements, pas utilisateurs)
- Lignes 131-142: Remplacer `['premium', 'vip']` → `userLevel === 'premium'`
- Ligne 133: `userLevel === 'vip'` → `userLevel === 'premium'`
- Lignes 137, 142: `userLevel === 'vip'` → `userLevel === 'premium'`
- Ligne 175: `'basic' | 'premium' | 'vip'` → `'free' | 'premium'`
- Ligne 177: `return 'basic'` → `return 'free'`
- Lignes 214, 226, 244: `['premium', 'vip']` → `userLevel === 'premium'`
- Lignes 387-389: Descriptions gardent 'VIP' et 'Basic' (affichage seulement)
- Lignes 396-397: Logique conditions à ajuster

### 2. src/store/visitorStore.ts
**Changements requis:**
- Ligne 16/120: `passType: 'free' | 'basic' | 'premium' | 'vip'` → `passType: 'free' | 'premium'`

### 3. src/types/index.ts
**Changements requis:**
- Chercher définition VisitorLevel et mettre à jour

### 4. Tests
- tests/unit/quotas.test.ts
- tests/unit.test.ts

## Stratégie
1. Fixer les types d'abord (src/types/index.ts, src/store/visitorStore.ts)
2. Fixer la logique métier (src/lib/qrCodeSystem.ts)
3. Fixer les autres fichiers
4. Mettre à jour les tests

Note: Les eventTypes 'vip' dans les mock events peuvent rester car ce sont des labels, pas des user levels.
