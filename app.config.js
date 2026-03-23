module.exports = {
  expo: {
    name: "Job Vault Mobile",
    slug: "job-vault-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jobvault.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.jobvault.app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-router", "expo-sqlite"],
    scheme: "job-vault-mobile",
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || null,
    },
  },
};
