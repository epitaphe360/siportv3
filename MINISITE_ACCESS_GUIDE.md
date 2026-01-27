# 🌐 Guide d'accès aux Mini-sites

## ✅ Problème résolu !

Le bouton pour accéder aux mini-sites a été **ajouté** dans la page des exposants.

## 📍 Où trouver les mini-sites ?

### 1. Depuis la page Exposants (`/exhibitors`)
- Chaque carte d'exposant a maintenant un **bouton Globe (🌐)** vert
- Cliquez dessus pour accéder au mini-site de l'exposant

### 2. Accès direct par URL
Utilisez l'URL : `/minisite/[EXHIBITOR_ID]`

### 3. Répertoire complet
Visitez `/minisites` pour voir tous les mini-sites disponibles

## 🎯 Mini-sites disponibles dans votre base de données

Voici les exposants qui ont des mini-sites actifs :

1. **TechMarine Solutions**
   - ID: `8157eab4-6b7f-46fb-80f9-0e0dc30faeab`
   - URL: http://localhost:5173/minisite/8157eab4-6b7f-46fb-80f9-0e0dc30faeab
   - Thème: Modern
   - Catégorie: Port Operations

2. **OceanLogistics Pro**
   - ID: `7b52cb23-b734-42e8-b962-2ea002180bde`
   - URL: http://localhost:5173/minisite/7b52cb23-b734-42e8-b962-2ea002180bde
   - Thème: Corporate
   - Catégorie: Port Industry

3. **PortTech Industries**
   - ID: `4c544867-72f7-4dff-9342-eff08147fcc7`
   - URL: http://localhost:5173/minisite/4c544867-72f7-4dff-9342-eff08147fcc7
   - Thème: Industrial
   - Catégorie: Port Operations

4. **Exposant #2**
   - ID: `4f085daf-d006-4018-81bf-b53bb0c9a8bf`
   - URL: http://localhost:5173/minisite/4f085daf-d006-4018-81bf-b53bb0c9a8bf
   - Thème: Modern
   - Catégorie: Institutional

## 🔧 Ce qui a été corrigé

### Fichiers modifiés :
1. **`src/components/exhibitor/ExhibitorCard.tsx`**
   - ✅ Ajout du bouton Globe pour accéder aux mini-sites
   - ✅ Visible dans la vue grille ET liste
   - ✅ Style cohérent avec le design existant

### Nouveaux fichiers créés :
1. **`src/components/minisite/MiniSiteDirectory.tsx`**
   - Page de répertoire pour lister tous les mini-sites

2. **`check_minisites.py`**
   - Script pour vérifier l'état des mini-sites dans la BDD

3. **`list_minisites.py`**
   - Script pour lister tous les mini-sites disponibles

4. **`minisites-index.html`**
   - Page HTML de référence rapide pour tester les URLs

## 🚀 Comment tester

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```

2. **Accéder à la page exposants** :
   ```
   http://localhost:5173/exhibitors
   ```

3. **Cliquer sur le bouton Globe (🌐)** sur n'importe quelle carte d'exposant

4. **OU accéder directement au répertoire** :
   ```
   http://localhost:5173/minisites
   ```

## 💡 Note importante

Si vous voyez l'erreur "Ce mini-site n'existe pas", c'est parce que :
- L'exposant n'a pas encore créé son mini-site
- L'ID utilisé est incorrect
- Le mini-site n'est pas publié

Les 6 mini-sites listés ci-dessus sont **publiés et fonctionnels** !

## 📊 Statistiques actuelles

- ✅ **6 mini-sites** publiés dans la base de données
- ✅ **4 exposants** différents avec mini-sites
- ✅ **3 thèmes** utilisés (Modern, Corporate, Industrial)
- ✅ **0 vues** enregistrées (nouvellement créés)
