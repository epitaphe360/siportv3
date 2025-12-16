# Import Manuel du Musée des Ports dans Elementor

## 🎯 Méthode Copier-Coller (10 minutes)

Cette méthode fonctionne à 100% car vous copiez-collez directement le HTML dans des widgets Elementor.

---

## Section 1 : Hero (En-tête)

1. **Dans Elementor**, ajoutez une **Section**
2. Ajoutez un widget **Éditeur de texte**
3. Passez en mode **Texte** (pas Visuel)
4. Copiez-collez ce code :

```html
<style>
.musee-hero {
  background: linear-gradient(rgba(0,51,102,0.7), rgba(0,51,102,0.7));
  padding: 150px 20px;
  text-align: center;
  color: #fff;
}
.musee-hero h1 {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
.musee-hero h2 {
  font-size: 28px;
  color: #D4AF37;
  letter-spacing: 3px;
}
@media (max-width: 768px) {
  .musee-hero h1 { font-size: 36px; }
  .musee-hero h2 { font-size: 20px; }
}
</style>
<div class="musee-hero">
  <h1>Le Musée des Ports</h1>
  <h2>SIPORTS 2026</h2>
</div>
```

---

## Section 2 : Introduction

1. Ajoutez une nouvelle **Section**
2. Ajoutez un widget **Éditeur de texte**
3. Mode **Texte**
4. Copiez-collez :

```html
<style>
.musee-intro {
  padding: 80px 20px;
  text-align: center;
  background: #fff;
}
.musee-intro h2 {
  font-size: 38px;
  font-weight: 600;
  color: #003366;
  margin-bottom: 30px;
}
.musee-divider {
  width: 150px;
  height: 3px;
  background: #D4AF37;
  margin: 30px auto;
}
.musee-intro p {
  max-width: 900px;
  margin: 20px auto;
  font-size: 18px;
  color: #666;
  line-height: 1.8;
}
.musee-intro .highlight {
  font-size: 19px;
  color: #003366;
  font-weight: 500;
}
@media (max-width: 768px) {
  .musee-intro h2 { font-size: 28px; }
}
</style>
<div class="musee-intro">
  <h2>Le sillage Marocain : mémoire et horizons</h2>
  <div class="musee-divider"></div>
  <p>Des pirogues ancestrales aux géants des océans, le Maroc poursuit son sillage. Chaque traversée, chaque escale, y grave une empreinte.</p>
  <p class="highlight">Cette empreinte est le <strong>sillage</strong> : symbole d'une mémoire vive, témoin de la conversation entre le savoir-faire et les flots, lien tangible entre notre passé et notre avenir.</p>
  <p>Écho des ports et des hommes, dialogue entre la technique et les éléments, il relie les époques. Le Musée des Ports vous invite à remonter ce fil bleu, à explorer ses métamorphoses et à en imaginer la suite, dans une perspective ouverte sur les dynamiques et les enjeux du monde.</p>
</div>
```

---

## Section 3 : Aménager le rivage

1. Nouvelle **Section** avec fond gris `#f5f8fc`
2. Widget **Éditeur de texte**
3. Copiez-collez :

```html
<style>
.musee-section {
  padding: 80px 20px;
  text-align: center;
}
.musee-icon {
  font-size: 72px;
  margin-bottom: 20px;
}
.musee-section h3 {
  font-size: 32px;
  font-weight: 600;
  color: #003366;
  margin-bottom: 10px;
}
.musee-section h4 {
  font-size: 20px;
  font-style: italic;
  color: #D4AF37;
  margin-bottom: 30px;
}
.musee-section p {
  max-width: 800px;
  margin: 0 auto;
  font-size: 18px;
  color: #666;
  line-height: 1.8;
}
@media (max-width: 768px) {
  .musee-section h3 { font-size: 24px; }
}
</style>
<div class="musee-section">
  <div class="musee-icon">⚓</div>
  <h3>Aménager le rivage</h3>
  <h4>Construire, connecter, faire circuler</h4>
  <p>Avant d'être un carrefour, le port est une géographie réinventée. Il naît de l'audace qui unit la mer et la terre. Chaque phare, chaque digue, chaque quai raconte cette alchimie où l'ingénierie épouse la nature pour créer un lieu de convergence des continents.</p>
</div>
```

---

## Section 4 : Habiter le port

1. Nouvelle **Section** (fond blanc)
2. Widget **Éditeur de texte**
3. Copiez-collez :

```html
<div class="musee-section">
  <div class="musee-icon">🏗️</div>
  <h3>Habiter le port</h3>
  <h4>Organiser l'espace, synchroniser les flux</h4>
  <p>Le port est un organisme palpitant, un ballet perpétuel d'énergies et d'intelligences. Il orchestre les flux, harmonise les gestes et fait dialoguer l'humain avec la machine. Des conteneurs aux savoir-faire ancestraux, il incarne un écosystème en perpétuelle renaissance, au cœur du souffle des échanges globaux.</p>
</div>
```

---

## Section 5 : Rêver les quais

1. Nouvelle **Section** avec fond gris `#f5f8fc`
2. Widget **Éditeur de texte**
3. Copiez-collez :

```html
<div class="musee-section">
  <div class="musee-icon">🌊</div>
  <h3>Rêver les quais</h3>
  <h4>Imaginer, expérimenter, créer</h4>
  <p>Face à l'océan des possibles et des défis, les quais deviennent des espaces de projection. Ports intelligents, durables et résilients y esquissent les archipels de demain, où le commerce et la coopération redessinent la carte d'un futur partagé.</p>
</div>
```

---

## Section 6 : Citation

1. Nouvelle **Section** avec fond dégradé bleu
   - Style → Arrière-plan → Dégradé
   - Couleur 1 : `#003366`
   - Couleur 2 : `#0066cc`
   - Angle : 135°
2. Widget **Éditeur de texte**
3. Copiez-collez :

```html
<style>
.musee-quote {
  padding: 100px 20px;
  text-align: center;
  color: #fff;
}
.musee-quote .icon {
  font-size: 64px;
  color: #D4AF37;
  margin-bottom: 30px;
}
.musee-quote p {
  max-width: 900px;
  margin: 0 auto;
  font-size: 28px;
  font-weight: 300;
  font-style: italic;
  line-height: 1.6;
}
@media (max-width: 768px) {
  .musee-quote p { font-size: 20px; }
}
</style>
<div class="musee-quote">
  <div class="icon">"</div>
  <p>Le Musée des Ports est une traversée temporelle qui vous invite à vivre l'épopée des ports d'hier pour mieux imaginer et construire ceux de demain.</p>
  <div class="icon">"</div>
</div>
```

---

## Section 7 : Expérience Immersive

1. Nouvelle **Section** (fond blanc)
2. Widget **Éditeur de texte**
3. Copiez-collez :

```html
<style>
.musee-experience {
  padding: 80px 20px;
}
.musee-experience h2 {
  font-size: 38px;
  font-weight: 600;
  color: #003366;
  text-align: center;
  margin-bottom: 30px;
}
.musee-experience .divider {
  width: 150px;
  height: 3px;
  background: #D4AF37;
  margin: 30px auto 50px;
}
.experience-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}
.experience-card {
  background: #f5f8fc;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}
.experience-card:hover {
  transform: translateY(-10px);
}
.experience-card .icon {
  font-size: 48px;
  margin-bottom: 20px;
}
.experience-card h3 {
  color: #003366;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 15px;
}
.experience-card p {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
}
@media (max-width: 768px) {
  .musee-experience h2 { font-size: 28px; }
}
</style>
<div class="musee-experience">
  <h2>Une Expérience Immersive</h2>
  <div class="divider"></div>
  <div class="experience-grid">
    <div class="experience-card">
      <div class="icon">🚢</div>
      <h3>Histoire Maritime</h3>
      <p>Découvrez l'évolution des ports marocains à travers les siècles</p>
    </div>
    <div class="experience-card">
      <div class="icon">🔧</div>
      <h3>Innovations Techniques</h3>
      <p>Explorez les technologies qui façonnent les ports modernes</p>
    </div>
    <div class="experience-card">
      <div class="icon">🌍</div>
      <h3>Connexions Mondiales</h3>
      <p>Comprenez le rôle des ports dans le commerce international</p>
    </div>
    <div class="experience-card">
      <div class="icon">♻️</div>
      <h3>Développement Durable</h3>
      <p>Imaginez les ports écologiques du futur</p>
    </div>
  </div>
</div>
```

---

## Section 8 : Call-to-Action

1. Nouvelle **Section** avec fond dégradé bleu (comme Section 6)
2. Widget **Éditeur de texte**
3. Copiez-collez :

```html
<style>
.musee-cta {
  padding: 80px 20px;
  text-align: center;
  color: #fff;
}
.musee-cta h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
}
.musee-cta p {
  font-size: 18px;
  margin-bottom: 30px;
  color: rgba(255,255,255,0.9);
}
.musee-cta .buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.musee-cta a {
  display: inline-block;
  font-size: 18px;
  font-weight: 600;
  padding: 15px 40px;
  border-radius: 50px;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s;
}
.musee-cta .btn-primary {
  background: #D4AF37;
  color: #003366;
}
.musee-cta .btn-primary:hover {
  background: #F4C542;
  transform: scale(1.05);
}
.musee-cta .btn-outline {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
}
.musee-cta .btn-outline:hover {
  background: #fff;
  color: #003366;
}
@media (max-width: 768px) {
  .musee-cta h2 { font-size: 28px; }
  .musee-cta .buttons { flex-direction: column; align-items: center; }
  .musee-cta a { width: 100%; max-width: 300px; }
}
</style>
<div class="musee-cta">
  <h2>Visitez le Musée des Ports</h2>
  <p>Ouverture officielle le 2 Avril 2026 dans le cadre de SIPORTS 2026<br>Mohammed VI Exhibition Center, El Jadida, Maroc</p>
  <div class="buttons">
    <a href="/visitor/subscription" class="btn-primary">Réserver ma visite</a>
    <a href="/programme" class="btn-outline">Voir le programme</a>
  </div>
</div>
```

---

## ✅ Résumé de l'import

Vous venez de créer **8 sections** avec du contenu complet !

**Couleurs des fonds :**
- Section 1 (Hero) : Intégré dans le CSS
- Section 2 (Intro) : Blanc
- Section 3 (Aménager) : Gris `#f5f8fc`
- Section 4 (Habiter) : Blanc
- Section 5 (Rêver) : Gris `#f5f8fc`
- Section 6 (Citation) : Dégradé bleu
- Section 7 (Expérience) : Blanc
- Section 8 (CTA) : Dégradé bleu

**Pour publier :**
1. Vérifiez que tout s'affiche correctement
2. Cliquez sur **Mettre à jour** / **Publier**
3. C'est fait ! 🎉

---

## 💡 Astuce Rapide

Au lieu de copier-coller section par section, vous pouvez :
1. Créer une page vide
2. Utiliser l'**Éditeur de code WordPress** (pas Elementor)
3. Coller tout le contenu du fichier `musee-des-ports-elementor.html`
4. Publier

C'est plus rapide et fonctionne à 100% !
