# Workflow d'Approbation des Médias Partenaires - Implémentation Complète

## 🎯 Objectif
Permettre aux partenaires de soumettre du contenu média tout en maintenant un contrôle qualité via un processus d'approbation administrateur.

## 📋 Architecture Hybride Implémentée

### Options Retenues (2 + 3)
- ✅ **Option 2** : Route `/partner/media/upload` restreinte aux partenaires
- ✅ **Option 3** : Validation admin obligatoire avant publication

### Workflow Complet
```
Partenaire soumet → Status: pending_approval → Admin approuve/rejette → Status: approved/rejected → Si approuvé: publié
```

## 🗄️ Structure Base de Données

### Migration : `20260101000002_partner_media_approval_workflow.sql`

#### Nouvelles Colonnes (media_contents)
```sql
created_by_type      TEXT    -- 'admin', 'partner', 'exhibitor'
created_by_id        UUID    -- ID de l'utilisateur créateur
approved_by_admin_id UUID    -- ID de l'admin qui a approuvé
approved_at          TIMESTAMP
rejection_reason     TEXT
```

#### Status Workflow
- `draft` : Brouillon
- `pending_approval` : En attente de validation
- `approved` : Approuvé par admin
- `published` : Publié et visible
- `rejected` : Rejeté
- `archived` : Archivé

#### Trigger Automatique
```sql
CREATE TRIGGER auto_approve_admin_media
BEFORE INSERT ON media_contents
FOR EACH ROW EXECUTE FUNCTION auto_approve_admin_media();
```
- Médias créés par admin → `status = 'approved'` automatiquement
- Médias créés par partenaire → `status = 'pending_approval'`

#### RLS Policies (5 politiques)
1. **Public** : Voir uniquement médias approuvés/publiés
2. **Partenaires** : Créer leurs propres médias
3. **Partenaires** : Voir leurs propres médias (tous statuts)
4. **Partenaires** : Mettre à jour leurs propres médias (draft seulement)
5. **Admins** : Accès complet (lecture/écriture/suppression)

#### Fonctions d'Approbation
```sql
-- Approuver un média partenaire
approve_partner_media(media_id UUID, admin_id UUID) RETURNS JSONB

-- Rejeter un média partenaire
reject_partner_media(media_id UUID, admin_id UUID, reason TEXT) RETURNS JSONB
```

#### Vue Admin
```sql
CREATE VIEW pending_partner_media AS
SELECT 
  mc.*,
  u.name as creator_name,
  u.email as creator_email,
  pp.company_name as partner_company
FROM media_contents mc
JOIN users u ON mc.created_by_id = u.id
LEFT JOIN partner_profiles pp ON mc.created_by_id = pp.user_id
WHERE mc.status = 'pending_approval' AND mc.created_by_type = 'partner';
```

## 🎨 Pages Créées

### 1. Page Partenaire : Soumission de Média
**Fichier** : `src/pages/partners/PartnerMediaUploadPage.tsx`

#### Modifications Clés
```typescript
// Lors de la soumission
const mediaData = {
  ...formData,
  created_by_type: 'partner',
  created_by_id: user.id,
  status: 'pending_approval'  // ← Automatique
};
```

#### Interface Utilisateur
- ✅ Titre changé : "Uploader un Média" → "Soumettre un Média"
- ✅ Notification bleue : "Validation requise"
- ✅ Message clair : "Votre média sera soumis à l'équipe SIPORT pour validation"
- ✅ Toast de confirmation : "Média soumis avec succès ! Il sera visible après validation"

### 2. Page Partenaire : Bibliothèque de Médias
**Fichier** : `src/pages/partners/PartnerMediaLibraryPage.tsx`

#### Fonctionnalités
- ✅ Vue de tous les médias soumis par le partenaire
- ✅ Filtres par statut : Tous / En attente / Approuvés / Rejetés
- ✅ Statistiques : Total, En attente, Approuvés, Rejetés
- ✅ Badges de statut colorés :
  - 🟠 **En attente** : Orange avec icône Clock
  - 🟢 **Approuvé/Publié** : Vert avec icône CheckCircle
  - 🔴 **Rejeté** : Rouge avec icône XCircle
- ✅ Affichage de la raison de rejet si applicable
- ✅ Lien direct vers la page de soumission

### 3. Page Admin : Validation des Médias
**Fichier** : `src/pages/admin/PartnerMediaApprovalPage.tsx`

#### Fonctionnalités
- ✅ Liste de tous les médias en attente de validation
- ✅ Affichage du nombre de médias en attente
- ✅ Vue détaillée avec prévisualisation
- ✅ Modal de prévisualisation avec iframe vidéo
- ✅ Informations du partenaire (entreprise, créateur)
- ✅ Actions disponibles :
  - **Approuver** : Passe le média en statut `approved`
  - **Rejeter** : Passe en statut `rejected` avec raison obligatoire
- ✅ Champ de texte pour raison de rejet
- ✅ Indicateur de chargement pendant le traitement
- ✅ Mise à jour automatique de la liste après action

## 🔗 Routes Ajoutées

### Dans `src/lib/routes.ts`
```typescript
// Admin Media Management
ADMIN_PARTNER_MEDIA_APPROVAL: '/admin/partner-media/approval',

// Partner Media Management  
PARTNER_MEDIA_LIBRARY: '/partner/media/library',
```

### Dans `src/App.tsx`
```typescript
// Partner Media routes - protected
<Route 
  path={ROUTES.PARTNER_MEDIA_LIBRARY} 
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerMediaLibraryPage />
    </ProtectedRoute>
  } 
/>

// Admin Media routes - protected
<Route 
  path={ROUTES.ADMIN_PARTNER_MEDIA_APPROVAL} 
  element={
    <ProtectedRoute requiredRole="admin">
      <PartnerMediaApprovalPage />
    </ProtectedRoute>
  } 
/>
```

## 🎯 Dashboard Admin

### Ajout dans `src/components/dashboard/AdminDashboard.tsx`

#### Nouveau Bouton d'Accès Rapide
```tsx
<Link to={ROUTES.ADMIN_PARTNER_MEDIA_APPROVAL} className="block">
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <div className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white p-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center mb-3">
      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-4">
        <CheckCircle className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold">Valider Médias Partenaires</div>
        <div className="text-xs text-orange-100">Approuver les contenus soumis</div>
      </div>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </motion.div>
</Link>
```

## 🔐 Sécurité

### Protection Multi-Niveaux
1. **UI** : Routes protégées par `ProtectedRoute` avec `requiredRole`
2. **RLS** : Politiques de sécurité au niveau base de données
3. **Trigger** : Validation automatique du statut lors de l'insertion
4. **Functions** : Fonctions sécurisées avec vérification des permissions

### Permissions
- ✅ Partenaires peuvent uniquement :
  - Créer leurs propres médias (status: pending_approval)
  - Voir leurs propres médias (tous statuts)
  - Modifier leurs médias en brouillon uniquement
- ✅ Admins peuvent :
  - Voir tous les médias (tous statuts)
  - Approuver/Rejeter les médias partenaires
  - Modifier/Supprimer tous les médias
- ✅ Public peut uniquement :
  - Voir les médias approved/published

## 📊 Expérience Utilisateur

### Pour les Partenaires
1. Cliquent sur "Soumettre un média" dans leur dashboard
2. Remplissent le formulaire d'upload
3. Voient un message clair : "Validation requise"
4. Reçoivent confirmation : "Média soumis avec succès !"
5. Accèdent à leur bibliothèque pour suivre le statut
6. Voient les badges colorés selon le statut
7. Si rejeté, voient la raison du rejet

### Pour les Admins
1. Voient le bouton "Valider Médias Partenaires" dans le dashboard
2. Accèdent à la liste des médias en attente
3. Cliquent sur "Prévisualiser" pour voir les détails
4. Visionnent la vidéo dans un iframe
5. Approuvent ou rejettent avec raison
6. Le média disparaît de la liste après traitement

## 🚀 Déploiement

### Étape 1 : Appliquer les Migrations
```bash
# Via Supabase Dashboard
1. Aller dans SQL Editor
2. Copier le contenu de supabase/migrations/20260101000002_partner_media_approval_workflow.sql
3. Exécuter la requête

# Ou via CLI
supabase db push
```

### Étape 2 : Vérifier les RLS Policies
```sql
-- Vérifier que les policies sont créées
SELECT * FROM pg_policies WHERE tablename = 'media_contents';
```

### Étape 3 : Tester le Workflow
1. Se connecter comme partenaire
2. Soumettre un média de test
3. Vérifier le statut : `pending_approval`
4. Se connecter comme admin
5. Aller dans "Valider Médias Partenaires"
6. Approuver ou rejeter le média
7. Vérifier que le statut est mis à jour

## 📝 Tests à Effectuer

### Tests Partenaire
- [ ] Soumettre un média (doit être en pending_approval)
- [ ] Voir le média dans la bibliothèque
- [ ] Vérifier que le badge "En attente" s'affiche
- [ ] Tenter de voir un média d'un autre partenaire (doit échouer)

### Tests Admin
- [ ] Voir la liste des médias en attente
- [ ] Prévisualiser un média
- [ ] Approuver un média (doit passer en approved)
- [ ] Rejeter un média avec raison (doit passer en rejected)
- [ ] Vérifier que le nombre en attente diminue après action

### Tests Public
- [ ] Vérifier que seuls les médias approved/published sont visibles
- [ ] Tenter d'accéder à un média pending (doit échouer)

## 📈 Métriques à Suivre

### Dashboard Admin (futures améliorations)
- Nombre total de soumissions par mois
- Temps moyen d'approbation
- Taux d'approbation vs rejet
- Partenaires les plus actifs
- Raisons de rejet les plus fréquentes

## 🎨 Design System

### Badges de Statut
```typescript
// Couleurs utilisées
pending_approval: 'warning' (orange)
approved: 'success' (vert)
published: 'success' (vert)
rejected: 'error' (rouge)
```

### Icônes Utilisées
- `Clock` : En attente
- `CheckCircle` : Approuvé
- `XCircle` : Rejeté
- `AlertCircle` : Avertissement/Raison de rejet
- `Upload` : Soumettre
- `Eye` : Prévisualiser
- `Video` : Contenu vidéo

## 📚 Documentation Technique

### Tables Concernées
- `media_contents` : Table principale des médias
- `users` : Informations utilisateurs
- `partner_profiles` : Profils des partenaires

### Indexes Créés
```sql
CREATE INDEX idx_media_contents_status ON media_contents(status);
CREATE INDEX idx_media_contents_created_by ON media_contents(created_by_type, created_by_id);
CREATE INDEX idx_media_contents_pending ON media_contents(status) WHERE status = 'pending_approval';
```

## 🔄 Workflow Complet

```
┌─────────────────┐
│  Partenaire     │
│  soumet média   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Status:         │
│ pending_approval│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Admin voit     │
│  dans la liste  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Approuve│ │ Rejette│
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│approved│ │rejected│
└───┬────┘ └───┬────┘
    │          │
    ▼          │
┌────────┐     │
│published    │
└────────┘     │
               ▼
        ┌──────────────┐
        │ Partenaire   │
        │ voit raison  │
        └──────────────┘
```

## ✅ Checklist de Validation

### Sécurité
- [x] RLS policies configurées
- [x] Trigger de validation automatique
- [x] Fonctions avec vérification des permissions
- [x] Routes protégées par rôle

### Fonctionnalités
- [x] Page de soumission partenaire
- [x] Page de bibliothèque partenaire
- [x] Page d'approbation admin
- [x] Filtres par statut
- [x] Affichage des raisons de rejet
- [x] Notifications de confirmation

### UI/UX
- [x] Messages clairs et explicites
- [x] Badges de statut colorés
- [x] Indicateurs de chargement
- [x] Responsive design
- [x] Animations fluides

### Intégration
- [x] Routes configurées
- [x] Imports ajoutés dans App.tsx
- [x] Liens dans les dashboards
- [x] Navigation cohérente

## 📞 Support

Pour toute question sur l'implémentation :
1. Consulter la migration SQL : `supabase/migrations/20260101000002_partner_media_approval_workflow.sql`
2. Vérifier les logs Supabase pour les erreurs RLS
3. Tester avec les comptes de démo (admin et partenaire)

---

**Date de création** : 2026-01-01  
**Statut** : ✅ Implémentation complète  
**Migrations appliquées** : En attente de déploiement  
**Tests** : À effectuer après déploiement
