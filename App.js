// Root entry point required by Expo Snack.
// Snack only accepts App.js / App.tsx at the repo root, so it cannot use the
// "main": "expo-router/entry" indirection from package.json. This mounts the
// expo-router file-based routes in src/app manually instead.
// See https://github.com/expo/snack/issues/613
// Snack's runtime renders App.js's default export directly (it does not
// call registerRootComponent itself), so this must be a default export.
import { ExpoRoot } from "expo-router";

export default function App() {
    const ctx = require.context("./src/app");
    return <ExpoRoot context={ctx} />;
}
