#!/usr/bin/env  bash
set -euo pipefail

# Run from project root or mobile-app directory
if [[ -f "package.json" ]] && [[ -d "src" || -f "App.js" ]]; then
    APP_DIR="$(pwd)"
elif [[ -d "mobile-app" ]]; then
    APP_DIR="$(pwd)/mobile-app"
else
    echo "Could not find mobile-app directory. Run this script from repo root or mobile-app" >&2
    exit 1
fi

cd "$APP_DIR"

echo "[1/7] Cleaning Metro cache and install artifacts..."
rm -rf .expo
rm -rf node_modules
rm -f package-lock.json

echo "[2/7] Reinstalling JS dependencies..."
npm install

echo "[3/7] Ensuring Expo SDK-compatible native modules..."
npx expo install --fix

echo "[4/7] Recreating native IOS project from app config..."
rm -rf ios
npx expo prebuild --platform ios --clean

echo "[5/7] Installing CocaPods dependencies..."
cd ios
pod deintegrate || true
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..

echo "[6/7] Clearing Xcode DerivedData cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "[7/7] Done."
echo "Open ios/*.xcworkspace in Xcode, Product -> Clean Build Folder, then build again."