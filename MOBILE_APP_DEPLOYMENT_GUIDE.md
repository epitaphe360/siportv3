# 📱 Guide de Déploiement Mobile - SIPORTS 2026

Guide complet pour builder et déployer l'application mobile iOS et Android.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration](#configuration)
3. [Build Android](#build-android)
4. [Build iOS](#build-ios)
5. [Push Notifications](#push-notifications)
6. [Features Natives](#features-natives)
7. [Testing](#testing)
8. [Publication](#publication)

---

## 🔧 Prérequis

### Outils requis

```bash
# Node.js et npm
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Capacitor CLI
npm install -g @capacitor/cli

# Android Studio (pour Android)
# Télécharger depuis: https://developer.android.com/studio

# Xcode (pour iOS, macOS uniquement)
# Télécharger depuis l'App Store
```

### Packages Capacitor

Les packages suivants sont déjà installés :

```json
{
  "@capacitor/core": "^6.0.0",
  "@capacitor/cli": "^6.0.0",
  "@capacitor/android": "^6.0.0",
  "@capacitor/ios": "^6.0.0",
  "@capacitor/camera": "^6.0.0",
  "@capacitor/geolocation": "^6.0.0",
  "@capacitor/push-notifications": "^6.0.0",
  "@capacitor/local-notifications": "^6.0.0",
  "@capacitor/share": "^6.0.0",
  "@capacitor/filesystem": "^6.0.0",
  "@capacitor/device": "^6.0.0",
  "@capacitor/network": "^6.0.0",
  "@capacitor/haptics": "^6.0.0",
  "@capacitor/splash-screen": "^6.0.0",
  "@capacitor/status-bar": "^6.0.0"
}
```

---

## ⚙️ Configuration

### 1. Configuration de base

Le fichier `capacitor.config.ts` est déjà configuré :

```typescript
{
  appId: 'com.siports.app',
  appName: 'SIPORTS 2026',
  webDir: 'dist'
}
```

### 2. Variables d'environnement

Créer `.env.production` pour le build mobile :

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://api.siports.com
VITE_APP_ENV=production
```

### 3. Initialiser les plateformes

```bash
# Build web d'abord
npm run build

# Ajouter Android
npm run mobile:add-android

# Ajouter iOS (macOS uniquement)
npm run mobile:add-ios

# Synchroniser
npm run mobile:sync
```

---

## 🤖 Build Android

### 1. Configuration du Keystore

Créer un keystore pour signer l'APK/AAB :

```bash
keytool -genkey -v -keystore siports-release.keystore \
  -alias siports -keyalg RSA -keysize 2048 -validity 10000
```

Sauvegarder le keystore dans un endroit sécurisé (JAMAIS dans git).

### 2. Configuration Gradle

Éditer `android/app/build.gradle` :

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../siports-release.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "siports"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Permissions Android

Éditer `android/app/src/main/AndroidManifest.xml` :

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:name=".Application"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        ...
    </application>
</manifest>
```

### 4. Build APK/AAB

```bash
# APK Debug
cd android
./gradlew assembleDebug

# APK Release
export KEYSTORE_PASSWORD="your-password"
export KEY_PASSWORD="your-password"
./gradlew assembleRelease

# AAB Release (pour Google Play)
./gradlew bundleRelease
```

L'APK sera dans : `android/app/build/outputs/apk/release/app-release.apk`

L'AAB sera dans : `android/app/build/outputs/bundle/release/app-release.aab`

### 5. Ouvrir dans Android Studio

```bash
npm run mobile:open-android
```

---

## 🍎 Build iOS

### 1. Configuration Xcode

Ouvrir le projet :

```bash
npm run mobile:open-ios
```

Dans Xcode :

1. Sélectionner le projet `App` dans le navigateur
2. Aller dans `Signing & Capabilities`
3. Choisir votre Team (Apple Developer Account requis)
4. Vérifier le Bundle Identifier : `com.siports.app`

### 2. Permissions iOS

Éditer `ios/App/App/Info.plist` :

```xml
<dict>
    <!-- Camera -->
    <key>NSCameraUsageDescription</key>
    <string>Nous avons besoin d'accéder à votre caméra pour prendre des photos.</string>

    <!-- Location -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Nous avons besoin de votre position pour vous montrer les événements à proximité.</string>

    <!-- Photo Library -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Nous avons besoin d'accéder à vos photos pour sélectionner une image.</string>

    <!-- Notifications -->
    <key>UIBackgroundModes</key>
    <array>
        <string>remote-notification</string>
    </array>
</dict>
```

### 3. Capabilities

Dans Xcode, ajouter les capabilities :

- ✅ Push Notifications
- ✅ Background Modes → Remote notifications
- ✅ Associated Domains (pour deep links)

### 4. Build iOS

```bash
# Depuis Xcode
# Product → Archive
# Puis Upload to App Store Connect

# Ou via CLI
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -sdk iphoneos \
  -configuration AppStoreDistribution \
  archive -archivePath App.xcarchive
```

---

## 🔔 Push Notifications

### 1. Configuration Firebase (Android)

1. Créer un projet Firebase : https://console.firebase.google.com
2. Ajouter une app Android avec package name : `com.siports.app`
3. Télécharger `google-services.json`
4. Copier dans `android/app/google-services.json`

Éditer `android/build.gradle` :

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

Éditer `android/app/build.gradle` :

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
}
```

### 2. Configuration APNs (iOS)

1. Aller sur Apple Developer Portal
2. Créer un APNs Key dans Certificates, Identifiers & Profiles
3. Télécharger le fichier `.p8`
4. Uploader dans Firebase Cloud Messaging settings

### 3. Service Push Notifications

Le service est déjà implémenté dans `src/services/mobilePushService.ts` :

```typescript
import { mobilePushService } from './services/mobilePushService';

// Initialiser au démarrage de l'app
await mobilePushService.initialize(userId);

// Envoyer une notification de test
await mobilePushService.sendTestNotification();
```

---

## 🎯 Features Natives

Le service `nativeFeaturesService.ts` fournit :

```typescript
import { nativeFeaturesService } from './services/nativeFeaturesService';

// Caméra
const photo = await nativeFeaturesService.takePhoto();
const image = await nativeFeaturesService.pickImage();

// Géolocalisation
const position = await nativeFeaturesService.getCurrentPosition();

// Partage
await nativeFeaturesService.share({
  title: 'SIPORTS 2026',
  text: 'Découvrez l\'événement!',
  url: 'https://siports.com'
});

// Haptic feedback
await nativeFeaturesService.vibrate('medium');

// Device info
const info = await nativeFeaturesService.getDeviceInfo();
```

---

## 🧪 Testing

### Test sur émulateur/simulateur

```bash
# Android
npm run mobile:open-android
# Puis Run dans Android Studio

# iOS
npm run mobile:open-ios
# Puis Run dans Xcode
```

### Test sur appareil physique

#### Android

```bash
# Activer le mode développeur sur l'appareil
# Activer le débogage USB
# Connecter via USB

adb devices
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

#### iOS

Dans Xcode :
1. Connecter l'iPhone via USB
2. Sélectionner l'appareil dans la barre du haut
3. Cliquer sur Run (⌘R)

### Test des notifications

```typescript
// Dans l'app
import { mobilePushService } from './services/mobilePushService';

// Tester
await mobilePushService.sendTestNotification();
```

---

## 📤 Publication

### Google Play Store

1. Créer un compte Google Play Developer : https://play.google.com/console
2. Créer une nouvelle application
3. Remplir les informations (description, screenshots, etc.)
4. Upload l'AAB :

```bash
cd android
./gradlew bundleRelease
```

5. Créer une release en production

### Apple App Store

1. Créer un compte Apple Developer : https://developer.apple.com
2. Créer une app dans App Store Connect
3. Remplir les métadonnées
4. Upload le build depuis Xcode :

```
Product → Archive → Upload to App Store
```

5. Soumettre pour review

---

## 📝 Checklist de Déploiement

### Avant le build

- [ ] Tests E2E passent
- [ ] Version incrémentée dans `package.json`
- [ ] Variables d'environnement configurées
- [ ] Icônes et splash screens ajoutés
- [ ] Permissions configurées

### Android

- [ ] Keystore créé et sécurisé
- [ ] `google-services.json` ajouté
- [ ] APK/AAB signé
- [ ] Testé sur appareil réel
- [ ] Screenshots prêts (phone + tablet)

### iOS

- [ ] Certificats et provisioning profiles configurés
- [ ] APNs key configuré
- [ ] Archive créé
- [ ] Testé sur iPhone réel
- [ ] Screenshots prêts (iPhone + iPad)

### Post-déploiement

- [ ] Notifications push testées
- [ ] Deep links testés
- [ ] Analytiques configurés
- [ ] Crash reporting activé
- [ ] Version monitoring

---

## 🆘 Troubleshooting

### Erreur: "Unable to load native module"

```bash
npm run mobile:sync
```

### Erreur: "Plugin not implemented"

Vérifier que le plugin est bien installé et synchronisé :

```bash
npm install @capacitor/camera
npm run mobile:sync
```

### Build Android échoue

```bash
cd android
./gradlew clean
./gradlew build
```

### Xcode: "Code signing error"

Vérifier dans Xcode → Signing & Capabilities que le Team est sélectionné.

---

## 📚 Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Ionic Native](https://capacitorjs.com/docs/plugins)
- [Android Developers](https://developer.android.com)
- [Apple Developer](https://developer.apple.com)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

## ✅ Conclusion

L'application mobile SIPORTS 2026 est maintenant prête pour le déploiement!

Commandes rapides :

```bash
# Build et sync
npm run build && npm run mobile:sync

# Ouvrir Android Studio
npm run mobile:open-android

# Ouvrir Xcode
npm run mobile:open-ios
```

Pour toute question : contact@siports.com
