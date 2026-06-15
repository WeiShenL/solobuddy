import React from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { shared } from "./sharedStyles.js";

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Not provided"}</Text>
    </View>
  );
}

export default function ProfileView(props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          {props.avatarUrl ? (
            <Image source={{ uri: props.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{props.initials}</Text>
            </View>
          )}

          <Text style={styles.name}>{props.name}</Text>
          <Text style={styles.subtitle}>Profile details</Text>
        </View>

        <View style={styles.details}>
          <InfoRow label="Email" value={props.email} />
          <InfoRow label="Birthday" value={props.birthday} />
          <InfoRow label="Phone" value={props.phone} />
        </View>

        <View style={styles.buttonRow}>
          <Pressable style={styles.secondaryButton} onPress={props.onEdit}>
            <Text style={styles.secondaryButtonText}>Edit profile</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={props.onLogout}>
            <Text style={styles.primaryButtonText}>Log out</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shared.screenContent,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#D9C5B2",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
  },
  avatarFallback: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#523A34",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  details: {
    gap: 14,
    marginBottom: 24,
  },
  infoRow: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});