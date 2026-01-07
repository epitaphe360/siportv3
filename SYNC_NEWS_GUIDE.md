# Guide de Synchronisation des Articles SIPORTS

## 🎯 Objectif
Synchroniser automatiquement les articles depuis le site officiel **siportevent.com/actualite-portuaire** vers l'application SIPORTS.

---

## 📍 Accès au Bouton de Synchronisation

### Interface Admin
1. Connectez-vous avec un compte **Admin**
2. Accédez au **Tableau de bord Admin**
3. Dans la section **Actions Rapides**, trouvez le bouton :
   ```
   🔄 Synchroniser Articles
   Importer depuis siportevent.com/actualite-portuaire
   ```

### Bouton de Synchronisation
- **Couleur** : Gradient indigo-purple
- **Icône** : Download (📥)
- **États** :
  - Normal : `🔄 Synchroniser Articles`
  - En cours : `⏳ Synchronisation en cours...` (icône animée)

---

## ✅ Synchronisation Automatique

### Utilisation
1. Cliquez sur le bouton **"Synchroniser Articles"**
2. L'application lance la synchronisation via l'Edge Function Supabase
3. Attendez le message de confirmation

### Messages de Succès
```
✅ Synchronisation réussie !
6 nouveaux articles, 0 mis à jour sur 6 trouvés

Les articles sont maintenant disponibles sur la page Actualités
```

### Messages d'Échec
```
❌ Échec de la synchronisation automatique

Utilisez le script manuel : node scripts/sync-siport-news.mjs
[Message d'erreur détaillé]
```

---

## 🔧 Synchronisation Manuelle

### Quand l'utiliser ?
- La synchronisation automatique échoue
- Besoin de contrôle plus fin sur le processus
- Exécution depuis le serveur ou en local

### Commande
```bash
node scripts/sync-siport-news.mjs
```

### Prérequis
- Node.js installé (v18+)
- Accès au dossier du projet
- Variables d'environnement configurées :
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Résultat du Script
```
🚀 Starting SIPORTS news synchronization
============================================================

🔍 Fetching articles from: https://siportevent.com/actualite-portuaire/
📰 Found 6 articles

Articles to sync:
  1. Ports atlantiques africains : la durabilité...
  2. Financements des ports africains...
  3. Crise des Compétences dans les Ports Atlantiques...
  4. Casablanca : Développement complexe portuaire...
  5. Glossaire portuaire...
  6. Gouvernance portuaire en Afrique...

📦 Syncing 6 articles to database...
  ✅ Inserted: Ports atlantiques africains...
  ✅ Inserted: Financements des ports africains...
  [...]

============================================================
✅ Synchronization complete!
   📊 Inserted: 6
   🔄 Updated: 0
   ⏭️  Skipped: 0
   📝 Total: 6
============================================================
```

---

## 📋 Carte d'Information

Une carte bleue s'affiche sous le bouton avec :
- **Titre** : Synchronisation manuelle
- **Message** : Instructions si la synchronisation automatique échoue
- **Commande** : `node scripts/sync-siport-news.mjs`

### Design
```
┌────────────────────────────────────────────┐
│ ℹ️ Synchronisation manuelle               │
│                                            │
│ Si la synchronisation automatique échoue, │
│ utilisez le script :                       │
│                                            │
│ node scripts/sync-siport-news.mjs         │
└────────────────────────────────────────────┘
```

---

## 🔄 Fonctionnement Technique

### Flux Automatique (Bouton)
1. Admin clique sur **"Synchroniser Articles"**
2. `handleImportArticles()` est appelé
3. Appelle `fetchFromOfficialSite()` depuis `newsStore`
4. Edge Function Supabase `sync-news-articles` exécutée
5. Scraping de **siportevent.com/actualite-portuaire**
6. Parsing HTML avec `article.elementor-post`
7. Insertion/Mise à jour dans `news_articles` table
8. Message toast avec résultats

### Flux Manuel (Script)
1. Exécution `node scripts/sync-siport-news.mjs`
2. Fetch HTML depuis siportevent.com (avec SSL désactivé)
3. Parse avec `node-html-parser`
4. Extrait : titre, excerpt, image, catégorie, tags
5. Connexion Supabase avec service role key
6. Vérification des articles existants (par titre)
7. Insert nouveaux / Update existants
8. Statistiques affichées en console

---

## 📊 Articles Synchronisés

### Structure
- **Titre** : Extrait de `.elementor-post__title a`
- **Extrait** : Extrait de `.elementor-post__excerpt p`
- **Image** : Extrait de `img[src]` ou `img[data-src]`
- **Catégorie** : Extrait de `.elementor-post__badge`
- **URL Source** : Lien vers l'article original
- **Auteur** : "Équipe SIPORTS" (par défaut)
- **Tags** : `['portuaire', 'SIPORTS', 'actualités']`

### Derniers Articles Synchronisés
1. Ports atlantiques africains : la durabilité comme nouvel axe de compétitivité
2. Financements des ports africains : Faut-il changer de modèle ?
3. Crise des Compétences dans les Ports Atlantiques
4. Casablanca : Développement de son complexe portuaire pour 5 MMDH
5. Glossaire portuaire : comprendre le langage maritime et logistique
6. Gouvernance portuaire en Afrique : autonomie ou centralisation

---

## 🐛 Dépannage

### Erreur : "Failed to fetch news page"
- Vérifier la connexion Internet
- Le site siportevent.com est peut-être temporairement indisponible
- Utiliser le script manuel avec SSL désactivé

### Erreur : "null value in column 'author'"
- Le script a été corrigé pour inclure l'auteur
- Assurez-vous d'utiliser la dernière version

### Erreur : "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
- Certificat SSL non vérifié
- Le script manuel désactive cette vérification
- Normal en développement, à corriger en production

### Aucun article trouvé
- Vérifier le sélecteur CSS : `article.elementor-post`
- Le site a peut-être changé de structure HTML
- Mettre à jour le script de scraping

---

## 📁 Fichiers Concernés

### Frontend
- `src/components/dashboard/AdminDashboard.tsx` : Bouton de synchronisation
- `src/store/newsStore.ts` : Fonction `fetchFromOfficialSite()`
- `src/pages/NewsPage.tsx` : Affichage des articles

### Backend
- `scripts/sync-siport-news.mjs` : Script manuel de synchronisation
- `supabase/functions/sync-news-articles/index.ts` : Edge Function Supabase

### Base de Données
- Table : `news_articles`
- Colonnes : `id`, `title`, `excerpt`, `content`, `author`, `category`, `image_url`, `tags`, `published`, `published_at`, `views`, `featured`

---

## 🎨 Design du Bouton

### Couleurs
- **Gradient** : `from-indigo-500 to-purple-600`
- **Hover** : `from-indigo-600 to-purple-700`
- **Background icône** : `bg-white/20` avec `backdrop-blur-sm`

### Animations
- **Hover** : `scale: 1.02`
- **Click** : `scale: 0.98`
- **Loading** : Icône bounce + curseur wait

### Responsive
- Largeur complète sur mobile
- S'adapte à la grille des actions rapides

---

## 📝 Notes Importantes

1. **Permissions** : Seuls les comptes Admin peuvent voir et utiliser ce bouton
2. **Fréquence** : Synchroniser une fois par semaine ou lors d'ajout d'articles
3. **Performance** : Le scraping prend 2-5 secondes
4. **Doublons** : Les articles existants sont détectés par titre (pas de doublons)
5. **Source** : Les articles proviennent uniquement de siportevent.com/actualite-portuaire

---

## 🚀 Prochaines Améliorations

- [ ] Planifier la synchronisation automatique (cron job)
- [ ] Historique des synchronisations dans l'admin
- [ ] Prévisualisation avant import
- [ ] Sélection des articles à importer
- [ ] Synchronisation incrémentale (seulement nouveaux)
- [ ] Notifications email aux admins après sync
- [ ] Tableau de bord des statistiques d'import

---

## 📞 Support

En cas de problème :
1. Consulter ce guide
2. Vérifier les logs dans la console navigateur
3. Exécuter le script manuel pour plus de détails
4. Contacter l'équipe technique SIPORTS

---

**Dernière mise à jour** : 4 janvier 2026
**Version** : 1.0.0
