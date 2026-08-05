import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mcouto.showdosaber",
  appName: "Show do Saber — Tutor Inteligente com IA",
  webDir: "android-web",
  backgroundColor: "#080b1f",
  loggingBehavior: "none",
  android: {
    backgroundColor: "#080b1f",
    webContentsDebuggingEnabled: false,
  },
  server: {
    url: "https://showdosaber.lovable.app",
    cleartext: false,
    errorPath: "offline.html",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1800,
      backgroundColor: "#080b1fff",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
