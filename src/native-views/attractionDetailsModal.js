import { useState } from "react";
import {View, Text,Modal, ScrollView, Pressable, Linking, StyleSheet, ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";

function getTodayHoursACB(weekdayDescriptions) {
  if (!weekdayDescriptions?.length) return null;
  // getDay(): 0=Sun,1=Mon...6=Sat — weekdayDescriptions[0]=Mon...[6]=Sun
  const todayIndex = (new Date().getDay() + 6) % 7;
  const line = weekdayDescriptions[todayIndex] || "";
  // strip day name: "Monday: 9:00 AM – 5:00 PM" → "9:00 AM – 5:00 PM"
  return { line, todayIndex, todayHours: line.split(": ").slice(1).join(": ") };
}

// can include photos next time but then i scarewd API usage high
export function AttractionDetailsModal({ visible, onClose, attraction, placeDetails, loading, onAddToWishlist }) {
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // new UI state to control add-to-wishlist, 'adding' status to prevent duplicates, and 'added' to trigger pop up
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const hours = placeDetails?.currentOpeningHours || placeDetails?.regularOpeningHours;
  const weekdayDescriptions = hours?.weekdayDescriptions || [];
  const openNow = placeDetails?.currentOpeningHours?.openNow;
  const todayData = getTodayHoursACB(weekdayDescriptions);

  async function copyAddressACB() {
    if (!placeDetails?.formattedAddress) return;
    await Clipboard.setStringAsync(placeDetails.formattedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openUrlACB(url) {
    if (url) Linking.openURL(url);
  }

  function openPhoneACB(phone) {
    if (phone) Linking.openURL(`tel:${phone}`);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.overlay} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {attraction?.name || "Place details"}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="small" color="#0ea5e9" />
              <Text style={styles.loadingText}>Loading details...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {/* desc of pplace */}
              {placeDetails?.editorialSummary?.text ? (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryText}>
                    {placeDetails.editorialSummary.text}
                  </Text>
                </View>
              ) : null}

              {/* address */}
              {placeDetails?.formattedAddress ? (
                <View style={styles.row}>
                  <Text style={styles.rowIcon}>📍</Text>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>Address</Text>
                    <Text style={styles.rowValue}>{placeDetails.formattedAddress}</Text>
                    <Pressable
                      onPress={copyAddressACB}
                      style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.copyButtonText}>
                        {copied ? "Copied!" : "Copy address"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {/* ratings */}
              {placeDetails?.rating != null ? (
                <View style={styles.row}>
                  <Text style={styles.rowIcon}>⭐</Text>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>Rating</Text>
                    <Text style={styles.rowValue}>
                      {placeDetails.rating.toFixed(1)}
                      {placeDetails.userRatingCount
                        ? `  (${placeDetails.userRatingCount.toLocaleString()} reviews)`
                        : ""}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* opening hrs  */}
              {hours ? (
                <View style={styles.row}>
                  <Text style={styles.rowIcon}>🕐</Text>
                  <View style={styles.rowContent}>
                    <View style={styles.hoursHeaderRow}>
                      <View style={styles.hoursLeft}>
                        <View style={[
                          styles.openBadge,
                          openNow === false && styles.closedBadge,
                          openNow == null && styles.unknownBadge,
                        ]}>
                          <Text style={[
                            styles.openBadgeText,
                            openNow === false && styles.closedBadgeText,
                          ]}>
                            {openNow === true ? "Open now" : openNow === false ? "Closed now" : "Hours"}
                          </Text>
                        </View>
                        {todayData?.todayHours ? (
                          <Text style={styles.todayHours}>{todayData.todayHours}</Text>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => setHoursExpanded(!hoursExpanded)}
                        style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.expandArrow}>{hoursExpanded ? "▲" : "▼"}</Text>
                      </Pressable>
                    </View>

                    {hoursExpanded ? (
                      <View style={styles.allHours}>
                        {weekdayDescriptions.map(function renderHoursLineACB(line, i) {
                          return (
                            <Text
                              key={i}
                              style={[
                                styles.hoursLine,
                                i === todayData?.todayIndex && styles.todayLine,
                              ]}
                            >
                              {line}
                            </Text>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {/* phone no. */}
              {placeDetails?.nationalPhoneNumber ? (
                <Pressable
                  style={({ pressed }) => [styles.row, styles.pressableRow, pressed && styles.pressed]}
                  onPress={() => openPhoneACB(placeDetails.nationalPhoneNumber)}
                >
                  <Text style={styles.rowIcon}>📞</Text>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>Phone</Text>
                    <Text style={[styles.rowValue, styles.link]}>
                      {placeDetails.nationalPhoneNumber}
                    </Text>
                  </View>
                </Pressable>
              ) : null}

              {/* website */}
              {placeDetails?.websiteUri ? (
                <Pressable
                  style={({ pressed }) => [styles.row, styles.pressableRow, pressed && styles.pressed]}
                  onPress={() => openUrlACB(placeDetails.websiteUri)}
                >
                  <Text style={styles.rowIcon}>🌐</Text>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>Website</Text>
                    <Text style={[styles.rowValue, styles.link]} numberOfLines={1}>
                      {placeDetails.websiteUri}
                    </Text>
                  </View>
                </Pressable>
              ) : null}

              {/* Google Maps button */}
              {placeDetails?.googleMapsUri ? (
                <Pressable
                  style={({ pressed }) => [styles.mapsButton, pressed && styles.pressed]}
                  onPress={() => openUrlACB(placeDetails.googleMapsUri)}
                >
                  <Text style={styles.mapsButtonText}>Open in Google Maps</Text>
                </Pressable>
              ) : null}

              {/* Can add attraction to the user's wishlist via presenter callback */}
              <Pressable
                style={({ pressed }) => [styles.wishlistButton, pressed && styles.pressed]}
                onPress={async () => {
                  // Guard: ignore presses while already saving
                  if (adding) return;

                  // If presenter callback is provided, call it and show feedback.
                  try {
                    setAdding(true);
                    await onAddToWishlist?.();
                    // Show transient confirmation toast
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1800);
                  } catch (err) {
                    // On error, still show a brief notice (could be improved)
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1800);
                  } finally {
                    setAdding(false);
                  }
                }}
              >
                <Text style={styles.wishlistButtonText}>
                  {adding ? "Adding..." : added ? "Added to wishlist" : "Add to Wishlist"}
                </Text>
              </Pressable>

              {/* pop up briefly when an wishlist item is added */}
              {added ? (
                <View style={styles.addedPopup} pointerEvents="none">
                  <Text style={styles.addedPopupText}>Added to wishlist</Text>
                </View>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: "85%",
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginRight: 12,
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
  loadingBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#0ea5e9",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1e3a5f",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  pressableRow: {
    borderRadius: 12,
    padding: 4,
    marginHorizontal: -4,
  },
  rowIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#9ca3af",
  },
  rowValue: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 22,
  },
  link: {
    color: "#0ea5e9",
  },
  copyButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  hoursHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hoursLeft: {
    flex: 1,
    gap: 4,
  },
  openBadge: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#dcfce7",
  },
  closedBadge: {
    backgroundColor: "#fee2e2",
  },
  unknownBadge: {
    backgroundColor: "#f1f5f9",
  },
  openBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  closedBadgeText: {
    color: "#991b1b",
  },
  todayHours: {
    fontSize: 14,
    color: "#374151",
  },
  expandButton: {
    padding: 6,
  },
  expandArrow: {
    fontSize: 12,
    color: "#6b7280",
  },
  allHours: {
    marginTop: 8,
    gap: 4,
    paddingLeft: 4,
  },
  hoursLine: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 20,
  },
  todayLine: {
    color: "#111827",
    fontWeight: "700",
  },
  mapsButton: {
    marginTop: 4,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  mapsButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  wishlistButton: {
    backgroundColor: "#111827",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  wishlistButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  // Transient confirmation toast shown when an item is added to wishlist.
  addedPopup: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "50%",
    opacity: 0.9,
    backgroundColor: "#777e8e",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    elevation: 6,
    transform: [{ translateY: -40 }],
    zIndex: 50,
  },
  addedPopupText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
});
