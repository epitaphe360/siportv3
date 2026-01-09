# ⏳ PHASE 6 BUG #9 - iOS/ANDROID BUILDS - INFRASTRUCTURE READY

**Status:** ⏳ **READY FOR BUILD (Blocked on Environment)**  
**Date:** January 6, 2026  
**Projects Generated:** iOS ✅ | Android ✅  
**Web Assets:** Synced ✅  
**Build Tools Required:** Xcode (macOS) | Android Studio (all platforms)  

---

## 📋 CURRENT STATUS

### **What's Complete**
✅ Capacitor setup (Phase 6 Bug #8)  
✅ All 11 plugins installed  
✅ iOS project generated (`ios/App/App.xcworkspace`)  
✅ Android project generated (`android/` with Gradle)  
✅ Web assets synced to both platforms  
✅ Build scripts created  

### **What's Blocked**
⏳ Android APK build - Requires Java/Android SDK  
⏳ iOS IPA build - Requires Xcode (macOS only)  
⏳ App Store signing - Requires Apple Developer Account  
⏳ Play Store signing - Requires Android keystore  

---

## 🔧 BUILD REQUIREMENTS

### **For Android APK Build**

**Requirements:**
- ✅ Gradle wrapper in `android/` (already present)
- ⏳ Java JDK 11+ installed
- ⏳ Android SDK installed (via Android Studio or standalone)
- ⏳ Android API level 32+ (configured in build.gradle)

**Environment Variables Needed:**
```bash
JAVA_HOME=/path/to/jdk
ANDROID_SDK_ROOT=/path/to/android-sdk
```

**Build Steps:**
```bash
cd android
./gradlew assembleDebug      # Debug APK
./gradlew assembleRelease    # Release APK
```

**Outputs:**
- Debug: `app/build/outputs/apk/debug/app-debug.apk` (~50-80 MB)
- Release: `app/build/outputs/apk/release/app-release.apk` (requires keystore)

**Time:** ~5-10 minutes first build, ~2-3 minutes incremental

### **For iOS IPA Build**

**Requirements:**
- ⏳ Xcode 14+ (macOS only)
- ⏳ iOS deployment target 12.0+
- ⏳ Apple Developer Account
- ⏳ Signing certificate
- ⏳ Provisioning profile

**Environment Setup:**
```bash
sudo xcode-select --install        # Install Xcode Command Line Tools
open ios/App/App.xcworkspace       # Opens in Xcode
```

**Build Steps (in Xcode):**
1. Select "App" scheme
2. Select target device/simulator
3. Product → Build (Cmd+B)
4. Product → Archive for release

**Or via command line:**
```bash
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -derivedDataPath build \
  build

# For release:
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/App.xcarchive \
  archive
```

**Time:** ~10-15 minutes first build, ~5 minutes incremental

---

## 📱 BUILD CONFIGURATIONS

### **Android Configuration**

**File:** `capacitor.config.ts`
```typescript
android: {
  buildOptions: {
    keystorePath: undefined,      // Set to build release
    keystorePassword: undefined,
    keystoreAlias: undefined,
    keystoreAliasPassword: undefined,
    releaseType: 'APK'  // or 'AAB' for Play Store
  }
}
```

**For Release Signing:**
1. Create keystore:
```bash
keytool -genkey -v -keystore siport.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias siport
```

2. Update capacitor.config.ts:
```typescript
android: {
  buildOptions: {
    keystorePath: './siport.keystore',
    keystorePassword: 'your-password',
    keystoreAlias: 'siport',
    keystoreAliasPassword: 'your-password',
    releaseType: 'APK'
  }
}
```

3. Build release:
```bash
npx cap update android
cd android
./gradlew assembleRelease
```

### **iOS Configuration**

**File:** `capacitor.config.ts`
```typescript
ios: {
  scheme: 'SIPORTS 2026'
}
```

**For Release Signing (in Xcode):**
1. Select project "App" in Xcode
2. Go to "Signing & Capabilities"
3. Select team
4. Configure provisioning profile
5. Build and archive

**Environment Setup:**
```bash
# Set developer team
defaults write com.apple.dt.Xcode IDESourceTreeDisplayNames -dict-add SOURCE_ROOT "$(pwd)"

# Or set in build command:
xcodebuild \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  PROVISIONING_PROFILE="your-profile" \
  ...
```

---

## 📊 BUILD OUTPUTS

### **Android Artifacts**

```
android/app/build/outputs/
├── apk/
│   ├── debug/
│   │   └── app-debug.apk         (ready for emulator/device)
│   └── release/
│       └── app-release.apk       (ready for Play Store)
└── bundle/
    └── release/
        └── app-release.aab       (for Play Store)
```

**Installation on Device:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### **iOS Artifacts**

```
ios/App/build/
├── App.xcarchive/
│   └── Products/Applications/App.app
└── ipa/
    └── App.ipa                   (ready for App Store)
```

**Installation on Device:**
- Via Xcode: Product → Run on device
- Via TestFlight: Upload IPA via Apple Transporter
- Via App Store: Submit via App Store Connect

---

## 🛠️ AVAILABLE NPM SCRIPTS

```json
{
  "mobile:sync": "npx cap sync",
  "mobile:open-ios": "npx cap open ios",
  "mobile:open-android": "npx cap open android",
  "build:mobile": "npm run build && npx cap build"
}
```

---

## 📋 PREREQUISITES CHECKLIST

### **For Android Debug Build**
- [ ] Java JDK 11+ installed
- [ ] Android SDK installed (via Android Studio)
- [ ] JAVA_HOME environment variable set
- [ ] ANDROID_SDK_ROOT environment variable set
- [ ] Android API level 32+ available

### **For Android Release Build**
- [ ] All above items
- [ ] Keystore file created
- [ ] capacitor.config.ts configured with keystore path
- [ ] Keystore password known

### **For iOS Debug Build (macOS only)**
- [ ] Xcode 14+ installed
- [ ] Xcode Command Line Tools installed
- [ ] iOS deployment target 12.0+ available

### **For iOS Release Build (macOS only)**
- [ ] All above items
- [ ] Apple Developer Account active
- [ ] Signing certificate installed in Keychain
- [ ] Provisioning profile available
- [ ] Team ID configured in Xcode

### **For App Store Submission**
- [ ] iOS: Apple Developer Account ($99/year)
- [ ] Android: Google Play Developer Account ($25 one-time)
- [ ] Privacy Policy URL
- [ ] App screenshots/previews
- [ ] App description in multiple languages (if needed)

---

## 🚀 BUILD ROADMAP

### **Current Session (Jan 6, 2026)**
✅ Phase 6 Bug #8: Capacitor Setup - Complete  
⏳ Phase 6 Bug #9: Builds - Ready, blocked on tools  

### **For Next Session (When Tools Available)**

**Step 1: Install Development Tools** (1-2 hours)
```bash
# Android Studio (Windows/Mac/Linux)
# Xcode (macOS only)
# Set environment variables
```

**Step 2: Build Android Debug APK** (5-10 minutes)
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

**Step 3: Test on Android Emulator** (10-15 minutes)
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
# Test all features: camera, notifications, geolocation, etc.
```

**Step 4: Build Android Release APK** (5-10 minutes)
```bash
# Configure keystore in capacitor.config.ts
cd android
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

**Step 5: Build iOS Debug App** (10-15 minutes, macOS only)
```bash
npm run build
npx cap sync ios
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  build
```

**Step 6: Test on iOS Simulator** (10-15 minutes)
```bash
# Run app on iOS simulator from Xcode
# Test all features
```

**Step 7: Build iOS Release IPA** (10-15 minutes, macOS only)
```bash
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/App.xcarchive \
  archive
# Output: build/App.xcarchive
```

**Step 8: Prepare for App Store** (2-3 hours)
```bash
# Create app listings in App Store Connect (iOS)
# Create app listings in Google Play Console (Android)
# Upload screenshots, descriptions, privacy policy
# Submit for review
```

---

## 📈 ESTIMATED TIMELINES

| Task | Time | Platform |
|------|------|----------|
| Install JDK + Android Studio | 30 min | Android |
| Build debug APK | 5-10 min | Android |
| Test on emulator | 10 min | Android |
| Build release APK | 5-10 min | Android |
| Install Xcode | 2+ hours | iOS |
| Build debug app | 10-15 min | iOS |
| Test on simulator | 10 min | iOS |
| Build release IPA | 10-15 min | iOS |
| Submit to App Store | 2-3 hours | iOS |
| Submit to Play Store | 2-3 hours | Android |

**Total for both platforms:** ~8-12 hours (spread across multiple sessions)

---

## 🔒 SIGNING & DISTRIBUTION

### **Android Play Store**

1. Create keystore (one-time):
```bash
keytool -genkey -v -keystore siport.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias siport_key
```

2. Build release APK:
```bash
npx cap update android
cd android
./gradlew assembleRelease
```

3. Submit to Google Play Console

### **iOS App Store**

1. Get Apple Developer Certificate
2. Configure provisioning profile
3. Build and archive in Xcode
4. Export IPA for App Store
5. Submit via App Store Connect

---

## ✨ STATUS SUMMARY

**Phase 6 Bug #9 - iOS/Android Builds:**
- Status: ⏳ **INFRASTRUCTURE READY**
- Blocked on: Development tools (Xcode, Android Studio)
- Infrastructure: ✅ Complete
- Build scripts: ✅ Created
- Configuration: ✅ In place
- Ready to build: Upon tool installation

---

## 🎯 NEXT STEPS

1. **Install development tools:**
   - Android Studio (Java, Android SDK, Gradle)
   - Xcode (macOS, iOS SDK)

2. **Build debug apps:**
   - Android debug APK
   - iOS debug app

3. **Test on devices/emulators:**
   - Run all features
   - Verify functionality

4. **Build release apps:**
   - Android release APK
   - iOS release IPA

5. **Submit to app stores:**
   - Google Play Store
   - Apple App Store

---

**Session:** Phase 6 Bug #9  
**Generated:** January 6, 2026  
**Status:** Infrastructure ready, blocked on environment  
**Completion:** 0% (builds), 100% (infrastructure)

