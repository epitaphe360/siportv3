# 📱 Application iOS SIPORTS 2026

## ✅ Configuration terminée

L'application iOS a été créée avec succès ! Le dossier `ios/` contient maintenant le projet Xcode complet.

## 🚀 Prochaines étapes

### 1. Ouvrir le projet dans Xcode

**Option A : Via Capacitor CLI (Recommandé)**
```powershell
npx cap open ios
```

**Option B : Manuellement**
1. Ouvrir Xcode
2. Naviguer vers : `ios/App/App.xcworkspace`
3. ⚠️ **Important** : Ouvrir le fichier `.xcworkspace` et **PAS** `.xcodeproj`

### 2. Configuration du projet dans Xcode

#### a. Identifiant de bundle (Bundle Identifier)
1. Sélectionner le projet "App" dans le navigateur
2. Onglet "Signing & Capabilities"
3. Vérifier/modifier le Bundle ID : `com.siports.app`

#### b. Équipe de développement (Developer Team)
1. Dans "Signing & Capabilities"
2. Sélectionner votre équipe Apple Developer
3. Si vous n'avez pas de compte développeur :
   - Gratuit : Compte Apple ID personnel (7 jours)
   - Payant : Apple Developer Program ($99/an)

#### c. Version et Build
1. Dans l'onglet "General"
2. Version : `1.0.0` (déjà configuré)
3. Build : `1` (déjà configuré)

### 3. Tester sur simulateur

#### Lancer le simulateur
1. Dans Xcode, en haut à gauche
2. Sélectionner un simulateur (ex: iPhone 15 Pro)
3. Cliquer sur ▶️ (Play) ou `Cmd + R`

#### Simulateurs disponibles
- iPhone 15 Pro / Pro Max
- iPhone 15 / Plus
- iPhone 14 Pro / Pro Max
- iPhone SE (3e génération)
- iPad Pro 12.9"
- iPad Air

### 4. Tester sur appareil physique

#### Prérequis
- iPhone/iPad avec iOS 13.0 minimum
- Câble Lightning/USB-C
- Compte Apple ID

#### Étapes
1. Connecter l'iPhone au Mac via câble
2. Dans Xcode, sélectionner votre iPhone dans la liste des appareils
3. "Confier cet ordinateur" sur l'iPhone si demandé
4. Cliquer sur ▶️ pour installer l'app

#### Première installation
1. Sur l'iPhone : Réglages → Général → Gestion des appareils
2. Faire confiance au profil développeur
3. Lancer l'app depuis l'écran d'accueil

### 5. Mettre à jour l'app après modifications

#### À chaque modification du code web
```powershell
# 1. Rebuild le projet web
npm run build

# 2. Synchroniser avec iOS
npx cap sync ios

# 3. Relancer depuis Xcode
```

#### Commande complète
```powershell
npm run build; npx cap sync ios; npx cap open ios
```

## 🔧 Configuration avancée

### Icône de l'application

**Préparer les assets**
1. Créer une icône 1024x1024 px (PNG, sans transparence)
2. Utiliser un générateur d'icônes iOS :
   - https://appicon.co
   - https://www.appicon.build

**Ajouter dans Xcode**
1. `ios/App/App/Assets.xcassets/AppIcon.appiconset`
2. Glisser-déposer les images générées
3. Ou cliquer sur "AppIcon" et ajouter les tailles

### Splash Screen (Écran de démarrage)

**Déjà configuré dans capacitor.config.ts**
```typescript
SplashScreen: {
  launchShowDuration: 2000,
  backgroundColor: "#1e40af",
  showSpinner: false
}
```

**Personnaliser l'image**
1. Créer une image 2732x2732 px
2. Placer dans : `ios/App/App/Assets.xcassets/Splash.imageset`

### Permissions iOS

Les permissions sont dans `ios/App/App/Info.plist` :

**Caméra (QR Scanner)**
```xml
<key>NSCameraUsageDescription</key>
<string>SIPORTS a besoin de la caméra pour scanner les badges QR</string>
```

**Photos**
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>SIPORTS a besoin d'accéder aux photos pour les télécharger</string>
```

**Notifications**
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Dark Mode

**Forcer le mode clair (recommandé)**
Dans `Info.plist` :
```xml
<key>UIUserInterfaceStyle</key>
<string>Light</string>
```

## 📦 Préparer pour l'App Store

### 1. Archives et build

#### Créer une archive
1. Dans Xcode : Product → Archive
2. Attendre la compilation (5-10 min)
3. La fenêtre "Organizer" s'ouvre automatiquement

#### Distribuer sur App Store
1. Sélectionner l'archive
2. Cliquer "Distribute App"
3. Choisir "App Store Connect"
4. Suivre l'assistant

### 2. App Store Connect

#### Prérequis
- Compte Apple Developer actif ($99/an)
- Créer l'app sur https://appstoreconnect.apple.com

#### Informations requises
- Nom de l'app : **SIPORTS 2026**
- Bundle ID : `com.siports.app`
- Catégorie : Business
- Captures d'écran (obligatoire) :
  - iPhone 6.7" : 1290x2796 px (3 min)
  - iPhone 6.5" : 1242x2688 px (3 min)
  - iPad Pro 12.9" : 2048x2732 px (2 min)

#### Captures d'écran recommandées
1. Page d'accueil
2. Liste des exposants
3. Calendrier des rendez-vous
4. Badge numérique
5. Réseau professionnel

### 3. TestFlight (Beta Testing)

**Avant l'App Store**
1. Upload l'archive
2. Inviter des beta testeurs
3. Ils reçoivent un lien TestFlight
4. Tester pendant 1-2 semaines

**Commande pour build TestFlight**
```powershell
npm run build
npx cap sync ios
# Puis dans Xcode : Product → Archive → Upload to TestFlight
```

## 🐛 Dépannage

### Erreur : "Code signing required"
**Solution :**
1. Xcode → Preferences → Accounts
2. Ajouter votre Apple ID
3. Dans le projet : Signing & Capabilities → Sélectionner Team

### Erreur : "No profiles for 'com.siports.app'"
**Solution :**
1. Signing & Capabilities
2. Cocher "Automatically manage signing"
3. Xcode créera les profils automatiquement

### Erreur : "Unsupported Swift version"
**Solution :**
1. Build Settings → Swift Language Version
2. Sélectionner "Swift 5"

### L'app crash au démarrage
**Vérifier :**
1. `npm run build` sans erreurs
2. `npx cap sync ios` exécuté
3. Console Xcode pour voir les logs

### Plugins natifs ne fonctionnent pas
**Réinstaller les plugins :**
```powershell
npx cap sync ios
```

### Modification du capacitor.config.ts
**Après chaque changement :**
```powershell
npx cap sync ios
```

## 📚 Ressources

### Documentation
- Capacitor iOS : https://capacitorjs.com/docs/ios
- Apple Developer : https://developer.apple.com/ios/
- Xcode Guide : https://developer.apple.com/xcode/

### Outils
- Icônes : https://appicon.co
- Captures d'écran : https://www.appstorescreenshot.com
- TestFlight : https://developer.apple.com/testflight/

### Support
- Capacitor Community : https://ionic.link/discord
- Stack Overflow : Tag `capacitor`

## 🎯 Checklist finale avant publication

- [ ] L'app se lance sans crash
- [ ] Toutes les fonctionnalités testées
- [ ] Icône d'app ajoutée (1024x1024)
- [ ] Splash screen configuré
- [ ] Captures d'écran préparées
- [ ] Permissions configurées dans Info.plist
- [ ] Version et build number à jour
- [ ] Testé sur plusieurs appareils/simulateurs
- [ ] Beta testé via TestFlight (recommandé)
- [ ] Compte App Store Connect configuré
- [ ] Description et mots-clés préparés

## 🚀 Commandes rapides

```powershell
# Build + Sync + Ouvrir Xcode
npm run build; npx cap sync ios; npx cap open ios

# Sync uniquement (après modifications)
npx cap sync ios

# Ouvrir dans Xcode
npx cap open ios

# Nettoyer et rebuild
npm run build; npx cap sync ios --force

# Voir les logs en temps réel
npx cap run ios --target="iPhone 15 Pro"
```

## ✅ Status actuel

- ✅ Plateforme iOS ajoutée
- ✅ Projet Xcode créé
- ✅ Configuration Capacitor définie
- ✅ Plugins synchronisés
- ✅ Assets web copiés
- ⏳ À faire : Configurer signing dans Xcode
- ⏳ À faire : Tester sur simulateur
- ⏳ À faire : Tester sur appareil physique

**L'application est prête à être ouverte dans Xcode !**
