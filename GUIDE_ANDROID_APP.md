# Guide Complet - Application Android SIPORTS 2026

## 📱 Vue d'ensemble

Cette application Android a été créée avec **Capacitor**, un framework qui permet de construire des applications mobiles natives avec du code web (React, TypeScript). L'application est une version native complète de la plateforme SIPORTS 2026.

**Platform:** Android 8.0+ (API 26+)  
**Framework:** Capacitor 6.x + React + TypeScript  
**Package ID:** com.siports.app  
**Nom App:** SIPORTS 2026

---

## 🛠️ Configuration Prérequise

### Windows / Mac / Linux

#### 1. Installer Android Studio
- Télécharger depuis: https://developer.android.com/studio
- Installer avec les SDK standards
- Version minimale: Chipmunk (2021.2.1)

#### 2. Configurer les Variables d'Environnement

**Windows (PowerShell Admin):**
```powershell
# Ajouter au profil PowerShell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\[YourUsername]\AppData\Local\Android\sdk", "User")
[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;C:\Users\[YourUsername]\AppData\Local\Android\sdk\platform-tools", "User")
```

**macOS/Linux:**
```bash
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin
```

#### 3. Installer Java Development Kit (JDK)
```bash
# Windows
choco install openjdk11

# macOS
brew install openjdk@11

# Linux
sudo apt-get install openjdk-11-jdk
```

#### 4. Vérifier l'Installation
```bash
java -version
adb --version
```

---

## 🚀 Démarrage Rapide

### 1. Ouvrir le Projet Android dans Android Studio

```bash
cd c:\Users\samye\OneDrive\Desktop\siportversionfinal\siportv3
npx cap open android
```

Cela ouvrira Android Studio avec le projet configuré.

### 2. Sélectionner un Appareil/Émulateur

**Option A: Émulateur Android (recommandé pour déboguer)**
1. Dans Android Studio: **Device Manager** → **Create Virtual Device**
2. Sélectionner: Pixel 6 ou Pixel 7
3. Android Version: 12 ou 13
4. Cliquer **Play** pour démarrer l'émulateur

**Option B: Appareil Physique**
1. Connecter votre téléphone via USB
2. Activer le **mode développeur**: Paramètres → À propos du téléphone → Numéro de version (7 fois)
3. Activer **Débogage USB**: Paramètres → Options de développeur → Débogage USB
4. Autoriser la connexion sur l'appareil

### 3. Construire et Lancer

```bash
# Build en debug
npm run build  # Compiler le code React

# Lancer sur appareil/émulateur
npx cap run android

# Ou depuis Android Studio: Run → Run 'app'
```

---

## 📊 Structure du Projet Android

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── assets/public/       ← Assets web (React compilé)
│   │   │   ├── java/com/siports/
│   │   │   │   └── MainActivity.java ← Point d'entrée Android
│   │   │   └── AndroidManifest.xml  ← Permissions & configuration
│   │   └── test/
│   ├── build.gradle                 ← Dépendances du module app
│   └── proguard-rules.pro          ← Règles de minification
├── build.gradle                     ← Dépendances du projet
├── gradle.properties               ← Configuration Gradle
├── settings.gradle                 ← Modules à inclure
├── gradlew                         ← Gradle Wrapper (build)
└── gradlew.bat                     ← Gradle Wrapper (Windows)
```

---

## 🔐 Configuration des Permissions

Les permissions suivantes sont configurées dans `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Internet -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Stockage (pour photos/uploads) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Caméra -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

**Pour les permissions runtime (Android 6.0+):**
- L'application demandera les permissions lors du premier accès
- Exemple: Caméra, Accès aux photos

---

## 🧪 Tests sur Émulateur/Appareil

### Vérifier la Connexion
```bash
adb devices
```

### Voir les Logs
```bash
adb logcat
```

### Installer l'APK Manuellement
```bash
adb install -r app-debug.apk
```

### Comptes de Démonstration

**Admin:**
- Email: `admin@siports.com`
- Mot de passe: `Admin2026!`

**Visiteur VIP:**
- Email: `visitor-vip@siports.com`
- Mot de passe: `Demo2026!`

**Exposants (clic rapide dans LoginPage):**
- TechMarine: `exhibitor-9m@test.siport.com`
- OceanLogistics: `exhibitor-18m@test.siport.com`
- PortTech: `exhibitor-36m@test.siport.com`
- Global Shipping: `exhibitor-54m@test.siport.com`

Tous avec mot de passe: `Demo2026!`

---

## 📦 Créer un APK de Publication

### 1. Générer une Clé de Signature (une seule fois)

```bash
# Windows (PowerShell)
$alias = "siports-key"
$password = "YourSecurePassword123!"
$certFile = "siports-key.jks"

keytool -genkey -v -keystore $certFile `
  -keyalg RSA -keysize 2048 `
  -alias $alias -validity 10000 `
  -storepass $password -keypass $password

# macOS/Linux
keytool -genkey -v -keystore siports-key.jks \
  -keyalg RSA -keysize 2048 \
  -alias siports-key -validity 10000
```

### 2. Configurer la Signature dans `android/app/build.gradle`

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../siports-key.jks")
            storePassword "YourSecurePassword123!"
            keyAlias "siports-key"
            keyPassword "YourSecurePassword123!"
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

### 3. Créer l'APK Signé

**Option A: Via Ligne de Commande**
```bash
cd android
./gradlew assembleRelease
# APK généré: android/app/build/outputs/apk/release/app-release.apk
```

**Option B: Via Android Studio**
1. Menu: **Build** → **Build Bundle(s)/APK(s)** → **Build APK(s)**
2. Sélectionner la clé de signature créée
3. Attendre la compilation

### 4. Résultat

```
android/app/build/outputs/apk/release/app-release.apk
```

**Taille:** ~10-15 MB (production)

---

## 🏪 Google Play Store - Préparation à la Soumission

### 1. Créer un Compte Google Play Developer
- Aller sur: https://play.google.com/console
- Payer les frais (34,99 USD)
- Configurer le profil développeur

### 2. Préparer les Actifs de l'App

**Captures d'écran (requises):**
- 2-8 captures de téléphone (1080x1920 ou 1440x2560 px)
- 2-8 captures de tablette (optionnel)

**Description App Store:**
```
Titre: SIPORTS 2026 - Gestion des Rendez-vous Portuaires

Description courte (80 caractères):
Plateforme complète de gestion des rendez-vous portuaires

Description complète:
SIPORTS 2026 est la plateforme leader pour la gestion des rendez-vous 
et des services dans les ports. Connectez-vous avec les exposants, 
gérez vos rendez-vous et accédez à tous les services portuaires.

Catégorie: Affaires
Contenu: Pas de contenu pour adultes
```

**Icône App:**
- Format: PNG 512x512 px
- Pas de coins arrondis (Android l'ajoutera)

### 3. Créer une Fiche Google Play

1. **Google Play Console** → **Créer une application**
2. Remplir les informations de base
3. Uploader l'icône et les captures d'écran
4. Remplir la description
5. Configurer les tarifs & distribution (gratuit)

### 4. Soumettre pour Révision

1. Compléter le **questionnaire de contenu**
2. Vérifier les paramètres de confidentialité
3. Cliquer **Soumettre**

**Durée de révision:** 1-3 heures généralement

---

## 🧪 Tests Beta avec Google Play

### 1. Créer un Test Track

Dans **Google Play Console:**
1. Aller à **Tests** → **Managed testing** → **Internal testing**
2. Uploader l'APK signé
3. Ajouter des testeurs (emails)

### 2. Distribuer via Google Play

Pour que les testeurs téléchargent:
1. Générer le lien de test interne
2. Envoyer aux testeurs
3. Ils cliquent le lien → Téléchargent sur Play Store

---

## 🐛 Dépannage Courant

### ❌ "gradle: command not found"
```bash
# Vérifier ANDROID_HOME
echo $ANDROID_HOME

# Sinon, utiliser le wrapper
cd android
./gradlew assembleDebug  # macOS/Linux
./gradlew.bat assembleDebug  # Windows
```

### ❌ "No connected devices"
```bash
# Vérifier les appareils
adb devices

# Redémarrer ADB
adb kill-server
adb start-server

# Reconnecter l'appareil USB
```

### ❌ "Gradle sync failed"
```bash
# Nettoyer et reconstruire
cd android
./gradlew clean
./gradlew build
```

### ❌ "Certificat de signature invalide"
- Vérifier le mot de passe dans `build.gradle`
- Régénérer la clé si oubliée

### ❌ Application plante au démarrage
```bash
# Voir les logs
adb logcat | grep -i crash

# Vérifier que le serveur dev est en cours d'exécution
npm run dev
```

---

## 📈 Performance & Optimisation

### Réduire la Taille de l'APK

**Déjà configuré:**
- ProGuard minification activée en release
- Android App Bundle (.aab) recommandé au lieu d'APK

```bash
cd android
./gradlew bundleRelease
# Résultat: android/app/build/outputs/bundle/release/app-release.aab
```

**Taille optimisée:** ~8-12 MB par configuration

### Améliorer la Performance

1. **Lazy Loading des Modules React**
   - Code splitting implémenté
   - Les chunks se chargent à la demande

2. **Mise en Cache**
   - Service Worker configure pour offline
   - Assets en cache local

3. **Optimisation d'Images**
   - Format WebP utilisé
   - Images comprimées

---

## 🔄 Mise à Jour de l'App

### Cycle de Mise à Jour

1. **Code source modifié** → Commit & push
2. **Build local:** `npm run build`
3. **Sync Capacitor:** `npx cap sync android`
4. **Tester:** `npx cap run android`
5. **Générer APK:** `cd android && ./gradlew assembleRelease`
6. **Uploader sur Play Store Console**

### Versionning

`android/app/build.gradle:`
```gradle
android {
    defaultConfig {
        versionCode 1  // Incrémenter à chaque release
        versionName "1.0.0"  // Sémantique de versioning
    }
}
```

Mise à jour recommandée tous les 2 semaines avec:
- Correctifs de bugs
- Nouvelles fonctionnalités
- Améliorations de performance

---

## 📞 Support & Ressources

### Documentation Officielle
- **Capacitor Android:** https://capacitorjs.com/docs/android
- **Android Developers:** https://developer.android.com
- **Google Play Console:** https://play.google.com/console

### Commandes Utiles

```bash
# Afficher la version d'Android Gradle
./gradlew --version

# Lister tous les appareils virtuels
emulator -list-avds

# Lancer un émulateur spécifique
emulator -avd Pixel_6_API_33

# Monitorer la batterie & ressources
adb shell dumpsys battery
adb shell dumpsys meminfo
```

---

## ✅ Checklist Pre-Soumission App Store

- [ ] Tester complètement sur 2+ appareils/émulateurs
- [ ] Vérifier les permissions (caméra, photos, notifications)
- [ ] Test de connectivité offline
- [ ] Vérifier les comptes de démo fonctionnent
- [ ] Redimensionner captures d'écran (1440x2560)
- [ ] Écrire description courte & longue
- [ ] Configurer icône 512x512
- [ ] Tester création APK signé
- [ ] Vérifier taille APK < 100 MB
- [ ] Review politique de confidentialité
- [ ] Passer questionnaire contenu Google Play
- [ ] Soumettre à révision

---

## 🎉 Configuration Complète !

L'application Android SIPORTS 2026 est maintenant prête pour:
- ✅ Développement local
- ✅ Test sur appareil physique/émulateur
- ✅ Publication sur Google Play Store
- ✅ Mise à jour continue

**Prochaines étapes:**
1. Ouvrir le projet: `npx cap open android`
2. Créer un émulateur ou connecter appareil
3. Lancer: `npx cap run android`
4. Tester les comptes de démo
