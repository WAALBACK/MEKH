/// <reference types="@capacitor/splash-screen" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mekh.app',
  appName: 'Mekh',
  webDir: 'dist',
  plugins: {
    // Deep links for native OAuth (Google sign-in) and email confirmation
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1A56DB'
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#1A56DB',
      androidScaleType: 'CENTER',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },
    Browser: {
      presentationStyle: 'popover',
    }
  },
  server: {
    // Important for Android deep linking / custom scheme handling
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
    initialFocus: true,
  },
};

export default config;
