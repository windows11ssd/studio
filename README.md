# NetGauge Speed Test

This is a Next.js web application built with Firebase Studio to measure internet speed. It functions as a Progressive Web App (PWA), allowing for installation on various devices.

## Getting Started

1.  **Install dependencies**: `npm install`
2.  **Run development server**: `npm run dev`
3.  Open [http://localhost:9002](http://localhost:9002) in your browser.

## Building for Production

Run `npm run build` to create an optimized production build.

## Packaging as a Native Mobile App (Android APK / iOS)

This is a web application (specifically a PWA), not a native Android or iOS app. You cannot directly export an `.apk` or iOS app bundle from this Next.js codebase.

However, you can package the PWA for app stores using tools that wrap web apps into native containers. Here's how:

**Using PWABuilder (Recommended):**

1.  **Deploy your application**: Make sure your NetGauge app is deployed to a publicly accessible HTTPS URL (e.g., using Firebase Hosting, Vercel, Netlify).
2.  **Go to PWABuilder**: Visit [pwabuilder.com](https://pwabuilder.com).
3.  **Enter your PWA URL**: Paste the deployed URL of your NetGauge app into PWABuilder.
4.  **Analyze**: Let PWABuilder analyze your PWA manifest and features.
5.  **Package for Stores**: Navigate to the packaging options. PWABuilder can generate packages for Android (using Trusted Web Activity - TWA), iOS, and Windows.
    *   **Android**: Follow the steps to build an Android package. This will likely involve downloading generated source code that you can build into an APK/AAB using Android Studio.
    *   **iOS**: Packaging for iOS is more complex due to Apple's requirements. PWABuilder provides guidance, but it typically involves using Xcode and might require some native code adjustments.

**Using Capacitor:**

Alternatively, you can integrate Capacitor into your project:

1.  Install Capacitor: `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios`
2.  Initialize Capacitor: `npx cap init NetGauge com.example.netgauge` (replace with your details)
3.  Configure `capacitor.config.ts`: Set the `webDir` to your Next.js build output directory (usually `out` after running `next export`, or configure appropriately for SSR/ISR builds).
4.  Add platforms: `npx cap add android`, `npx cap add ios`
5.  Build your Next.js app: `npm run build` (and `next export` if applicable).
6.  Sync Capacitor: `npx cap sync`
7.  Open the native project: `npx cap open android`, `npx cap open ios`
8.  Build the APK/AAB or iOS app using Android Studio or Xcode respectively.

**Note:** Directly generating binary files like `.apk` is not possible within this development environment. Tools like PWABuilder or manual integration with Capacitor/Cordova are necessary steps to bridge the web app to a native mobile package.
