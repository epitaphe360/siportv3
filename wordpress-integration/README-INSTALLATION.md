# 🚢 SIPORTS 2026 - Intégration WordPress

Guide complet pour intégrer l'application SIPORTS 2026 dans votre site WordPress existant via des shortcodes.

## 📋 Prérequis

- WordPress 5.0+ avec PHP 7.4+
- Application SIPORTS 2026 déployée et accessible
- Accès administrateur WordPress
- Certificat SSL (HTTPS) recommandé

## 🔧 Installation

### 1. Téléchargement du plugin

1. Téléchargez le dossier `siports-integration`
2. Placez-le dans `/wp-content/plugins/siports-integration/`
3. Ou uploadez le fichier ZIP via l'administration WordPress

### 2. Activation

1. Allez dans **Extensions > Extensions installées**
2. Trouvez **SIPORTS 2026 Integration**
3. Cliquez sur **Activer**

### 3. Configuration

1. Allez dans **Réglages > SIPORTS Integration**
2. Entrez l'URL de votre application : `https://votre-app-siports.replit.app`
3. Sauvegardez les paramètres

## 🎯 Utilisation des Shortcodes

### Shortcodes disponibles :

#### 1. Formulaire de connexion
```php
[siports-login]
[siports-login height="600px" width="100%" redirect="/dashboard"]
```

#### 2. Liste des exposants
```php
[siports-exhibitors]
[siports-exhibitors category="port-industry" featured="true"]
```

#### 3. Interface de chat
```php
[siports-chat]
[siports-chat height="700px"]
```

#### 4. Réseautage professionnel
```php
[siports-networking]
[siports-networking height="900px"]
```

#### 5. Événements et QR codes
```php
[siports-events]
[siports-events type="conference"]
```

#### 6. Calendrier des rendez-vous
```php
[siports-calendar]
```

#### 7. Tableau de bord utilisateur
```php
[siports-dashboard]
```

#### 8. Scanner QR codes
```php
[siports-qr-scanner]
```

## 📱 Exemples d'utilisation

### Page d'accueil exposants
```php
<h2>Découvrez nos exposants</h2>
[siports-exhibitors height="800px" featured="true"]

<h2>Événements à venir</h2>
[siports-events height="600px"]
```

### Page espace membre
```php
[siports-login redirect="/mon-compte"]

// Ou si l'utilisateur est connecté :
[siports-dashboard]
[siports-chat height="500px"]
```

### Page networking
```php
<h1>Réseautage Professionnel</h1>
<p>Connectez-vous avec les professionnels du secteur portuaire</p>

[siports-networking height="900px"]
```

## 🔐 Sécurité et authentification

### Authentification unifiée
- Le plugin passe automatiquement les informations utilisateur WordPress
- L'application SIPORTS reconnaît les utilisateurs connectés
- Synchronisation des sessions entre WordPress et l'application

### Tokens de sécurité
- Nonces WordPress pour sécuriser les communications
- Validation des origines pour les messages PostMessage
- Sandboxing des iframes

## ⚙️ Configuration avancée

### Personnalisation CSS
Ajoutez dans votre thème :
```css
.siports-iframe-container {
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.siports-auth-required {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}
```

### Hooks WordPress disponibles
```php
// Modifier l'URL de l'application dynamiquement
add_filter('siports_app_url', function($url) {
    return 'https://mon-domaine-personnalise.com';
});

// Ajouter des paramètres utilisateur personnalisés
add_filter('siports_user_params', function($params) {
    $params['custom_role'] = get_user_meta(get_current_user_id(), 'siports_role', true);
    return $params;
});
```

## 📊 Communication bidirectionnelle

### Depuis WordPress vers l'application
```javascript
// Naviguer vers une page spécifique
SiportsWordPress.navigateTo('exhibitors');

// Actualiser toutes les interfaces
SiportsWordPress.refresh();

// Envoyer un message personnalisé
SiportsWordPress.sendMessage('custom_action', {data: 'value'});
```

### Depuis l'application vers WordPress
L'application peut envoyer des messages à WordPress :
```javascript
window.parent.postMessage({
    type: 'siports_notification',
    message: 'Action effectuée avec succès',
    type: 'success'
}, '*');
```

## 🎨 Personnalisation des shortcodes

### Paramètres globaux
Tous les shortcodes acceptent :
- `height` : Hauteur de l'iframe (ex: "600px", "80vh")
- `width` : Largeur de l'iframe (ex: "100%", "800px")

### Paramètres spécifiques

#### siports-exhibitors
- `category` : Filtrer par catégorie ("port-industry", "port-operations", etc.)
- `featured` : Afficher seulement les exposants vedettes ("true"/"false")

#### siports-events
- `type` : Type d'événement ("conference", "workshop", "networking")

#### siports-login
- `redirect` : Page de redirection après connexion

## 🚀 Optimisation des performances

### Lazy loading
Les iframes utilisent `loading="lazy"` pour optimiser le chargement.

### Cache
Ajoutez dans votre `.htaccess` :
```apache
# Cache des ressources SIPORTS
<FilesMatch "\.(css|js)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</FilesMatch>
```

## 🐛 Dépannage

### L'iframe ne se charge pas
1. Vérifiez l'URL de l'application dans les réglages
2. Assurez-vous que l'application SIPORTS est accessible
3. Contrôlez la console browser pour les erreurs CORS

### Problèmes d'authentification
1. Vérifiez que les nonces WordPress fonctionnent
2. Contrôlez les paramètres de session PHP
3. Assurez-vous que l'application accepte les paramètres WordPress

### Problèmes responsive
1. Ajustez les paramètres `height` et `width`
2. Utilisez des unités relatives (`vh`, `%`)
3. Testez sur différentes tailles d'écran

## 📞 Support

Pour toute question technique :
1. Vérifiez la console JavaScript
2. Activez le mode debug WordPress
3. Contactez l'équipe technique SIPORTS

## 🔄 Mises à jour

Le plugin se met à jour automatiquement. Pour forcer une mise à jour :
1. Désactivez le plugin
2. Remplacez les fichiers
3. Réactivez le plugin

---

**Développé pour SIPORTS 2026 - Salon International des Ports**