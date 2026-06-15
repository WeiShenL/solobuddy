import React, { useState } from "react";
import { ScrollView, View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { styles } from "./wishlistStyles";

export default function WishlistView({
  activeItems = [],
  visitedItems = [],
  activeCount = 0,
  canGenerate = false,
  itineraryState = {},
  onGenerateItinerary,
  onRemoveItem,
  onMarkVisited,
}) {
  // allows value changes to rerender componenttt
  const [visitedExpanded, setVisitedExpanded] = useState(false);
  const [tab, setTab] = useState(0);

  const itineraryLoading = !!itineraryState.promise && !itineraryState.data && !itineraryState.error;
  const itineraryError = itineraryState.error;
  const itineraryData = itineraryState.data;
  const generateDisabled = !canGenerate || itineraryLoading;
  // i keep it 5 to make it usable. Myabe can explore to asking it to "recommend?"
  const placesNeeded = Math.max(0, 5 - activeCount);

  // there was an issue where the location name wasn't loading onthe wishlist page, added this helper fuunction to get it
  function getLocationText(attraction) {
    if (!attraction) return "";
    if (typeof attraction.location === "string" && attraction.location.trim()) return attraction.location.trim();
    if (typeof attraction.formattedAddress === "string" && attraction.formattedAddress.trim()) return attraction.formattedAddress.trim();
    if (attraction.formattedAddress?.text) return String(attraction.formattedAddress.text).trim();
    return "";
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <Text style={styles.title}>My Trips</Text> */}
        {/* tab 0 is wishlist, tab 1 is itinerary */}
        <SegmentedControl
          values={["Wishlist", "Itinerary"]}
          selectedIndex={tab}
          onChange={(e) => setTab(e.nativeEvent.selectedSegmentIndex)}
          style={{ marginBottom: 16 }}
        />

        {/* wishlist tab */}
        {tab === 0 && (
          <>
            {activeItems.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 16, color: "#666" }}>Your saved attractions will appear here.</Text>
              </View>
            ) : (
              activeItems.map((it, idx) => (
                <View key={it.id || idx} style={styles.card}>
                  <View style={styles.cardRow}>
                    {it.imageUrl ? (
                      <Image source={{ uri: it.imageUrl }} style={styles.cardImage} />
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{it.name || it.title || "Untitled"}</Text>
                      {getLocationText(it) ? <Text style={styles.location}>{getLocationText(it)}</Text> : null}
                      {it.description ? <Text style={styles.cardSubtitle}>{it.description}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable style={[styles.actionButton, { backgroundColor: "#10b981" }]} onPress={() => onMarkVisited?.(it.id, true)}>
                      <Text style={{ color: "#fff", fontWeight: "600" }}>Mark as Visited</Text>
                    </Pressable>
                    <Pressable style={[styles.actionButton, { backgroundColor: "#000000" }]} onPress={() => onRemoveItem?.(it.id)}>
                      <Text style={{ color: "#fff", fontWeight: "600" }}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            {/* visited places collapsible section */}
            {visitedItems.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Pressable
                  style={styles.visitedHeader}
                  onPress={() => setVisitedExpanded((prev) => !prev)}
                >
                  <Text style={styles.visitedHeaderText}>
                    ✓ Visited Places ({visitedItems.length})
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>{visitedExpanded ? "▲" : "▼"}</Text>
                </Pressable>
                {visitedExpanded &&
                  visitedItems.map((it, idx) => (
                    <View key={it.id || idx} style={[styles.card, { opacity: 0.6, backgroundColor: "#f9fafb" }]}>
                      <Text style={[styles.cardTitle, { color: "#6b7280" }]}>
                        {it.name || it.title || "Untitled"}
                      </Text>
                      {getLocationText(it) ? (
                        <Text style={[styles.location, { color: "#9ca3af" }]}>{getLocationText(it)}</Text>
                      ) : null}
                      <Pressable
                        style={styles.undoButton}
                        onPress={() => onMarkVisited?.(it.id, false)}
                      >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>Mark as Unvisited</Text>
                      </Pressable>
                    </View>
                  ))}
              </View>
            )}
          </>
        )}

        {/* itinerary tab */}
        {tab === 1 && (
          itineraryData ? (
            <View style={{ marginBottom: 16 }}>
              {itineraryData.summary ? (
                <Text style={styles.itinerarySummary}>{itineraryData.summary}</Text>
              ) : null}
              <Text style={styles.aiWarningText}>
                ⚠️ This is AI generated. Please verify details before your trip.
              </Text>
              {(itineraryData.days || []).map((day, dayIdx) => (
                <View key={day.day ?? dayIdx} style={[styles.card, styles.dayCard]}>
                  <Text style={styles.dayHeader}>
                    Day {day.day ?? dayIdx + 1}
                    {day.theme ? ` · ${day.theme}` : ""}
                  </Text>
                  {(day.stops || []).map((stop, stopIdx) => (
                    <View key={stop.attractionId || stopIdx} style={styles.stopRow}>
                      <Text style={styles.stopTime}>{stop.time || "--:--"}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stopName}>{stop.name || "Untitled stop"}</Text>
                        {stop.tip ? <Text style={styles.stopTip}>{stop.tip}</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={{ fontSize: 16, color: "#666" }}>Create itinerary based on your wishlist! Add at least 5 places into your wishlist and press generate itinerary!</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* sticky gen btn only on itinerary tab */}
      {tab === 1 && (
        <View style={styles.stickyFooter}>
          <Pressable
            style={[styles.generateButton, generateDisabled && { backgroundColor: "#9ca3af" }]}
            onPress={onGenerateItinerary}
            disabled={generateDisabled}
          >
            {itineraryLoading ? (
              <View style={styles.generateLoadingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.generateButtonText}>✨ Building AI itinerary…</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>✨ Generate AI Itinerary</Text>
            )}
          </Pressable>
          {itineraryError ? (
            <Text style={styles.errorHint}>Generation failed. Tap to try again.</Text>
          ) : null}
          {!canGenerate && placesNeeded > 0 ? (
            <Text style={styles.generateHelper}>
              Add {placesNeeded} more place{placesNeeded === 1 ? "" : "s"} to generate an itinerary.
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}
