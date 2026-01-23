# 🤖 Système de Scrapping IA - Documentation Complète

## ✅ IMPLÉMENTÉ

### 1. Service de Scrapping IA (GPT-4o-mini)
**Fichier:** `src/services/aiScrapperService.ts`

#### Caractéristiques:
- **Modèle**: GPT-4o-mini (le plus rentable qualité/prix)
- **Coût**: $0.15/1M tokens = **~$0.000075 par profil**
- **Proxy CORS**: allorigins.win (gratuit)
- **Tokens moyens**: ~500 par scrapping

#### Méthodes:
```typescript
// Auto-remplir profil partenaire
scrapPartnerProfile(websiteUrl: string): Promise<ScrapResult>

// Auto-créer mini-site exposant
scrapExhibitorMiniSite(websiteUrl: string): Promise<MiniSiteScrapResult>

// Tester la connexion API
testConnection(): Promise<boolean>
```

#### Données Extraites - PARTENAIRE:
- ✅ Nom de l'entreprise
- ✅ Description (200 caractères)
- ✅ Secteur d'activité
- ✅ Liste des services
- ✅ Logo URL
- ✅ Email de contact
- ✅ Téléphone
- ✅ Adresse physique
- ✅ Année de création
- ✅ Nombre d'employés
- ✅ Réseaux sociaux (LinkedIn, Twitter, Facebook)

#### Données Extraites - EXPOSANT (Mini-Site):
- ✅ Nom + tagline accrocheur
- ✅ Description détaillée (500 caractères)
- ✅ Produits/Services (nom, description, catégorie, prix)
- ✅ Liste des services principaux
- ✅ Réalisations et achievements
- ✅ Membres de l'équipe (nom, poste, bio)
- ✅ Galerie d'images
- ✅ Informations de contact complètes

---

### 2. Composant Partenaire
**Fichier:** `src/components/partner/PartnerProfileScrapper.tsx`

#### Interface Utilisateur:
```
Étape 1: INPUT
┌─────────────────────────────────────┐
│ 🌐 URL du site web                  │
│ https://...                         │
│                                     │
│ [✨ Analyser avec l'IA]            │
└─────────────────────────────────────┘

Étape 2: PREVIEW
┌─────────────────────────────────────┐
│ ✅ Extraction réussie!               │
│                                     │
│ Nom: [Éditable]                     │
│ Description: [Éditable]             │
│ Secteur: [Éditable]                 │
│ Services: ✓ Service 1               │
│          ✓ Service 2               │
│ Contact: [Éditable]                 │
│                                     │
│ [Recommencer] [💾 Sauvegarder]     │
└─────────────────────────────────────┘

Étape 3: SAVED
┌─────────────────────────────────────┐
│       ✅                             │
│   Profil sauvegardé!                │
│                                     │
│ [Analyser un autre site]            │
└─────────────────────────────────────┘
```

#### Fonctionnalités:
- ✅ Validation d'URL
- ✅ Loading states avec toast notifications
- ✅ Édition manuelle avant sauvegarde
- ✅ Sauvegarde directe via SupabaseService.updatePartner()
- ✅ Callback onSuccess()
- ✅ Design moderne avec Framer Motion

---

### 3. Composant Exposant
**Fichier:** `src/components/exhibitor/ExhibitorMiniSiteScrapper.tsx`

#### Interface Utilisateur:
- 🎨 Même workflow en 3 étapes
- 🌈 Gradient purple/pink au lieu de blue
- 📦 Aperçu complet du mini-site:
  - Hero avec nom + tagline
  - Section À propos
  - Grid de produits (max 4 affichés)
  - Liste des réalisations
  - Équipe avec avatars
- 🚀 Publication directe dans table mini_sites

#### Fonctionnalités:
- ✅ Création OU mise à jour du mini-site
- ✅ Structure JSON complète pour sections
- ✅ Couleurs par défaut (bleu)
- ✅ Statut published: true
- ✅ Callback onSuccess()

---

## 📋 CONFIGURATION REQUISE

### Variables d'Environnement

Ajouter dans `.env`:
```bash
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-proj-VOTRE_CLE_ICI
```

### Obtenir la Clé API:
1. Aller sur https://platform.openai.com/api-keys
2. Créer un nouveau projet
3. Générer une nouvelle clé API
4. Copier dans `.env`

### Coût Estimé:
- **Setup**: Gratuit
- **Par scrapping**: ~$0.000075
- **1000 profils**: ~$0.075 (7.5 cents)
- **Budget mensuel recommandé**: $5/mois = ~66,666 profils

---

## 🔧 INTÉGRATION DANS LES DASHBOARDS

### PARTENAIRE - À FAIRE

**Fichier à modifier:** `src/components/dashboard/PartnerDashboard.tsx`

```typescript
import PartnerProfileScrapper from '../partner/PartnerProfileScrapper';

// Dans le rendu du dashboard
{/* Section Auto-remplissage IA */}
<Card className="p-6">
  <h3 className="text-xl font-bold mb-4">
    ✨ Remplissage Automatique par IA
  </h3>
  <PartnerProfileScrapper
    partnerId={user.id}
    onSuccess={() => {
      toast.success('Profil mis à jour!');
      // Recharger les données
      loadPartnerData();
    }}
  />
</Card>

{/* Section Édition Manuelle */}
<Card className="p-6">
  <h3 className="text-xl font-bold mb-4">
    ✏️ Modifier mon profil
  </h3>
  {/* Formulaire d'édition manuelle */}
  <PartnerProfileEditor partnerId={user.id} />
</Card>
```

### EXPOSANT - À FAIRE

**Fichier à modifier:** `src/components/dashboard/ExhibitorDashboard.tsx`

```typescript
import ExhibitorMiniSiteScrapper from '../exhibitor/ExhibitorMiniSiteScrapper';

// Ajouter un nouvel onglet "Mini-Site IA"
{/* Bouton dans le dashboard */}
<Button onClick={() => setShowMiniSiteWizard(true)}>
  🤖 Créer Mini-Site avec IA
</Button>

{/* Modal */}
{showMiniSiteWizard && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto">
      <ExhibitorMiniSiteScrapper
        exhibitorId={exhibitor.id}
        userId={user.id}
        onSuccess={() => {
          setShowMiniSiteWizard(false);
          navigate('/minisite');
        }}
      />
    </div>
  </div>
)}
```

---

## 📝 MARKETING DASHBOARD - CE QUI MANQUE

### Fonctionnalités Existantes ✅:
- Upload de médias (URL)
- Gestion d'articles
- Publication/dépublication
- Suppression
- Shortcode pour intégration
- Filtrage par type/statut

### Fonctionnalités Manquantes ❌:

#### 1. **Éditeur d'Articles WYSIWYG**
```typescript
// Utiliser React-Quill ou TinyMCE
import ReactQuill from 'react-quill';

<ReactQuill
  value={articleContent}
  onChange={setArticleContent}
  modules={{
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['link', 'image'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  }}
/>
```

#### 2. **Upload de Fichiers Direct**
```typescript
// Au lieu de URL, upload direct vers Supabase Storage
const uploadFile = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('media')
    .upload(`${user.id}/${Date.now()}_${file.name}`, file);

  return data?.path;
};
```

#### 3. **Calendrier de Publication**
```typescript
// Ajouter scheduled_date dans le formulaire
<input
  type="datetime-local"
  value={scheduledDate}
  onChange={(e) => setScheduledDate(e.target.value)}
/>

// Cron job ou fonction edge pour auto-publier
// supabase/functions/auto-publish/index.ts
```

#### 4. **Preview Article**
```typescript
// Modal de prévisualisation
<ArticlePreviewModal
  article={selectedArticle}
  onClose={() => setShowPreview(false)}
/>
```

#### 5. **Statistiques/Analytics**
```typescript
// Ajouter dans le dashboard
<Card>
  <h3>📊 Statistiques</h3>
  <div>
    <p>Vues totales: {totalViews}</p>
    <p>Articles publiés: {publishedCount}</p>
    <p>Médias actifs: {activeMediaCount}</p>
  </div>
</Card>
```

#### 6. **Gestion des Tags**
```typescript
// Tag input avec autocomplete
<TagInput
  tags={articleTags}
  onTagsChange={setArticleTags}
  suggestions={existingTags}
/>
```

#### 7. **Tri et Recherche Avancés**
```typescript
// Barre de recherche globale
<input
  type="search"
  placeholder="Rechercher articles, médias..."
  onChange={(e) => handleSearch(e.target.value)}
/>

// Tri par date, popularité, statut
<select onChange={(e) => setSortBy(e.target.value)}>
  <option value="date">Date</option>
  <option value="views">Vues</option>
  <option value="title">Titre</option>
</select>
```

---

## 🚀 PLAN D'IMPLÉMENTATION RECOMMANDÉ

### Phase 1: Dashboards (1-2 jours)
1. ✅ Service scrapper IA créé
2. ✅ Composants partenaire/exposant créés
3. ⏳ Intégrer dans PartnerDashboard
4. ⏳ Intégrer dans ExhibitorDashboard
5. ⏳ Créer PartnerProfileEditor (édition manuelle)

### Phase 2: Marketing Dashboard (2-3 jours)
1. ⏳ Ajouter éditeur WYSIWYG (React-Quill)
2. ⏳ Upload direct de fichiers (Supabase Storage)
3. ⏳ Système de preview
4. ⏳ Calendrier de publication
5. ⏳ Analytics basiques

### Phase 3: Tests et Optimisations (1 jour)
1. ⏳ Tests end-to-end du scrapping
2. ⏳ Optimisation des prompts IA
3. ⏳ Gestion d'erreurs robuste
4. ⏳ Documentation utilisateur

---

## 🔐 SÉCURITÉ

### ⚠️ Checklist de Sécurité:
- ✅ Clé API dans variable d'environnement
- ✅ Validation d'URL avant scrapping
- ✅ Limitation du contenu (5000 caractères)
- ✅ Timeout sur les requêtes fetch
- ⚠️ À FAIRE: Rate limiting (max 10 scrappings/jour/utilisateur)
- ⚠️ À FAIRE: Validation côté serveur
- ⚠️ À FAIRE: Logs d'usage pour monitoring

### Mitigation des Risques:
```typescript
// Rate limiting simple
const MAX_SCRAPS_PER_DAY = 10;

const canScrap = await checkDailyLimit(userId);
if (!canScrap) {
  throw new Error('Limite quotidienne atteinte (10/jour)');
}

// Logger l'usage
await logScrapUsage(userId, websiteUrl, success);
```

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs à Tracker:
- Taux de réussite du scrapping (objectif: >85%)
- Temps moyen de scrapping (objectif: <30s)
- Taux d'édition manuelle après extraction (objectif: <30%)
- Satisfaction utilisateur (feedback)
- Coût mensuel IA (budget: <$10/mois)

### Dashboard de Monitoring:
```sql
-- Créer table de logs
CREATE TABLE scrapping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  website_url TEXT,
  scrapping_type TEXT, -- 'partner' | 'exhibitor'
  success BOOLEAN,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query analytics
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_scraps,
  COUNT(*) FILTER (WHERE success) as successful,
  SUM(cost_usd) as daily_cost,
  AVG(tokens_used) as avg_tokens
FROM scrapping_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🆘 TROUBLESHOOTING

### Problème: "OpenAI API Error 401"
**Solution:** Vérifier que `VITE_OPENAI_API_KEY` est correctement configurée dans `.env`

### Problème: "CORS Error"
**Solution:** Le proxy allorigins.win est utilisé automatiquement. Si problème persiste, utiliser un autre proxy.

### Problème: "Invalid JSON Response"
**Solution:** L'IA retourne parfois du markdown. Le service nettoie automatiquement les ````json``. Si persiste, vérifier les prompts.

### Problème: "Website Content Empty"
**Solution:**
- Vérifier que le site est accessible publiquement
- Certains sites bloquent le scrapping (Cloudflare, etc.)
- Alternative: Permettre upload manuel d'un fichier HTML

---

## 📚 RESSOURCES

### Documentation:
- OpenAI API: https://platform.openai.com/docs
- GPT-4o-mini: https://platform.openai.com/docs/models/gpt-4o-mini
- Supabase Storage: https://supabase.com/docs/guides/storage
- React-Quill: https://github.com/zenoamaro/react-quill

### Support:
- Issues GitHub: /issues
- Email: tech@siportevent.com
- Documentation: /docs/ai-scrapper

---

**Dernière mise à jour:** 2026-01-23
**Version:** 1.0.0
**Status:** ✅ Service créé, ⏳ Intégration en cours
