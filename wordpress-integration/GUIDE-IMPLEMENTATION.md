# 🚢 GUIDE D'IMPLÉMENTATION WORDPRESS - SIPORTS 2026

Guide complet pour intégrer l'application SIPORTS 2026 dans votre site WordPress existant.

## 🎯 ÉTAPES D'IMPLÉMENTATION

### ÉTAPE 1: Préparation
1. **Connectez-vous à votre WordPress** : `https://clone.siportevent.com/wp-admin`
2. **Sauvegardez votre site** (recommandé)
3. **Assurez-vous d'avoir l'URL de l'application SIPORTS** déployée

### ÉTAPE 2: Installation du Plugin

#### Via FTP/FileManager :
1. Créez le dossier `/wp-content/plugins/siports-integration/`
2. Uploadez tous les fichiers du dossier `wordpress-integration/` :
   ```
   wp-content/plugins/siports-integration/
   ├── siports-integration.php
   ├── assets/
   │   ├── siports-integration.css
   │   └── siports-integration.js
   ```

#### Via l'administration WordPress :
1. Allez dans **Extensions > Ajouter**
2. Cliquez sur **Téléverser une extension**
3. Sélectionnez le fichier ZIP créé

### ÉTAPE 3: Activation et Configuration

1. **Activez le plugin** :
   - Extensions > Extensions installées
   - Trouvez "SIPORTS 2026 Integration"
   - Cliquez "Activer"

2. **Configurez l'URL de l'application** :
   - Réglages > SIPORTS Integration
   - Entrez l'URL : `https://votre-app-siports.replit.app`
   - Sauvegardez

### ÉTAPE 4: Création des Pages

#### A. Page Exposants
1. **Pages > Ajouter**
2. **Titre** : "Nos Exposants"
3. **Slug** : `exposants`
4. **Attributs de page > Modèle** : "Page Exposants SIPORTS"
5. **Publier**

#### B. Page Réseautage
1. **Pages > Ajouter**
2. **Titre** : "Réseautage Professionnel"
3. **Slug** : `reseautage`
4. **Attributs de page > Modèle** : "Page Réseautage SIPORTS"
5. **Publier**

#### C. Page Événements
1. **Pages > Ajouter**
2. **Titre** : "Événements SIPORTS 2026"
3. **Slug** : `evenements`
4. **Attributs de page > Modèle** : "Page Événements SIPORTS"
5. **Publier**

#### D. Page Chat
1. **Pages > Ajouter**
2. **Titre** : "Messagerie"
3. **Slug** : `chat`
4. **Attributs de page > Modèle** : "Page Chat SIPORTS"
5. **Publier**

#### E. Page Connexion/Espace Membre
1. **Pages > Ajouter**
2. **Titre** : "Mon Espace"
3. **Slug** : `mon-espace`
4. **Attributs de page > Modèle** : "Page Connexion SIPORTS"
5. **Publier**

### ÉTAPE 5: Ajout au Menu Principal

1. **Apparence > Menus**
2. **Sélectionnez votre menu principal**
3. **Ajoutez les pages créées** :
   - Exposants
   - Événements
   - Réseautage
   - Chat
   - Mon Espace

4. **Organisez l'ordre** comme souhaité
5. **Enregistrer le menu**

### ÉTAPE 6: Configuration Avancée

#### A. Modification de la page d'accueil (optionnel)
Ajoutez des shortcodes sur votre page d'accueil :

```php
<!-- Section exposants vedettes -->
<h2>Exposants Vedettes</h2>
[siports-exhibitors height="400px" featured="true"]

<!-- Prochains événements -->
<h2>Événements à Venir</h2>
[siports-events height="300px"]
```

#### B. Widgets de barre latérale (optionnel)
Créez un widget personnalisé avec :

```php
<!-- Chat rapide -->
[siports-chat height="300px"]

<!-- Scanner QR -->
[siports-qr-scanner height="250px"]
```

### ÉTAPE 7: Tests et Vérification

1. **Testez chaque page créée** :
   - `/exposants` → Doit afficher la liste des exposants
   - `/reseautage` → Interface de networking
   - `/evenements` → Programme et QR codes
   - `/chat` → Messagerie
   - `/mon-espace` → Connexion/Dashboard

2. **Vérifiez l'intégration** :
   - Les iframes se chargent correctement
   - L'authentification fonctionne
   - Les styles s'appliquent bien

3. **Test mobile** :
   - Vérifiez la responsivité
   - Testez les interactions tactiles

## 🔧 SHORTCODES DISPONIBLES

### Shortcodes principaux :
```php
[siports-login]                    # Connexion/Inscription
[siports-exhibitors]               # Liste exposants
[siports-networking]               # Réseautage IA
[siports-events]                   # Événements + QR
[siports-chat]                     # Messagerie
[siports-calendar]                 # Calendrier RDV
[siports-dashboard]                # Tableau de bord
[siports-qr-scanner]               # Scanner QR
```

### Paramètres disponibles :
```php
[siports-exhibitors height="800px" category="port-industry" featured="true"]
[siports-events height="600px" type="conference"]
[siports-login height="500px" redirect="/mon-compte"]
```

## 🎨 PERSONNALISATION CSS

Ajoutez dans **Apparence > Personnaliser > CSS Supplémentaire** :

```css
/* Personnalisation SIPORTS */
.siports-iframe-container {
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* Couleurs de marque */
.siports-auth-required {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    color: white;
}

/* Responsive amélioré */
@media (max-width: 768px) {
    .siports-iframe-container iframe {
        min-height: 500px;
    }
}
```

## 🔐 SÉCURITÉ ET OPTIMISATION

### Optimisation des performances :
1. **Cache** : Activez un plugin de cache (WP Rocket, W3 Total Cache)
2. **CDN** : Configurez un CDN pour les ressources statiques
3. **Minification** : Minifiez CSS/JS via votre plugin de cache

### Sécurité :
1. **HTTPS** : Assurez-vous que votre site utilise HTTPS
2. **Firewall** : Configurez un firewall Web (Cloudflare, Sucuri)
3. **Mises à jour** : Maintenez WordPress et les plugins à jour

## 🚨 DÉPANNAGE

### Problème : L'iframe ne se charge pas
**Solution** :
1. Vérifiez l'URL dans Réglages > SIPORTS Integration
2. Contrôlez que l'application SIPORTS est en ligne
3. Vérifiez la console navigateur pour erreurs CORS

### Problème : Styles cassés
**Solution** :
1. Videz le cache WordPress
2. Vérifiez que les fichiers CSS sont bien uploadés
3. Contrôlez les conflits avec le thème

### Problème : Authentification ne fonctionne pas
**Solution** :
1. Vérifiez les cookies et sessions PHP
2. Contrôlez les paramètres de sécurité WordPress
3. Testez en mode de débogage WordPress

## 📞 SUPPORT TECHNIQUE

En cas de problème :
1. **Activez le mode debug WordPress** dans `wp-config.php`
2. **Vérifiez les logs d'erreur** dans `/wp-content/debug.log`
3. **Testez avec un thème par défaut** pour identifier les conflits

## ✅ CHECKLIST FINALE

- [ ] Plugin installé et activé
- [ ] URL de l'application configurée
- [ ] Pages créées avec les bons templates
- [ ] Menu mis à jour
- [ ] Tests des shortcodes effectués
- [ ] Version mobile vérifiée
- [ ] Cache configuré
- [ ] HTTPS activé

**🎉 Félicitations ! Votre intégration SIPORTS 2026 est maintenant opérationnelle !**

---

Pour toute question technique, contactez l'équipe SIPORTS.