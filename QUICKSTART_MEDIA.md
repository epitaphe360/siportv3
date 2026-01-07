# ⚡ Quick Start - Contenu Média Enrichi

## 🎯 En 3 étapes

### 1️⃣ Appliquer le contenu

```powershell
# Méthode simple (recommandée)
.\apply-media-content.ps1

# OU en ligne de commande
npx supabase db reset
```

### 2️⃣ Démarrer l'application

```bash
npm run dev
```

### 3️⃣ Visiter les pages

- 🎥 Webinaires : http://localhost:5173/media/webinars
- 🎙️ Podcasts : http://localhost:5173/media/podcasts
- 📹 Capsules : http://localhost:5173/media/capsules
- 🎬 Live Studio : http://localhost:5173/media/live-studio
- ⭐ Best Moments : http://localhost:5173/media/best-moments
- 💬 Témoignages : http://localhost:5173/media/testimonials
- 📚 Bibliothèque : http://localhost:5173/media/library

---

## 📦 Ce qui a été ajouté

| Type | Nombre | Contenu |
|------|--------|---------|
| 🎥 Webinaires | 10 | Innovation, Cybersécurité, Blockchain, IA, etc. |
| 🎙️ Podcasts | 10 | Leaders du secteur maritime et portuaire |
| 📹 Capsules Inside | 10 | Découvertes, coulisses, interviews express |
| 🎬 Live Studio | 10 | Meet The Leaders - PDG et dirigeants |
| ⭐ Best Moments | 10 | Highlights des éditions SIPORT |
| 💬 Testimonials | 11 | Témoignages partenaires et participants |

**Total : 61 contenus - ~75h de médias** 🎉

---

## 📖 Documentation complète

- [GUIDE_MEDIA_CONTENT.md](GUIDE_MEDIA_CONTENT.md) - Guide complet
- [MEDIA_CONTENT_ENRICHMENT.md](MEDIA_CONTENT_ENRICHMENT.md) - Détails techniques

---

## ❓ Problèmes courants

**Erreur "Supabase CLI not found"**
```bash
npm install -g supabase
```

**Base de données vide après reset**
```bash
# Vérifier les migrations
npx supabase db reset --debug
```

**Contenu non visible sur les pages**
```bash
# Vérifier que le serveur dev est démarré
npm run dev

# Vérifier dans la console navigateur
```

---

**Prêt à démarrer ? Lancez `.\apply-media-content.ps1` !** 🚀
