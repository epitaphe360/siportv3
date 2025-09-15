import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.siports.app2026',
  appName: 'SIPORTS 2026',
  webDir: '../dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'siports'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#1e40af",
      showSpinner: true,
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e40af'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_siports",
      iconColor: "#1e40af",
      sound: "notification.wav"
    },
    Camera: {
      permissions: ["camera", "photos"]
    },
    Geolocation: {
      permissions: ["location"]
    },
    Network: {
      enabled: true
    }
  },
  ios: {
    scheme: 'SIPORTS2026',
    bundleId: 'com.siports.app2026'
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'siports-key',
      releaseType: 'AAB'
    },
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'VIBRATE',
      'WAKE_LOCK'
    ]
  }
};

export default config;