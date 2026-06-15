import React from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { shared } from "./sharedStyles.js";

export default function ProfileEditView(props) {
  const { form, saving, uploading, errorText } = props;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          {form.avatarUrl ? (
            <Image source={{ uri: form.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>?</Text>
            </View>
          )}

          <Pressable style={styles.photoButton} onPress={props.onChoosePhoto}>
            <Text style={styles.photoButtonText}>
              {uploading ? "Uploading..." : "Choose photo"}
            </Text>
          </Pressable>

          {uploading ? <ActivityIndicator style={styles.spinner} /> : null}
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={form.name}
          onChangeText={(text) => props.onChangeField("name", text)}
          placeholder="Your name"
          maxLength={30}
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={form.email}
          onChangeText={(text) => props.onChangeField("email", text)}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Birthday</Text>
        <TextInput
          value={form.birthday}
          onChangeText={(text) => props.onChangeField("birthday", text)}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          style={styles.input}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={form.phone}
          onChangeText={(text) => props.onChangeField("phone", text)}
          placeholder="+46..."
          keyboardType="phone-pad"
          style={styles.input}
        />

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelButton} onPress={props.onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          <Pressable style={styles.saveButton} onPress={props.onSave}>
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
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
    backgroundColor: "#d9c5b2",
    borderRadius: 20,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
  },
  avatarFallback: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#7d5a50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
  },
  photoButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  photoButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  spinner: {
    marginTop: 10,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  errorText: {
    color: "#dc2626",
    marginTop: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});