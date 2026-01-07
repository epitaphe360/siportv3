#!/bin/bash
# Build Android APK for SIPORTS 2026
# Usage: ./build-android.sh [debug|release]

BUILD_TYPE=${1:-debug}

echo "🔨 Building Android APK (${BUILD_TYPE})..."

# Check if Android SDK is installed
if [ ! -d "$ANDROID_SDK_ROOT" ]; then
    echo "❌ ERROR: ANDROID_SDK_ROOT not set or Android SDK not installed"
    exit 1
fi

# Check if Gradle is available
if ! command -v gradle &> /dev/null; then
    echo "❌ ERROR: Gradle not found. Install Android Studio or Gradle"
    exit 1
fi

cd android

if [ "$BUILD_TYPE" = "release" ]; then
    # Release build
    echo "📦 Building release APK..."
    ./gradlew assembleRelease
    BUILD_OUTPUT="app/build/outputs/apk/release/app-release.apk"
else
    # Debug build
    echo "🐛 Building debug APK..."
    ./gradlew assembleDebug
    BUILD_OUTPUT="app/build/outputs/apk/debug/app-debug.apk"
fi

if [ -f "$BUILD_OUTPUT" ]; then
    echo "✅ APK built successfully!"
    echo "📍 Output: $(pwd)/$BUILD_OUTPUT"
else
    echo "❌ APK build failed"
    exit 1
fi

