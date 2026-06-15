// following https://github.com/expo/expo/issues/40513
export default {
  expo: {
    name: "SoloBuddy",
    slug: "solobuddy",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "solobuddy",
    assetBundlePatterns: ["**/*"],
    userInterfaceStyle: "automatic",
    ios: {
      newArchEnabled: true,
      supportsTablet: true,
      bundleIdentifier: "com.weishenl.solobuddy",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      },
    },
    android: {
      newArchEnabled: false,
      adaptiveIcon: {
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        },
      },
      "package": "com.weishenl.solobuddy",
    },
    web: {
      bundler: "metro",
      output: "static",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Show current location on map.",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "baa0694b-0153-4499-8308-13531a61afc6",
      },
    },
  },
};