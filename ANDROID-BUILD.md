# 📱 Android APK Generation Guide for Shree Gayatri Electricals

This project is configured with **Capacitor**, the industry-standard native WebView wrapper for Vite + React. It wraps your existing React application into a native Android project with **zero changes to your business logic or UI**.

---

## 📁 Added Mobile Files & Structure

```
├── capacitor.config.ts                   # Capacitor mobile configuration
├── .github/workflows/build-apk.yml       # Automated cloud APK builder (GitHub Actions)
├── public/
│   ├── manifest.webmanifest              # PWA manifest for home screen install
│   └── icon.svg                          # Vector app launcher icon
└── android/                              # Complete Native Android Studio Project
    ├── app/
    │   ├── src/main/
    │   │   ├── AndroidManifest.xml       # Android app permissions & activity config
    │   │   ├── java/com/.../MainActivity # Native launcher activity
    │   │   └── res/values/strings.xml    # App name ("Shree Gayatri Electricals")
    │   └── build.gradle                  # App-level Gradle build configuration
    ├── gradlew                           # Gradle wrapper script (Linux / Mac)
    ├── gradlew.bat                       # Gradle wrapper script (Windows)
    └── build.gradle                      # Project-level Gradle build script
```

---

## 🚀 How to Generate the `.apk` File

You have **3 simple ways** to get your `.apk` file:

---

### Option 1: Automatic Cloud Build via GitHub (Recommended — No Android Studio Needed)

Since your project is hosted on GitHub (`https://github.com/Murlikoli22/my-work-data`), an automated GitHub Actions workflow (`.github/workflows/build-apk.yml`) is already configured!

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Android Capacitor project and APK workflow"
   git push origin main
   ```
2. **Go to your GitHub Repository**:
   - Open [https://github.com/Murlikoli22/my-work-data](https://github.com/Murlikoli22/my-work-data)
   - Click on the **Actions** tab at the top.
   - You will see the **Build Android APK** workflow running automatically.
   - (You can also trigger it manually anytime by clicking **Build Android APK** in the left sidebar and clicking **Run workflow**).
3. **Download your APK**:
   - When the workflow completes (approx. 2–3 minutes), click on the completed run.
   - Under the **Artifacts** section at the bottom of the page, click **ShreeGayatriElectricals-app-debug**.
   - Extract the downloaded zip file — inside is your installable `app-debug.apk`!
4. **Install on Phone**:
   - Send `app-debug.apk` to your Android phone via WhatsApp, Telegram, Google Drive, or USB cable.
   - Tap on the `.apk` file on your phone and tap **Install** (if prompted, allow "Install from unknown sources").

---

### Option 2: Build Locally using Android Studio (GUI)

If you have **Android Studio** installed on your computer:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Murlikoli22/my-work-data.git
   cd my-work-data
   npm install
   ```
2. **Build and Sync**:
   ```bash
   npm run cap:sync
   ```
3. **Open in Android Studio**:
   ```bash
   npm run cap:android
   ```
   *(Or open Android Studio, select "Open", and choose the `android` folder in this repository).*
4. **Generate APK**:
   - In Android Studio's top menu bar, go to:
     **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - When the build finishes, a notification will appear at the bottom right:
     `APK(s) generated successfully: [locate]`.
   - Click **locate** to open the folder containing `app-debug.apk` (located at `android/app/build/outputs/apk/debug/app-debug.apk`).

---

### Option 3: Build Locally using Command Line (CLI)

If you have Java (JDK 17 or 21) and Android SDK Command-line Tools installed:

1. **Run the one-step build command**:
   ```bash
   npm run build:apk
   ```
2. **Or run Gradle directly**:
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleDebug      # On Linux/macOS
   gradlew.bat assembleDebug    # On Windows
   ```
3. **Your APK will be located at**:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Option 4: Instant Installation without APK (Mobile WebAPK / PWA)

Your app preview links:
- **Shared Public Link (Best for mobile phone & sharing)**:  
  `https://ais-pre-wadp5vvzty6kccgslnj2sf-354715041450.asia-northeast1.run.app`
- **Development App Link**:  
  `https://ais-dev-wadp5vvzty6kccgslnj2sf-354715041450.asia-northeast1.run.app`

### How to install on your Android phone:
1. Open the **Shared Link** above in **Google Chrome** on your phone.
2. Tap the three-dot menu (**⋮**) in the top-right corner of Chrome.
3. Tap **"Install app"** (or **"Add to Home screen"**).
4. Tap **Install** — the app icon will appear on your phone screen just like any installed app and will launch in full-screen standalone mode.

---

## ⚙️ Configuration Details
- **App ID**: `com.shreegayatrielectricals.workdata`
- **App Name**: `Shree Gayatri Electricals`
- **Framework**: Capacitor 8 + Android Gradle Plugin 8.7
- **Target SDK**: Android 34 / 35
