# 📋 Guide d'utilisation des Shortcodes

## Vue d'ensemble

Le tableau de bord marketing permet de gérer les **médias** (photos, vidéos, podcasts) et les **articles** qui s'affichent automatiquement sur siportevent.com via des **shortcodes**.

---

## 🎯 Qu'est-ce qu'un shortcode ?

Un shortcode est un code court que vous pouvez copier-coller dans n'importe quelle page du site pour afficher automatiquement du contenu.

**Exemple :**
```
[article id="abc-123-def-456"]
```

Quand ce code est inséré dans une page, l'article correspondant s'affiche avec sa mise en forme complète (titre, image, contenu, tags, etc.).

---

## 📊 Tableau de bord Marketing

### Accès
- **URL :** `/marketing/dashboard`
- **Permissions :** Réservé aux administrateurs et à l'équipe marketing

### Onglets disponibles

#### 1️⃣ Onglet **Médias**
Gérez vos contenus multimédias :
- ✅ **Photos** (galeries, événements)
- 🎥 **Vidéos** (webinaires, capsules Inside, live studio, best moments, témoignages)
- 🎙️ **Podcasts** (interviews, débats)

**Actions disponibles :**
- ➕ Ajouter un nouveau média
- 📝 Publier / Dépublier
- 🗑️ Supprimer
- 📊 Voir les statistiques (vues, téléchargements)

#### 2️⃣ Onglet **Articles**
Gérez vos articles de blog/actualités :
- 📰 Liste complète des articles
- 📋 **Shortcode unique** pour chaque article
- ✅ Publier / Dépublier
- 🗑️ Supprimer

**Informations affichées :**
- Titre, extrait, image
- Auteur, catégorie, tags
- Date de création/publication
- Statut (Publié ✅ ou Brouillon 📝)

---

## 🔧 Comment utiliser les shortcodes

### Étape 1 : Copier le shortcode
1. Allez dans **Dashboard Marketing** → Onglet **Articles**
2. Trouvez l'article que vous voulez afficher
3. Cliquez sur le bouton **📋 Copier** à côté du shortcode

### Étape 2 : Coller dans une page
1. Éditez la page où vous voulez afficher l'article
2. Collez le shortcode à l'endroit souhaité :
   ```html
   <div>
     [article id="00000000-0000-0000-0000-000000000401"]
   </div>
   ```

### Étape 3 : Rendu automatique
Le système détecte automatiquement le shortcode et affiche l'article avec :
- ✅ Titre formaté
- ✅ Image à la une
- ✅ Contenu complet
- ✅ Tags et catégorie
- ✅ Informations auteur/date
- ✅ Design responsive

---

## 📝 Format des shortcodes

### Article simple
```
[article id="uuid-de-l-article"]
```

### Exemples pratiques

#### Afficher un article d'actualité
```html
<section class="actualites">
  <h2>Dernières nouvelles</h2>
  [article id="00000000-0000-0000-0000-000000000401"]
</section>
```

#### Afficher plusieurs articles
```html
<div class="blog-grid">
  [article id="article-1-uuid"]
  [article id="article-2-uuid"]
  [article id="article-3-uuid"]
</div>
```

---

## 🎨 Gestion des articles

### Créer un nouvel article
1. Allez dans la base de données Supabase
2. Table : `news_articles`
3. Insérez un nouvel enregistrement :
   ```sql
   INSERT INTO news_articles (
     title,
     content,
     excerpt,
     author,
     published,
     category,
     tags,
     image_url
   ) VALUES (
     'Mon titre',
     'Contenu complet de l\'article...',
     'Résumé court',
     'Jean Dupont',
     true,
     'Actualités',
     ARRAY['salon', 'innovation'],
     'https://url-image.jpg'
   );
   ```

### Publier/Dépublier depuis le dashboard
- ✅ **Publier** : L'article devient visible sur le site
- 📝 **Dépublier** : L'article passe en brouillon (invisible)

### Supprimer un article
- 🗑️ Le shortcode ne fonctionnera plus
- ⚠️ Action irréversible

---

## 🔐 Permissions et sécurité

### Row Level Security (RLS)
- **Lecture publique** : Les articles publiés sont visibles par tous
- **Écriture admin** : Seuls les admins peuvent créer/modifier/supprimer

### Politique RLS active
```sql
-- Lecture : articles publiés uniquement
CREATE POLICY "Public can view published articles"
ON news_articles FOR SELECT
USING (published = true);

-- Écriture : admins uniquement
CREATE POLICY "Admins can manage articles"
ON news_articles FOR ALL
USING (auth.role() = 'admin');
```

---

## 📊 Statistiques disponibles

### Par média
- 👁️ **Vues** : Nombre de consultations
- ⬇️ **Téléchargements** : Nombre de téléchargements
- ❤️ **Likes** : Nombre de j'aime
- 📤 **Partages** : Nombre de partages

### Par article
- 📈 Nombre d'articles totaux
- ✅ Nombre d'articles publiés
- 📝 Nombre de brouillons

---

## 🚀 Déploiement automatique

### Railway
- Chaque modification est automatiquement déployée sur Railway
- L'URL de production : `https://siportv3.up.railway.app`

### Base de données
- Table principale : `news_articles`
- Table médias : `media_contents`
- Synchronisation automatique

---

## 💡 Bonnes pratiques

### ✅ À faire
- Toujours ajouter un **excerpt** (résumé) clair
- Utiliser des **images de qualité** (min. 800px de large)
- Ajouter des **tags pertinents** pour le référencement
- Prévisualiser avant de publier

### ❌ À éviter
- Ne pas laisser de champs vides (title, content)
- Ne pas utiliser d'images trop lourdes (>2MB)
- Ne pas supprimer un article utilisé dans plusieurs pages
- Ne pas oublier de publier après création

---

## 🐛 Dépannage

### Le shortcode ne s'affiche pas
1. Vérifiez que l'article est **publié** (pas en brouillon)
2. Vérifiez que l'**ID est correct**
3. Vérifiez que le format du shortcode est exact : `[article id="uuid"]`

### L'article s'affiche mal
1. Vérifiez le contenu HTML de l'article
2. Assurez-vous que l'image_url est valide
3. Vérifiez les permissions RLS dans Supabase

### Erreur de chargement
1. Vérifiez la connexion à Supabase
2. Vérifiez les logs du serveur Railway
3. Testez en local avec `npm run dev`

---

## 📞 Support

Pour toute question ou problème :
- 📧 **Email** : support@siportevent.com
- 💬 **Discord** : Canal #support-technique
- 📱 **WhatsApp** : +33 6 XX XX XX XX

---

## 🔄 Mises à jour récentes

### Version 1.2 (30 décembre 2025)
- ✅ Ajout de l'onglet Articles au dashboard
- ✅ Système de shortcodes automatique
- ✅ Copie en un clic du shortcode
- ✅ Statistiques par type de contenu
- ✅ Interface responsive et intuitive

---

**Dernière mise à jour :** 30 décembre 2025  
**Auteur :** Équipe Technique SIPORTS
