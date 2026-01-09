#!/bin/bash
# Build iOS App for SIPORTS 2026
# Usage: ./build-ios.sh [debug|release]

BUILD_TYPE=${1:-debug}

echo "🔨 Building iOS App (${BUILD_TYPE})..."

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ ERROR: Xcode not installed. Install Xcode from App Store"
    exit 1
fi

# Check if iOS project exists
if [ ! -f "ios/App/App.xcworkspace/contents.xcworkspacedata" ]; then
    echo "❌ ERROR: iOS project not found. Run 'npm run mobile:sync' first"
    exit 1
fi

cd ios/App

if [ "$BUILD_TYPE" = "release" ]; then
    # Release build
    echo "📦 Building release IPA..."
    xcodebuild -workspace App.xcworkspace \
        -scheme App \
        -configuration Release \
        -archivePath build/App.xcarchive \
        archive
    
    xcodebuild -exportArchive \
        -archivePath build/App.xcarchive \
        -exportOptionsPlist ../exportOptions.plist \
        -exportPath build/ipa
    
    BUILD_OUTPUT="build/ipa/App.ipa"
else
    # Debug build
    echo "🐛 Building debug app..."
    xcodebuild -workspace App.xcworkspace \
        -scheme App \
        -configuration Debug \
        -derivedDataPath build \
        build
    
    BUILD_OUTPUT="build/Build/Products/Debug-iphoneos/App.app"
fi

if [ -f "$BUILD_OUTPUT" ] || [ -d "$BUILD_OUTPUT" ]; then
    echo "✅ iOS app built successfully!"
    echo "📍 Output: $(pwd)/$BUILD_OUTPUT"
else
    echo "❌ iOS build failed"
    exit 1
fi

