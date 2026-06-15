import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const MAX_CHARS = 300;

const CATEGORIES = [
  { key: "safety",     label: "Safety Tip", emoji: "🛡️", color: "#f97316", bg: "#fff7ed" },
  { key: "experience", label: "Experience", emoji: "✈️", color: "#10b981", bg: "#ecfdf5" },
  { key: "question",   label: "Question",   emoji: "❓", color: "#3b82f6", bg: "#eff6ff" },
];

export default function CommunityPostModal({ visible, onClose, onSubmit }) {
  const [text, setText] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [category, setCategory] = useState("experience");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmitACB() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(text, locationTag, category);
      setText("");
      setLocationTag("");
      setCategory("experience");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseACB() {
    setText("");
    setLocationTag("");
    setCategory("experience");
    onClose();
  }

  const remaining = MAX_CHARS - text.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCloseACB}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.backdrop}>
          <Pressable style={styles.overlay} onPress={handleCloseACB} />

          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Share your experience</Text>
              <Pressable
                onPress={handleCloseACB}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => {
                const selected = category === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setCategory(cat.key)}
                    style={[
                      styles.categoryPill,
                      { borderColor: cat.color, backgroundColor: selected ? cat.bg : "#f9fafb" },
                    ]}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.categoryLabel, { color: selected ? cat.color : "#6b7280" }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Share a safety tip or travel experience..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={MAX_CHARS}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
            />

            <Text style={[styles.charCount, remaining < 30 && styles.charCountWarn]}>
              {remaining} characters left
            </Text>

            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <TextInput
                style={styles.locationInput}
                placeholder="Location (optional, e.g. Stockholm)"
                placeholderTextColor="#9ca3af"
                value={locationTag}
                onChangeText={setLocationTag}
                maxLength={60}
              />
            </View>

            <Pressable
              onPress={handleSubmitACB}
              disabled={!text.trim() || submitting}
              style={({ pressed }) => [
                styles.submitButton,
                (!text.trim() || submitting) && styles.submitDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.submitText}>
                {submitting ? "Posting..." : "Post"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "700",
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    minHeight: 100,
    backgroundColor: "#f9fafb",
  },
  charCount: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
    marginTop: -4,
  },
  charCountWarn: {
    color: "#ef4444",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 10,
  },
  submitButton: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitDisabled: {
    backgroundColor: "#d1d5db",
  },
  submitText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
});
