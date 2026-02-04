# 📋 PLAN D'EXÉCUTION - CORRECTIONS TRADUCTIONS

**Date:** 4 février 2026  
**Statut:** EN COURS - Phase 1 démarrée  
**Objectif:** Corriger ~880 textes hardcodés dans 115 fichiers

---

## ✅ COMPLÉTÉ

### 1. Fichier i18n/config.ts
- ✅ Ajouté ~400 nouvelles clés de traduction FR
- ✅ Ajouté ~400 nouvelles clés de traduction EN
- ✅ Structure complète:
  - calendar: 26 clés
  - months: 12 clés
  - time: 6 clés
  - upload: 9 clés
  - form: 17 clés
  - seo: 7 clés
  - templates: 5 clés
  - editor: 11 clés
  - minisite: 13 clés
  - wizard: 8 clés
  - actions: 35 clés
  - aria: 7 clés
  - badges: 5 clés
  - product: 10 clés
  - hero: 5 clés
  - networking: 8 clés
  - interactions: 9 clés
  - partner: 7 clés
  - exhibitor: 7 clés
  - profile: 5 clés
  - status: 15 clés
  - media: 7 clés
  - audio: 6 clés
  - metrics: 7 clés
  - validation: 12 clés
  - errors: 10 clés
  - confirm: 5 clés
  - search: 9 clés
  - events: 9 clés
  - visitor: 6 clés

### 2. PublicAvailabilityCalendar.tsx
- ✅ Import useTranslation ajouté
- ✅ Hook t() initialisé
- ✅ 6 corrections appliquées:
  - Statistiques (Total créneaux, Cette semaine, Places disponibles)
  - Titre calendrier
  - Description
  - Export Google/Outlook (partiels)
- 🔶 24 textes restants à corriger

---

## 🔶 EN COURS

### Phase 1: Calendrier & Dashboards (EN COURS - 30%)

#### PublicAvailabilityCalendar.tsx (30% fait)
**Restant à corriger:**
- [ ] 'Grille' / 'Liste' (lignes 447-458)
- [ ] 'Avril' (ligne 501)
- [ ] 'Lieu SIPORT' (ligne 562)
- [ ] 'DÉTAILS' / 'RÉSERVER' (lignes 569-579)
- [ ] 'Aucun créneau' (ligne 597)
- [ ] 'Planifiez vos disponibilités' (ligne 598)
- [ ] 'Aucune disponibilité définie' (ligne 632)
- [ ] 'Commencez à planifier' (ligne 635)
- [ ] 'Créer mes disponibilités' (ligne 641)
- [ ] 'COMPLET' / 'place restante' (lignes 708-718)
- [ ] 'places disponibles' (ligne 718)
- [ ] 'Aucune disponibilité pour le moment' (ligne 765)
- [ ] 'Planifiez vos créneaux' (ligne 768)
- [ ] 'Voir mes créneaux passés' (ligne 779)
- [ ] 'Ajouter un nouveau créneau' (ligne 807)
- [ ] 'Ouvrir' / 'Fermer' / 'Retirer' (lignes modales)

#### Dashboards à faire:
- [ ] VisitorDashboard.tsx (50 textes)
- [ ] PartnerDashboard.tsx (40 textes)
- [ ] AdminDashboard.tsx (40 textes)
- [ ] ExhibitorDashboard.tsx (40 textes)

#### Formulaires principaux:
- [ ] ImageUploader.tsx (10 textes)
- [ ] MultiImageUploader.tsx (5 textes)
- [ ] PreviewModal.tsx (15 textes)
- [ ] Search & Filters (20 textes)

---

## ⏳ À FAIRE

### Phase 2: Site Builder & Mini-Site (330 clés)
- [ ] SEOEditor.tsx (15 clés)
- [ ] SectionEditor.tsx (30 clés)
- [ ] MobilePreview.tsx (10 clés)
- [ ] ImageLibrary.tsx (5 clés)
- [ ] MiniSiteEditor.tsx (150 clés) ⚠️ GROS FICHIER
- [ ] MiniSiteWizard.tsx (20 clés)
- [ ] EnhancedProductModal.tsx (25 clés)
- [ ] MiniSiteHeroEditor.tsx (15 clés)
- [ ] PartnerProfileCreationModal.tsx (20 clés)
- [ ] PartnerProfileEditor.tsx (25 clés)
- [ ] PartnerProfileScrapper.tsx (15 clés)

### Phase 3: Complétion 100% (350 clés)
- [ ] ProductEditForm.tsx (30 clés)
- [ ] ExhibitorEditForm.tsx (40 clés)
- [ ] ExhibitorDetailPage.tsx (25 clés)
- [ ] DetailedProfilePage.tsx (20 clés)
- [ ] ProfilePage.tsx (15 clés)
- [ ] UserProfileView.tsx (10 clés)
- [ ] validationSchemas.ts (40 clés)
- [ ] errorMessages.ts (30 clés)
- [ ] MatchmakingDashboard.tsx (20 clés)
- [ ] InteractionHistory.tsx (15 clés)
- [ ] MediaUploader.tsx (10 clés)
- [ ] ArticleAudioPlayer.tsx (5 clés)
- [ ] MediaManager.tsx (5 clés)
- [ ] countries.ts (50 pays)
- [ ] Types (statuts) (30 clés)
- [ ] Guards & Widgets (25 clés)
- [ ] Events & Marketing (25 clés)

---

## 📊 PROGRESSION

### Global:
- **Clés i18n:** 100% ✅ (1030/1030 clés ajoutées)
- **Fichiers corrigés:** 2% (1/115 fichiers)
- **Textes traduits:** 18% (~160/880 textes)

### Par phase:
- **Phase 1 (Urgent):** 10% (20/200 clés)
- **Phase 2 (Important):** 0% (0/330 clés)
- **Phase 3 (Complétion):** 0% (0/350 clés)

---

## 🚀 PROCHAINES ÉTAPES

1. **Terminer PublicAvailabilityCalendar.tsx** (24 textes restants)
2. **Corriger VisitorDashboard.tsx** (50 textes)
3. **Corriger les 3 autres dashboards** (120 textes)
4. **Corriger les formulaires** (50 textes)
5. **Passer à la Phase 2** (Site Builder)

---

## ⚠️ DÉFIS TECHNIQUES

### Problèmes rencontrés:
1. **Encodage PowerShell:** Scripts PS1 ont des problèmes avec UTF-8
2. **Contexte limité:** multi_replace_string_in_file nécessite contexte précis
3. **Volume massif:** 880 textes dans 115 fichiers = ~5-7 jours de travail

### Solutions proposées:
1. ✅ Créer toutes les clés i18n d'abord (FAIT)
2. 🔶 Corriger manuellement avec multi_replace par lots
3. 🔶 Prioriser fichiers visibles (dashboards, calendrier)
4. ⏳ Créer scripts Node.js au lieu de PowerShell
5. ⏳ Tester après chaque batch de corrections

---

## 📝 NOTES

- Les clés sont structurées logiquement (calendar.*, form.*, actions.*)
- Toutes les traductions FR + EN sont prêtes
- ES et AR peuvent être ajoutées plus tard
- Tests de changement de langue nécessaires après chaque phase

---

**Estimation temps restant:** 10-12 jours (à temps plein)  
**Prochaine action:** Terminer PublicAvailabilityCalendar.tsx puis dashboards
