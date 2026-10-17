# Shri Amudha Small Finance – Frontend Client Workspace

This workspace houses the mobile application (React Native + Expo) and web administration panel (React + Vite).

## Structure
- **`shared/`**: UI-only shared design system, yellow-white design tokens, motion tokens, i18n dictionary (English + Tamil), dynamic form engine, and generated API contract types. **Never imports backend code.**
- **`mobile/`**: React Native Expo mobile app (Android APK/AAB first, iOS-ready), Expo Router, offline SQLite sync, Bluetooth thermal printer support (58/80mm ESC/POS), and biometric authentication.
- **`web/`**: React + Vite admin panel for Super Admins and Managers (Workflow Designer, Form Builder, P&L, Reports).
- **`scripts/sync-contract.js`**: Syncs `backend/contract/` into `frontend/shared/generated/` and generates TypeScript permission types.

## Running Development

```bash
# 1. Sync API contract from backend
npm run sync:contract

# 2. Run React Native Mobile App
npm run dev:mobile

# 3. Run Web Admin Panel
npm run dev:web
```
