# SHRI AMUDHA SMALL FINANCE - BUILD & PACKAGING GUIDE (APK / AAB)

## 1. Overview
The mobile application is built using React Native with Expo (development builds / EAS Build) located in `frontend/mobile/`. It supports Android builds (APK for direct device distribution and AAB for Google Play Store release) and is iOS-ready.

---

## 2. Prerequisites
1. **Node.js**: v20+ or v24+
2. **EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. **Android SDK** (for local builds): Android Studio with Build Tools 34.0.0, JDK 17, and Platform Tools in `PATH`.

---

## 3. Environment Configuration
Create `frontend/mobile/.env` based on `frontend/mobile/.env.example`:
```env
EXPO_PUBLIC_API_URL=https://api.shriamudha.example.com
EXPO_PUBLIC_WS_URL=wss://api.shriamudha.example.com/realtime
EXPO_PUBLIC_APP_ENV=production
```

---

## 4. Building with Expo Application Services (EAS)

### A. Preview / Staging APK (Direct Installation)
To produce a standalone Android `.apk` file for testing on physical devices:
```bash
cd frontend/mobile
eas build --platform android --profile preview
```
This uses the configuration defined in `frontend/mobile/eas.json` under `preview` (`"buildType": "apk"`).

### B. Production Android App Bundle (.aab)
To generate the signed production release bundle for the Google Play Console:
```bash
cd frontend/mobile
eas build --platform android --profile production
```

### C. Local Standalone APK Build (Without EAS Cloud)
If building locally without cloud quotas:
```bash
cd frontend/mobile
npx expo run:android --variant release
```
The output APK will be placed in `android/app/build/outputs/apk/release/app-release.apk`.

---

## 5. Thermal Printer & Hardware Integration
- Ensure Bluetooth permissions are granted in Android: `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION`.
- The printer driver supports standard 58mm and 80mm ESC/POS commands over Bluetooth SPP.
- The fingerprint adapter connects to the Mantra MFS100 / Morpho RD service via Android USB OTG.
