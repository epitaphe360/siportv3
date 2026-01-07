# 🎬 Guide d'Utilisation du Contenu Média Enrichi

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Comment appliquer le contenu](#comment-appliquer-le-contenu)
3. [Explorer le contenu](#explorer-le-contenu)
4. [Statistiques détaillées](#statistiques-détaillées)
5. [FAQ](#faq)

---

## 🌟 Vue d'ensemble

Votre plateforme SIPORT dispose maintenant d'un **contenu média enrichi** avec **61 contenus uniques** répartis sur 6 catégories :

- 🎥 **10 Webinaires** (~30h de vidéo)
- 🎙️ **10 Podcasts** (~20h d'audio)
- 📹 **10 Capsules Inside** (~35 minutes)
- 🎬 **10 Interviews Live Studio** (~23h)
- ⭐ **10 Best Moments** (~50 minutes)
- 💬 **11 Témoignages** (~20 minutes)

**Total : ~74h 45min de contenu multimédia**

---

## 🚀 Comment appliquer le contenu

### Méthode 1 : Script PowerShell (Recommandé)

```powershell
# Exécuter le script d'installation
.\apply-media-content.ps1
```

Le script vous proposera plusieurs options :
1. Reset complet de la base de données ✅ (recommandé)
2. Appliquer uniquement les seeds
3. Afficher le fichier de seed
4. Annuler

### Méthode 2 : Commandes manuelles

```bash
# Option A: Reset complet (recommandé pour la première fois)
npx supabase db reset

# Option B: Appliquer uniquement les seeds
npx supabase db seed
```

### Méthode 3 : Via Supabase Studio

1. Ouvrir Supabase Studio : `npx supabase studio`
2. Aller dans l'onglet **SQL Editor**
3. Copier le contenu de `supabase/migrations/20250220000001_seed_media_data.sql`
4. Exécuter la requête

---

## 🔍 Explorer le contenu

### Pages accessibles

Une fois le contenu importé, visitez ces pages :

#### 🎥 Webinaires
```
http://localhost:5173/media/webinars
```
**Contenus disponibles :**
- Innovation Portuaire 2025
- Logistique Verte
- Cybersécurité Portuaire
- Blockchain et Traçabilité
- RH et Talents
- Intelligence Artificielle
- Financement
- Réglementation Maritime 2025
- Smart Ports
- Économie Circulaire

#### 🎙️ Podcasts SIPORT Talks
```
http://localhost:5173/media/podcasts
```
**Épisodes disponibles :**
- #1 - Ahmed Hassan (Logistique Maritime)
- #2 - Clara Dubois (Innovation)
- #3 - Amadou Koné (Ports Africains)
- #4 - Marina Silva (Transition Énergétique)
- #5 - Dr. Hans Schmidt (Automatisation)
- #6 - Samira Alaoui (Femmes Leaders)
- #7 - Jean-Paul Océan (Économie Bleue)
- #8 - Patricia N'Dour (Formation)
- #9 - Alexandre Fontaine (PPP)
- #10 - Fatou Diagne (Digitalisation)

#### 📹 Capsules Inside SIPORT
```
http://localhost:5173/media/capsules
```
**Capsules disponibles :**
- Découverte du Pavillon Innovation
- Coulisses de l'Organisation
- Startups Maritime Tech
- Visite Stand Maersk
- Making-Of du Salon
- Zone Networking
- Démonstrations Technologiques
- Focus Partenaires Gold
- Conférence Inaugurale
- Workshops Pratiques

#### 🎬 Live Studio - Meet The Leaders
```
http://localhost:5173/media/live-studio
```
**Interviews disponibles :**
- François Mercier (SeaConnect)
- Aïcha Diallo (AfroPort Logistics)
- Carlos Rodriguez (CMA CGM Afrique)
- Dr. Kwame Asante (Ministre Ghana)
- Léa Fontaine (DP World Dakar)
- Omar Benali (APM Terminals)
- Sarah Johnson (Bolloré Logistics)
- Jean-Marc Dubois (MSC Afrique)
- Aminata Touré (APAC)
- Patrick O'Brien (Hutchison Ports)

#### ⭐ Best Moments
```
http://localhost:5173/media/best-moments
```
**Highlights disponibles :**
- SIPORT 2025 - Jour 1
- SIPORT 2025 - Jour 2
- Gala de Clôture
- SIPORT 2024 - Rétrospective
- Les Annonces Majeures
- Démonstrations Spectaculaires
- Networking
- Témoignages Spontanés
- Coulisses du Succès
- Édition Collector

#### 💬 Testimonials
```
http://localhost:5173/media/testimonials
```
**Témoignages disponibles :**
- Port Autonome de Dakar
- TechMarine Solutions
- Bolloré Logistics
- Port de Lomé
- Startup MarineAI
- CMA CGM
- Port de Cotonou
- Jeune Diplômé
- MSC
- Consultant Indépendant
- APM Terminals

#### 📚 Bibliothèque Média Complète
```
http://localhost:5173/media/library
```
Accès centralisé à tous les types de contenu avec filtres avancés.

---

## 📊 Statistiques détaillées

### Par Type de Contenu

| Type | Nombre | Durée Totale | Durée Moyenne |
|------|--------|--------------|---------------|
| Webinaires | 10 | ~30h | ~3h |
| Podcasts | 10 | ~20h | ~2h |
| Capsules Inside | 10 | ~35min | ~3.5min |
| Live Studio | 10 | ~23h | ~2h18min |
| Best Moments | 10 | ~50min | ~5min |
| Testimonials | 11 | ~20min | ~1.8min |

### Par Catégorie

| Catégorie | Nombre |
|-----------|--------|
| Business | 8 |
| Technologie | 7 |
| Leadership | 6 |
| Événement | 6 |
| Témoignage | 11 |
| Innovation | 5 |
| Environnement | 4 |
| Politique | 2 |
| Éducation | 2 |
| Partenaires | 2 |

### Couverture Géographique

- 🌍 **Afrique de l'Ouest** : 40%
- 🌍 **Afrique du Nord** : 25%
- 🌍 **Europe** : 20%
- 🌍 **International** : 15%

### Profils d'Intervenants

- 👔 **C-Level (PDG, CEO, DG)** : 35%
- 👩‍💼 **Directeurs/VP** : 30%
- 🎓 **Experts/Consultants** : 20%
- 🏛️ **Gouvernementaux** : 10%
- 🚀 **Startups/Entrepreneurs** : 5%

---

## 🎯 Cas d'Usage

### Pour les Visiteurs

1. **Découvrir les tendances** : Webinaires sur les innovations
2. **S'inspirer** : Podcasts avec les leaders
3. **Se former** : Capsules et workshops
4. **Évaluer SIPORT** : Témoignages et Best Moments

### Pour les Partenaires

1. **Visibilité** : Présence dans les contenus
2. **Thought Leadership** : Interviews et webinaires
3. **Networking** : Connexion avec les participants
4. **ROI démontrable** : Témoignages quantifiés

### Pour les Exposants

1. **Promotion** : Capsules Inside
2. **Éducation** : Démonstrations produits
3. **Lead Generation** : Webinaires sponsorisés
4. **Success Stories** : Témoignages clients

---

## 🔍 Vérification du Contenu

### Commandes SQL utiles

```sql
-- Compter les médias par type
SELECT type, COUNT(*) as total 
FROM media_contents 
GROUP BY type 
ORDER BY total DESC;

-- Lister les 10 derniers contenus publiés
SELECT type, title, published_at 
FROM media_contents 
WHERE status = 'published' 
ORDER BY published_at DESC 
LIMIT 10;

-- Obtenir les statistiques globales
SELECT 
  COUNT(*) as total_contents,
  COUNT(DISTINCT type) as types_count,
  SUM(duration) as total_duration_seconds,
  AVG(duration) as avg_duration_seconds
FROM media_contents 
WHERE status = 'published';

-- Top 5 des catégories les plus représentées
SELECT category, COUNT(*) as count
FROM media_contents
WHERE status = 'published'
GROUP BY category
ORDER BY count DESC
LIMIT 5;
```

### Tests d'Interface

**Checklist des fonctionnalités à tester :**

- [ ] Navigation entre les pages média
- [ ] Affichage des cartes de contenu
- [ ] Filtres par catégorie
- [ ] Barre de recherche
- [ ] Lecture vidéo/audio
- [ ] Affichage des speakers
- [ ] Tags et métadonnées
- [ ] Responsive design
- [ ] Performance de chargement

---

## ❓ FAQ

### Q: Le contenu est-il réel ou fictif ?

**R:** Le contenu actuel est **fictif et à but de démonstration**. Les URLs vidéo/audio pointent vers des exemples. Vous devrez les remplacer par vos vrais contenus.

### Q: Comment ajouter mon propre contenu ?

**R:** 
1. Via l'interface admin (à venir)
2. Via SQL : INSERT INTO media_contents
3. En modifiant le fichier seed

### Q: Les vidéos/audios fonctionnent-ils ?

**R:** Les URLs sont des placeholders. Remplacez-les par :
- Vos URLs Supabase Storage
- URLs YouTube/Vimeo
- URLs de streaming (HLS/DASH)

### Q: Comment personnaliser les intervenants ?

**R:** Modifiez le champ `speakers` (format JSONB) :
```json
[
  {
    "name": "Votre Nom",
    "title": "Votre Titre",
    "company": "Votre Entreprise",
    "photo_url": "URL de votre photo"
  }
]
```

### Q: Puis-je supprimer certains contenus ?

**R:** Oui, via SQL :
```sql
DELETE FROM media_contents 
WHERE id = 'uuid-du-contenu';
```

### Q: Comment mettre à jour un contenu ?

**R:** Via SQL :
```sql
UPDATE media_contents 
SET 
  title = 'Nouveau titre',
  description = 'Nouvelle description'
WHERE id = 'uuid-du-contenu';
```

### Q: Le contenu est-il SEO-friendly ?

**R:** Oui, chaque contenu a :
- Titre descriptif
- Description complète
- Tags pertinents
- Metadata structurée

---

## 🛠️ Maintenance

### Ajouter un nouveau webinaire

```sql
INSERT INTO media_contents (
  type, title, description, 
  thumbnail_url, video_url, duration,
  speakers, tags, category, status, published_at
) VALUES (
  'webinar',
  'Titre de votre webinaire',
  'Description complète...',
  'URL de la thumbnail',
  'URL de la vidéo',
  3600, -- durée en secondes
  '[{"name": "Speaker", "title": "Title", "company": "Company"}]'::jsonb,
  ARRAY['tag1', 'tag2', 'tag3'],
  'Catégorie',
  'published',
  NOW()
);
```

### Modifier le statut

```sql
-- Publier un brouillon
UPDATE media_contents 
SET status = 'published', published_at = NOW()
WHERE id = 'uuid';

-- Archiver un contenu
UPDATE media_contents 
SET status = 'archived'
WHERE id = 'uuid';
```

---

## 📞 Support

Pour toute question ou problème :

1. Consulter la documentation : `docs/MEDIA_FEATURES_INTEGRATION.md`
2. Vérifier les logs Supabase
3. Inspecter la console navigateur
4. Tester les requêtes SQL manuellement

---

## 🎉 Conclusion

Vous disposez maintenant d'une **bibliothèque média complète et professionnelle** pour votre plateforme SIPORT !

**Prochaines étapes recommandées :**

1. ✅ Appliquer le contenu (via script ou commande)
2. ✅ Tester toutes les pages média
3. 📸 Remplacer les URLs par vos vrais médias
4. 🎨 Personnaliser les intervenants
5. 🚀 Déployer en production

**Bon travail !** 🚀

---

*Guide mis à jour le 22 décembre 2025*
