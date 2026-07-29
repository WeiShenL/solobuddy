// Root entry point required by Expo Snack.
// Snack only accepts App.js / App.tsx at the repo root, so it cannot use the
// "main": "expo-router/entry" indirection from package.json. This mounts the
// expo-router file-based routes in src/app manually instead.
// See https://github.com/expo/snack/issues/613
import { ExpoRoot } from "expo-router";
import { registerRootComponent } from "expo";

export function App() {
    const ctx = require.context("./src/app");
    return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
