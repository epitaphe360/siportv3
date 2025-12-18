# 📱 SIPORT Mobile - Gestion des Accès Physiques

Application Android pour la gestion sécurisée des accès au salon SIPORT 2026.

## 🎯 Fonctionnalités

### Pour les Participants (Visiteurs/Partenaires/Exposants)
- ✅ Badge numérique avec QR code dynamique
- ✅ QR code rotatif toutes les 30 secondes (sécurité maximale)
- ✅ Affichage du profil et du niveau d'accès
- ✅ Historique des accès en temps réel
- ✅ Notifications push pour les événements
- ✅ Mode hors ligne avec synchronisation

### Pour les Agents de Sécurité
- ✅ Scanner QR code ultra-rapide
- ✅ Validation instantanée avec vérification JWT
- ✅ Interface de contrôle temps réel
- ✅ Liste des accès autorisés/refusés
- ✅ Alertes de sécurité
- ✅ Dashboard de statistiques

## 🔒 Sécurité

- **QR Codes JWT**: Chaque QR code contient un token JWT signé avec rotation automatique
- **Timestamps**: Validation de la fraîcheur du QR (max 60 secondes)
- **Nonces**: Protection contre les attaques par rejeu
- **Encryption**: Communication chiffrée avec le backend
- **Biométrie**: Support Touch ID/Face ID pour déverrouillage
- **Certificate Pinning**: Protection contre les attaques MITM

## 🎨 Design

- Interface Material Design 3
- Animations fluides (Reanimated 3)
- Dark mode natif
- Gradients personnalisés par type d'utilisateur
- Haptic feedback
- Glassmorphism effects

## 📦 Technologies

- **React Native** 0.73+
- **TypeScript** 5.0+
- **React Navigation** 6
- **React Native Reanimated** 3
- **React Native Camera Vision** (QR Scanner)
- **react-native-qrcode-svg** (QR Generation)
- **jose** (JWT Signing/Verification)
- **zustand** (State Management)
- **react-native-biometrics**

## 🚀 Installation

```bash
cd mobile
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## 📱 Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── Badge/           # Badge numérique
│   │   ├── Scanner/         # Scanner QR
│   │   ├── Dashboard/       # Dashboard agent
│   │   └── Profile/         # Profil utilisateur
│   ├── services/
│   │   ├── qr/             # Génération/Validation QR
│   │   ├── auth/           # Authentification
│   │   ├── access/         # Contrôle d'accès
│   │   └── sync/           # Synchronisation
│   ├── components/
│   │   ├── QRCode/         # Composant QR animé
│   │   ├── Scanner/        # Composant scanner
│   │   └── ui/             # Composants UI
│   ├── navigation/
│   ├── store/
│   └── utils/
├── android/
├── ios/
└── package.json
```

## 🔑 Variables d'environnement

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
JWT_SECRET=xxx
QR_ROTATION_INTERVAL=30000
ACCESS_LOG_SYNC_INTERVAL=5000
```

## 📊 Flow de Contrôle d'Accès

1. **Participant arrive à l'entrée**
   - Ouvre l'app mobile
   - Affiche son badge avec QR code

2. **Agent scanne le QR code**
   - App agent scanne le QR
   - Validation JWT instantanée
   - Vérification niveau d'accès
   - Vérification timestamp (< 60s)

3. **Décision d'accès**
   - ✅ Accès autorisé → Animation verte + vibration
   - ❌ Accès refusé → Animation rouge + alerte
   - Log enregistré dans Supabase

4. **Synchronisation**
   - Logs synchronisés en temps réel
   - Dashboard admin mis à jour
   - Statistiques actualisées

## 🎯 Types d'accès

### Visiteur Free (🆓)
- Accès zones publiques uniquement
- QR code blanc

### Visiteur Premium (⭐)
- Accès zones VIP
- QR code doré

### Partenaire Museum (🏛️)
- Accès stand + zones partenaires
- QR code bleu

### Partenaire Silver (🥈)
- Accès étendu + événements
- QR code argenté

### Partenaire Gold (🥇)
- Accès premium + backstage
- QR code doré

### Partenaire Platinum (💎)
- Accès total + VIP lounge
- QR code diamant animé

### Exposant (🏢)
- Accès stands + zones techniques
- QR code vert

## 📈 Métriques de Performance

- **Scan time**: < 200ms
- **Validation time**: < 100ms
- **Battery drain**: < 5%/heure
- **Offline support**: 24h cache
- **Sync latency**: < 1s

## 🔧 Maintenance

- QR code rotation automatique
- Logs auto-archivage après 30 jours
- Cache cleanup quotidien
- Health checks toutes les 5 minutes

## 📱 Permissions Requises

- Camera (Scanner QR)
- Internet (Sync temps réel)
- Vibration (Feedback haptique)
- Notifications Push
- Biometric (Touch ID/Face ID)
