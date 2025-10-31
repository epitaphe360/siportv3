# 📱 SIPORTS 2026 - Applications Mobiles iOS & Android

Applications mobiles natives pour iOS et Android connectées à la même base de données Supabase que l'application web.

## 🎯 Fonctionnalités

### ✅ Implémentées
- **Authentification** : Login et inscription
- **Navigation** : Navigation par tabs selon le type d'utilisateur
- **Dashboards** : Écrans spécifiques pour chaque type d'utilisateur
  - Dashboard Visiteur
  - Dashboard Exposant
  - Dashboard Partenaire
  - Dashboard Administrateur
- **Profil** : Visualisation et déconnexion
- **Store Zustand** : Gestion d'état partagée
- **Supabase** : Connexion à la base de données existante

### 🚧 À Implémenter
- Système de rendez-vous complet
- Chat et networking
- Notifications push
- Scan QR code
- Gestion des événements
- Mini-sites exposants
- Géolocalisation du salon

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI : `npm install -g expo-cli`
- Pour iOS : Mac avec Xcode installé
- Pour Android : Android Studio installé

### Configuration

1. **Copier le fichier de configuration**
   ```bash
   cp .env.example .env
   ```

2. **Remplir les variables d'environnement**

   Copiez les mêmes valeurs depuis l'application web (`/home/user/siportv3/.env`) :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

## 🚀 Lancement

### Développement

```bash
# Lancer Expo
npm start

# OU spécifiquement :
npm run ios      # iPhone Simulator (Mac uniquement)
npm run android  # Android Emulator
npm run web      # Version web (pour tester rapidement)
```

### Utiliser l'application Expo Go

1. Installez **Expo Go** sur votre téléphone :
   - iOS : [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android : [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Lancez `npm start`

3. Scannez le QR code affiché :
   - iOS : Utilisez l'appareil photo
   - Android : Utilisez l'app Expo Go

## 📱 Publication sur les Stores

### 1. Configuration App.json

Éditez `app.json` pour personnaliser votre application :

```json
{
  "expo": {
    "name": "SIPORTS 2026",
    "slug": "siports-2026",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#7c3aed"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.siports.app2026",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#7c3aed"
      },
      "package": "com.siports.app2026",
      "versionCode": 1
    }
  }
}
```

### 2. Créer un Compte Expo

```bash
expo login
```

ou créez un compte sur [expo.dev](https://expo.dev)

### 3. Build iOS (App Store)

```bash
# Installation EAS CLI
npm install -g eas-cli

# Login
eas login

# Configuration initiale
eas build:configure

# Build pour iOS
eas build --platform ios

# Soumettre à l'App Store
eas submit --platform ios
```

#### Prérequis iOS
- Compte Apple Developer (99 USD/an)
- Certificats et profils de provisioning
- App Store Connect configuré

### 4. Build Android (Google Play)

```bash
# Build pour Android
eas build --platform android

# Soumettre au Google Play Store
eas submit --platform android
```

#### Prérequis Android
- Compte Google Play Developer (25 USD unique)
- Keystore pour signer l'app
- Google Play Console configuré

### 5. Build Simultané

```bash
# Build iOS + Android en même temps
eas build --platform all
```

## 📁 Structure du Projet

```
siports-mobile/
├── App.tsx                 # Point d'entrée principal
├── app.json               # Configuration Expo
├── package.json           # Dépendances
├── .env                   # Variables d'environnement (à créer)
├── assets/                # Images, icônes, splash screen
│   ├── icon.png          # Icône de l'app (1024x1024)
│   ├── splash.png        # Écran de démarrage
│   └── adaptive-icon.png # Icône Android adaptive
└── src/
    ├── config/
    │   └── supabase.ts    # Configuration Supabase
    ├── navigation/
    │   ├── RootNavigator.tsx      # Navigation principale
    │   └── MainTabNavigator.tsx   # Navigation par tabs
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   └── RegisterScreen.tsx
    │   ├── dashboard/
    │   │   ├── VisitorDashboardScreen.tsx
    │   │   ├── ExhibitorDashboardScreen.tsx
    │   │   ├── PartnerDashboardScreen.tsx
    │   │   └── AdminDashboardScreen.tsx
    │   ├── appointments/
    │   │   └── AppointmentsScreen.tsx
    │   ├── networking/
    │   │   └── NetworkingScreen.tsx
    │   └── profile/
    │       └── ProfileScreen.tsx
    ├── stores/
    │   └── authStore.ts   # Store Zustand pour l'auth
    ├── types/
    │   └── index.ts       # Types partagés avec l'app web
    └── components/        # Composants réutilisables (à créer)
```

## 🔧 Développement des Fonctionnalités

### Ajouter le Système de Rendez-vous

1. Créer le store `appointmentStore.ts` :
```typescript
import { create } from 'zustand';
import { supabase } from '../config/supabase';

export const useAppointmentStore = create((set) => ({
  appointments: [],
  loading: false,

  fetchAppointments: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('appointments')
      .select('*');
    set({ appointments: data, loading: false });
  },

  bookAppointment: async (timeSlotId, message) => {
    // Implémenter la logique de réservation
  }
}));
```

2. Utiliser dans les écrans :
```typescript
import { useAppointmentStore } from '../../stores/appointmentStore';

export default function AppointmentsScreen() {
  const { appointments, fetchAppointments } = useAppointmentStore();

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Afficher la liste des rendez-vous
}
```

### Ajouter les Notifications Push

1. Installer expo-notifications :
```bash
npx expo install expo-notifications expo-device expo-constants
```

2. Implémenter les notifications :
```typescript
import * as Notifications from 'expo-notifications';

// Demander la permission
const { status } = await Notifications.requestPermissionsAsync();

// Obtenir le token push
const token = (await Notifications.getExpoPushTokenAsync()).data;

// Enregistrer le token dans Supabase
await supabase
  .from('user_push_tokens')
  .upsert({ user_id: userId, token });
```

### Ajouter le Scan QR Code

1. Installer expo-barcode-scanner :
```bash
npx expo install expo-barcode-scanner
```

2. Utiliser le scanner :
```typescript
import { BarCodeScanner } from 'expo-barcode-scanner';

const [hasPermission, setHasPermission] = useState(null);

useEffect(() => {
  (async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  })();
}, []);

const handleBarCodeScanned = ({ type, data }) => {
  // Traiter le QR code scanné
  console.log(`QR Code: ${data}`);
};

return (
  <BarCodeScanner
    onBarCodeScanned={handleBarCodeScanned}
    style={StyleSheet.absoluteFillObject}
  />
);
```

## 🎨 Personnalisation

### Thème et Couleurs

Les couleurs principales sont définies dans les styles :
- Primary : `#7c3aed` (violet)
- Background : `#f8f9fa`
- Card : `#ffffff`

Pour créer un thème global, créez `src/theme/colors.ts` :
```typescript
export const colors = {
  primary: '#7c3aed',
  secondary: '#2563eb',
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};
```

### Icônes et Assets

Remplacez les fichiers dans `/assets/` :
- **icon.png** : 1024x1024px (icône de l'app)
- **splash.png** : 1242x2436px (écran de démarrage)
- **adaptive-icon.png** : 1024x1024px (Android)

## 🐛 Debug

### Logs Expo
```bash
# Voir les logs en temps réel
expo start --dev-client
```

### React Native Debugger
1. Installez [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Lancez l'app avec `npm start`
3. Ouvrez React Native Debugger
4. Dans l'app, secouez le téléphone et sélectionnez "Debug"

### Erreurs Communes

**Erreur Supabase Connection**
- Vérifiez que le fichier `.env` existe et contient les bonnes valeurs
- Vérifiez que Supabase accepte les connexions depuis mobile

**Erreur Navigation**
- Assurez-vous que tous les écrans existent
- Vérifiez les imports dans `MainTabNavigator.tsx`

**Erreur Build**
- Videz le cache : `expo start --clear`
- Supprimez `node_modules` et réinstallez : `rm -rf node_modules && npm install`

## 📊 Base de Données

L'application mobile utilise **exactement la même base de données Supabase** que l'application web.

### Tables Utilisées
- `users` : Profils utilisateurs
- `appointments` : Rendez-vous
- `time_slots` : Créneaux horaires
- `events` : Événements du salon
- `messages` : Chat/messaging
- `mini_sites` : Mini-sites exposants

Aucune migration n'est nécessaire. Toutes les données sont partagées entre le web et le mobile.

## 📝 Prochaines Étapes

1. **Implémenter les fonctionnalités manquantes** (voir section "À Implémenter")
2. **Ajouter les tests unitaires** avec Jest
3. **Configurer CI/CD** avec GitHub Actions
4. **Optimiser les performances** avec Hermes (Android)
5. **Ajouter le mode hors ligne** avec AsyncStorage
6. **Intégrer Analytics** (Firebase, Amplitude, etc.)

## 🔐 Sécurité

- Les clés Supabase sont stockées dans `.env` (ne jamais commit)
- Authentification par JWT gérée par Supabase
- AsyncStorage pour persister la session
- HTTPS obligatoire pour toutes les requêtes

## 📚 Documentation Utile

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Zustand](https://github.com/pmndrs/zustand)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Guidelines](https://play.google.com/about/developer-content-policy/)

## 📞 Support

Pour toute question ou problème :
1. Consultez la [documentation Expo](https://docs.expo.dev/)
2. Vérifiez les [issues GitHub](https://github.com/expo/expo/issues)
3. Demandez sur le [forum Expo](https://forums.expo.dev/)

## ⚖️ Licence

Projet SIPORTS 2026 - Tous droits réservés

---

**Développé avec ❤️ pour SIPORTS 2026**
