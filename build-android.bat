@echo off
REM Build Android APK for SIPORTS 2026
REM Usage: build-android.bat [debug|release]

setlocal enabledelayedexpansion

set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=debug

echo 🔨 Building Android APK (%BUILD_TYPE%)...

REM Check if Gradle wrapper exists
if not exist "android\gradlew.bat" (
    echo ❌ ERROR: Android project not found. Run 'npm run mobile:sync' first
    exit /b 1
)

cd android

if "%BUILD_TYPE%"=="release" (
    echo 📦 Building release APK...
    call gradlew.bat assembleRelease
    set BUILD_OUTPUT=app\build\outputs\apk\release\app-release.apk
) else (
    echo 🐛 Building debug APK...
    call gradlew.bat assembleDebug
    set BUILD_OUTPUT=app\build\outputs\apk\debug\app-debug.apk
)

if exist "%BUILD_OUTPUT%" (
    echo ✅ APK built successfully!
    echo 📍 Output: !CD!\%BUILD_OUTPUT%
    cd ..
    copy "android\%BUILD_OUTPUT%" "siport-app-%BUILD_TYPE%.apk" >nul
    echo 📦 Copied to: siport-app-%BUILD_TYPE%.apk
) else (
    echo ❌ APK build failed
    exit /b 1
)

