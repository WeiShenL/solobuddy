// following https://github.com/expo/expo/issues/40513
export default {
  expo: {
    name: "SoloBuddy",
    slug: "solobuddy",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "project",
    assetBundlePatterns: ["**/*"],
    userInterfaceStyle: "automatic",
    ios: {
      newArchEnabled: true,
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.project",
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
      "package": "com.anonymous.project",
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
        "projectId": "27b2b561-c8f3-4802-b274-98889698f45f"
      }
    }
  },
};