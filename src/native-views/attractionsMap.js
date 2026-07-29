import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Snack's bundler doesn't do Metro's platform-extension resolution
// (attractionsMap.native.js / .web.js), so it falls through to this bare
// file. react-native-maps and @vis.gl/react-google-maps can't run in the
// Snack runtime anyway (no native linking, no Google Maps key), so this is a
// static placeholder for the Snack preview only — real builds still resolve
// the platform-specific files.
export function AttractionsMap({ attractions }) {
  const count = (attractions || []).length;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map preview unavailable in Snack</Text>
      <Text style={styles.subtitle}>
        {count} attraction{count === 1 ? "" : "s"} would be shown here on a real build.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8e2dd",
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    color: "#6b6b6b",
    textAlign: "center",
  },
});
