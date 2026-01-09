# 🚀 GUIDE: Activer les Templates de Mini-Sites

## 📌 Problème
Vous ne voyez aucun template de mini-site dans l'application, même s'ils sont censés exister.

## 🔍 Cause
**La table `site_templates` n'existe pas encore dans votre base de données Supabase.**

## ✅ Solution en 3 Étapes

### Étape 1: Accéder au SQL Editor de Supabase

1. Ouvrez votre navigateur
2. Allez sur: https://supabase.com/dashboard
3. Connectez-vous avec votre compte
4. Sélectionnez votre projet: **eqjoqgpbxhsfgcovipgu**
5. Dans le menu de gauche, cliquez sur **"SQL Editor"**
6. Cliquez sur **"New query"** (en haut à droite)

### Étape 2: Exécuter le Script SQL

1. Ouvrez le fichier `SETUP_SITE_TEMPLATES.sql` (dans le dossier racine de votre projet)
2. **Copiez TOUT le contenu du fichier** (Ctrl+A puis Ctrl+C)
3. **Collez-le dans le SQL Editor de Supabase** (Ctrl+V)
4. Cliquez sur **"Run"** (ou appuyez sur Ctrl+Enter)
5. Attendez quelques secondes

Vous verrez apparaître:
```
✅ Query executed successfully
```

Puis en bas, un tableau avec les 10 templates:
```
| id                    | name                    | category   | premium | popularity | nb_sections |
|-----------------------|-------------------------|------------|---------|------------|-------------|
| template-ecommerce-1  | E-commerce Pro          | ecommerce  | true    | 320        | 2           |
| template-event-1      | Événement Premium       | event      | true    | 280        | 2           |
| template-corporate-1  | Corporate Professional  | corporate  | false   | 250        | 4           |
| ...                   | ...                     | ...        | ...     | ...        | ...         |
```

### Étape 3: Tester dans l'Application

1. Retournez dans votre application SiPorts
2. Connectez-vous avec un compte **exposant**
   - Email: `technoport@siports.ma`
   - Mot de passe: `Siports2024!`

3. Naviguez vers: **http://localhost:9323/exhibitor/minisite/create**

4. Vous verrez maintenant 2 boutons:
   - **"Partir d'un template"** ← Cliquez ici
   - "Partir de zéro"

5. Une fenêtre modale s'ouvre avec **10 templates magnifiques** ! 🎉

## 🎨 Les 10 Templates Disponibles

1. **Corporate Professional** (Corporate) - 4 sections
   - Hero, About, Products, Contact
   - 250 utilisations

2. **Startup Moderne** (Startup) - 2 sections
   - Hero avec emojis, About
   - 180 utilisations

3. **E-commerce Pro** ⭐ PREMIUM (E-commerce) - 2 sections
   - Hero, Galerie produits
   - 320 utilisations

4. **Landing Page Impact** (Landing) - 2 sections
   - Hero optimisé conversion, Contact
   - 200 utilisations

5. **Portfolio Créatif** (Portfolio) - 2 sections
   - Hero, Projets
   - 150 utilisations

6. **Événement Premium** ⭐ PREMIUM (Event) - 2 sections
   - Hero salon, About événement
   - 280 utilisations

7. **Agence Digitale** (Agency) - 1 section
   - Hero agence
   - 140 utilisations

8. **Showcase Produit** (Product) - 2 sections
   - Hero produit, Features
   - 190 utilisations

9. **Blog Professionnel** (Blog) - 1 section
   - Hero blog
   - 120 utilisations

10. **Minimaliste Élégant** (Minimal) - 2 sections
    - Hero minimal, Contact
    - 160 utilisations

## 🔧 Fonctionnalités du Sélecteur de Templates

### Recherche
- Tapez un mot-clé dans la barre de recherche
- Recherche dans le nom ET la description

### Filtres par Catégorie
- 🎨 Tous
- 🏢 Corporate
- 🛍️ E-commerce
- 🎭 Portfolio
- 🎪 Événement
- 🚀 Landing Page
- 💡 Startup
- ✨ Agence
- 📦 Produit
- 📝 Blog
- ⚪ Minimal

### Badges
- ⭐ **PREMIUM** - Templates avec fonctionnalités avancées
- 📈 **Populaire** - Plus de 100 utilisations

### Aperçu
- Image de prévisualisation pour chaque template
- Hover pour voir le bouton "Utiliser ce template"
- Affichage du nombre de sections

## 🚨 Dépannage

### Problème: "Aucun template trouvé"
**Solution:** Le script SQL n'a pas été exécuté correctement.
- Retournez à l'Étape 2
- Vérifiez que vous avez bien copié TOUT le fichier SQL
- Assurez-vous que la requête se termine par `COMMIT;`

### Problème: Templates vides ou sans aperçu
**Solution:** Les données ont été insérées partiellement.
- Ré-exécutez le script SQL complet
- Il utilise `ON CONFLICT DO UPDATE` donc il va mettre à jour les templates existants

### Problème: Erreur "RLS Policy"
**Solution:** Les politiques de sécurité sont mal configurées.
- Le script SQL inclut automatiquement les bonnes politiques
- Ré-exécutez le script complet

## 📊 Vérification Manuelle

Pour vérifier que tout fonctionne dans Supabase:

```sql
-- Compter les templates
SELECT COUNT(*) FROM site_templates;
-- Devrait retourner: 10

-- Voir tous les templates
SELECT id, name, category, premium, popularity
FROM site_templates
ORDER BY popularity DESC;
```

## 🎯 Utilisation des Templates

Une fois qu'un template est sélectionné:
1. Le SiteBuilder s'ouvre avec les sections pré-configurées
2. Vous pouvez modifier chaque section
3. Ajouter/supprimer des sections
4. Changer les couleurs, images, textes
5. Sauvegarder votre mini-site personnalisé

## 💡 Conseils

- Les templates **Premium** (⭐) ont plus de sections et de fonctionnalités
- Vous pouvez **toujours modifier** un template après l'avoir choisi
- Le choix d'un template n'est **pas définitif** - vous pouvez changer de style plus tard
- Les templates sont **responsive** - ils s'adaptent automatiquement mobile/desktop

## ✅ Checklist Finale

- [ ] Script SQL exécuté dans Supabase SQL Editor
- [ ] 10 templates visibles dans la requête de vérification
- [ ] Connexion en tant qu'exposant réussie
- [ ] Page /exhibitor/minisite/create accessible
- [ ] Modal des templates s'ouvre
- [ ] Les 10 templates s'affichent avec leurs images
- [ ] Filtres par catégorie fonctionnels
- [ ] Sélection d'un template ouvre le SiteBuilder

---

**🎉 Une fois ces étapes complétées, vous aurez accès à tous les templates de mini-sites !**
