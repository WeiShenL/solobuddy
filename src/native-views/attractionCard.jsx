// attractionCard.jsx
import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";

function getRatingMeta(rating) {
  if (rating >= 4.5) {
    return {
      label: "Highly Rated",
      badgeBackground: "#dcfce7",
      badgeText: "#166534",
    };
  }

  if (rating >= 3) {
    return {
      label: "Well Rated",
      badgeBackground: "#fef3c7",
      badgeText: "#92400e",
    };
  }

  return {
    label: "Mixed Reviews",
    badgeBackground: "#fee2e2",
    badgeText: "#991b1b",
  };
}

export function AttractionCard({ attraction, onSeeMore, cardWidth }) {
  const safety = getRatingMeta(attraction.userRating);

  return (
    <View style={[styles.card, cardWidth ? { width: cardWidth } : null]}>
      <Image
        source={{ // found some stock image to use as a fallback
          uri:
            attraction.imageUrl ||
            "https://images.unsplash.com/photo-1600290601473-3b73e4c531c9?auto=format&fit=crop&w=1200&q=80%22",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {attraction.name}
            </Text>
            <Text style={styles.location} numberOfLines={1}>
              {attraction.location}
            </Text>
          </View>

          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: safety.badgeBackground },
            ]}
          >
            <Text style={[styles.ratingBadgeText, { color: safety.badgeText }]}>
              {attraction.userRating?.toFixed(1) ?? "N/A"} ★
            </Text>
          </View>
        </View>

        <Text style={[styles.safetyLabel, { color: safety.badgeText }]}>
          {safety.label}
        </Text>

        {attraction.shortDescription ? (
          <Text style={styles.description} numberOfLines={2}>
            {attraction.shortDescription}
          </Text>
        ) : null}

        <Pressable
          onPress={() => onSeeMore?.(attraction)}
          style={({ pressed }) => [
            styles.seeMoreButton,
            pressed && styles.seeMoreButtonPressed,
          ]}
        >
          <Text style={styles.seeMoreText}>See More</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 170,
    backgroundColor: "#dbeafe",
  },
  content: {
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  location: {
    color: "#6b7280",
    fontSize: 14,
  },
  ratingBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  ratingBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  safetyLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
  },
  seeMoreButton: {
    marginTop: 4,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  seeMoreButtonPressed: {
    opacity: 0.85,
  },
  seeMoreText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});