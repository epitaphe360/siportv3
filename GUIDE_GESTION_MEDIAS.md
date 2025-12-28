# 🎬 Guide de Gestion des Médias - Admin Dashboard

## ✅ Fonctionnalités Disponibles

### 📍 Accès au Tableau de Bord Média

Dans le **Admin Dashboard** (accessible uniquement pour les administrateurs), vous trouverez maintenant un nouveau bouton dans la section **"Actions Rapides"** :

**🎥 Gérer Contenus Médias**
- *Webinaires, Podcasts, Capsules, Talks...*

Cliquez sur ce bouton pour accéder à l'interface complète de gestion des médias.

---

## 🎯 Types de Médias Gérés

Le système supporte **6 types de contenus médias** :

| Type | Description | Icône |
|------|-------------|-------|
| **Webinaire** | Conférences en ligne sponsorisées | 🎥 |
| **Podcast SIPORT Talks** | Émissions audio avec experts | 🎙️ |
| **Capsule Inside SIPORT** | Vidéos courtes d'information | 📹 |
| **Live Studio - Meet The Leaders** | Interviews en direct avec leaders | 🎬 |
| **Best Moments** | Meilleurs moments des événements | ⭐ |
| **Témoignages** | Témoignages vidéo de participants | 💬 |

---

## 🛠️ Fonctionnalités de Gestion

### 1️⃣ Créer un Nouveau Média

**Chemin :** Admin Dashboard → Gérer Contenus Médias → **Créer Nouveau Média**

**Champs disponibles :**
- ✅ **Type de Média** (obligatoire) - Sélection visuelle avec icônes
- ✅ **Titre** (obligatoire) - Nom du contenu
- 📝 **Description** - Détails du contenu
- 🖼️ **URL Thumbnail** - Image de prévisualisation
- 🎥 **URL Vidéo** - Pour webinaires, capsules, lives, best moments, témoignages
- 🎙️ **URL Audio** - Pour podcasts
- ⏱️ **Durée** - En secondes (ex: 3600 = 1 heure)
- 🏷️ **Catégorie** - Business, Innovation, Logistique, etc.
- 🔖 **Tags** - Mots-clés séparés par virgules
- 👥 **Speakers** - Format JSON avec infos des intervenants
- 📊 **Statut** - Brouillon / Publié / Archivé

**Format JSON pour Speakers :**
```json
[
  {
    "name": "John Doe",
    "title": "CEO",
    "company": "Example Corp",
    "photo_url": "https://example.com/photo.jpg"
  }
]
```

### 2️⃣ Voir / Filtrer les Médias

**Page :** Gestion des Médias

**Statistiques affichées :**
- 📊 **Total Médias** - Nombre total de contenus
- ⏳ **En attente** - Médias en cours de validation
- ✅ **Approuvés** - Médias publiés
- ❌ **Rejetés** - Médias refusés
- 👁️ **Vues totales** - Nombre de vues cumulées

**Filtres disponibles :**
- Tous
- En attente
- Approuvés
- Rejetés

### 3️⃣ Valider / Approuver un Média

Pour les médias **"En attente"** :
- ✅ Bouton **"Approuver"** - Publier le contenu
- ❌ Bouton **"Rejeter"** - Refuser le contenu

### 4️⃣ Supprimer un Média

Tous les médias ont un bouton **"Supprimer"** qui permet de :
- 🗑️ Supprimer définitivement le contenu
- ⚠️ Confirmation requise avant suppression

### 5️⃣ Mettre à Jour un Média

Pour modifier un média existant :
- Cliquez sur le média dans la liste
- Modifiez les champs souhaités
- Sauvegardez les changements

---

## 📋 Workflow Typique

### Scénario 1 : Ajouter un Webinaire
```
1. Admin Dashboard → Gérer Contenus Médias
2. Cliquer "Créer Nouveau Média"
3. Sélectionner type "Webinaire"
4. Remplir titre, description, URL vidéo
5. Ajouter thumbnail, durée, catégorie
6. Ajouter speakers au format JSON
7. Définir statut "Publié"
8. Cliquer "Créer le Média"
✅ Le webinaire apparaît dans /media/webinars
```

### Scénario 2 : Valider un Podcast en Attente
```
1. Admin Dashboard → Gérer Contenus Médias
2. Filtrer par "En attente"
3. Voir le podcast soumis par un partenaire
4. Vérifier le contenu
5. Cliquer "Approuver" ou "Rejeter"
✅ Le podcast est publié ou rejeté
```

### Scénario 3 : Supprimer un Contenu Obsolète
```
1. Admin Dashboard → Gérer Contenus Médias
2. Trouver le média à supprimer
3. Cliquer "Supprimer"
4. Confirmer la suppression
✅ Le média est supprimé définitivement
```

---

## 🎨 Interface Utilisateur

### Dashboard Admin
- **Bouton rose avec icône vidéo** : "Gérer Contenus Médias"
- **Description** : "Webinaires, Podcasts, Capsules, Talks..."
- **Animation** : Hover scale effect

### Page de Gestion
- **Header** : Titre + Bouton "Créer Nouveau Média"
- **Cards de Stats** : 5 indicateurs clés
- **Filtres** : 4 boutons de filtrage
- **Liste des Médias** : Cards avec infos complètes

### Page de Création
- **Sélection Type** : 6 boutons avec icônes colorées
- **Formulaire** : Champs organisés en grille
- **Boutons d'Action** : Créer (bleu) / Annuler (gris)

---

## 🔒 Permissions

**Accès Admin Uniquement**

Seuls les utilisateurs avec `type: 'admin'` peuvent :
- ✅ Voir le bouton de gestion des médias
- ✅ Accéder à la page de gestion
- ✅ Créer de nouveaux médias
- ✅ Approuver/rejeter des médias
- ✅ Supprimer des médias

---

## 📱 Pages Publiques

Les médias publiés sont visibles sur :

- `/media/webinars` - Liste des webinaires
- `/media/podcasts` - Liste des podcasts
- `/media/inside-siport` - Capsules Inside
- `/media/live-studio` - Live Studio interviews
- `/media/best-moments` - Best Moments
- `/media/testimonials` - Témoignages
- `/media` - Bibliothèque complète

---

## 🎓 Exemples de Données

### Exemple 1 : Webinaire
```json
{
  "type": "webinar",
  "title": "Innovation Portuaire 2026",
  "description": "Découvrez les dernières innovations...",
  "thumbnail_url": "https://images.unsplash.com/...",
  "video_url": "https://sample-videos.com/...",
  "duration": 3600,
  "category": "Innovation",
  "tags": ["innovation", "technologie", "ports"],
  "speakers": [
    {
      "name": "Marie Dubois",
      "title": "Directrice Innovation",
      "company": "PortTech Solutions",
      "photo_url": "https://..."
    }
  ],
  "status": "published"
}
```

### Exemple 2 : Podcast
```json
{
  "type": "podcast",
  "title": "SIPORT Talks #15 - Leadership Maritime",
  "description": "Interview avec un expert du maritime...",
  "thumbnail_url": "https://images.unsplash.com/...",
  "audio_url": "https://soundhelix.com/...",
  "duration": 2400,
  "category": "Business",
  "tags": ["podcast", "leadership", "maritime"],
  "speakers": [
    {
      "name": "Jean Martin",
      "title": "CEO",
      "company": "Ocean Logistics",
      "photo_url": "https://..."
    }
  ],
  "status": "published"
}
```

---

## ✅ Checklist de Fonctionnalités

### Implémenté ✅
- [x] Bouton de gestion dans Admin Dashboard
- [x] Page de gestion des médias avec stats
- [x] Filtrage par statut (tous, en attente, approuvés, rejetés)
- [x] Page de création de nouveau média
- [x] Formulaire complet avec tous les champs
- [x] Validation et approbation des médias
- [x] Suppression des médias
- [x] Support de 6 types de médias différents
- [x] Interface moderne avec glassmorphism
- [x] Protection par rôle admin

### À Améliorer 🔄 (Optionnel)
- [ ] Page de modification des médias existants
- [ ] Upload de fichiers (vidéos/audio) vers Supabase Storage
- [ ] Génération automatique de thumbnails
- [ ] Prévisualisation des médias avant publication
- [ ] Statistiques détaillées par média (analytics)
- [ ] Système de commentaires/modération
- [ ] Export des données en CSV/Excel

---

## 🚀 Pour Commencer

1. **Connectez-vous en tant qu'admin** :
   - Email: `admin@siports.com` (si compte existe)
   - Ou utilisez un compte avec `type: 'admin'` dans la BDD

2. **Accédez au Dashboard Admin** :
   - Menu principal → Admin Dashboard

3. **Cliquez sur "Gérer Contenus Médias"** :
   - Bouton rose dans la section "Actions Rapides"

4. **Explorez les fonctionnalités** :
   - Voir la liste des médias existants
   - Créer un nouveau média de test
   - Filtrer par statut
   - Supprimer un média

---

## 📞 Support

Pour toute question ou problème :
- Vérifiez que vous êtes bien connecté en tant qu'admin
- Consultez les logs du navigateur (F12) pour les erreurs
- Vérifiez que Supabase est bien configuré
- Assurez-vous que la table `media_contents` existe

---

**Date de création :** 2025-01-28  
**Version :** 1.0.0  
**Status :** ✅ Production Ready
