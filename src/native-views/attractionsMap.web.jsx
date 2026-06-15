import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export function AttractionsMap({
  attractions,
  onSelectAttraction,
  searchResults,
}) {
  const [selectedMarker, setSelectedMarker] = useState(null);

  const mappableAttractions = useMemo(function getMappableAttractionsACB() {
    return (attractions || []).filter(function hasCoordinatesACB(attraction) {
      return (
        Number.isFinite(attraction.latitude) &&
        Number.isFinite(attraction.longitude)
      );
    });
  }, [attractions]);

  const mappableSearchResults = useMemo(function getMappableSearchACB() {
    return (searchResults || []).filter(
      (r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude)
    );
  }, [searchResults]);

  const allMarkers = [...mappableAttractions, ...mappableSearchResults];

  const center = useMemo(function computeCenterACB() {
    const source = mappableSearchResults.length ? mappableSearchResults : mappableAttractions;
    if (!source.length) return { lat: 20, lng: 0 };

    const total = source.reduce(
      function addCoordinatesACB(acc, item) {
        return { lat: acc.lat + item.latitude, lng: acc.lng + item.longitude };
      },
      { lat: 0, lng: 0 }
    );

    return { lat: total.lat / source.length, lng: total.lng / source.length };
  }, [mappableAttractions, mappableSearchResults]);

  function handleMarkerClickACB(item) {
    setSelectedMarker(item);
  }

  function handleInfoWindowCloseACB() {
    setSelectedMarker(null);
  }

  function handleSeeMoreACB(item) {
    setSelectedMarker(null);
    onSelectAttraction?.(item);
  }

  if (!GOOGLE_API_KEY) {
    return (
      <View style={[styles.map, styles.messageContainer]}>
        <Text style={styles.messageText}>
          Add EXPO_PUBLIC_GOOGLE_API_KEY to your env file to load the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.map}>
        <APIProvider apiKey={GOOGLE_API_KEY}>
          <Map
            style={{ width: "100%", height: "100%" }}
            center={center}
            defaultZoom={allMarkers.length > 0 ? 11 : 3}
            mapId="attractions-map"
          >
            {mappableAttractions.map(function renderAttractionMarkerACB(attraction) {
              return (
                <AdvancedMarker
                  key={`attraction-${String(attraction.id ?? attraction.name)}`}
                  position={{ lat: attraction.latitude, lng: attraction.longitude }}
                  title={attraction.name}
                  onClick={function onClickACB() { handleMarkerClickACB(attraction); }}
                />
              );
            })}

            {mappableSearchResults.map(function renderSearchMarkerACB(result) {
              return (
                <AdvancedMarker
                  key={`search-${String(result.id ?? result.name)}`}
                  position={{ lat: result.latitude, lng: result.longitude }}
                  title={result.name}
                  onClick={function onClickACB() { handleMarkerClickACB(result); }}
                >
                  {/* blue pin to distinguish search results from regular attractions */}
                  <View style={styles.bluePin} />
                </AdvancedMarker>
              );
            })}

            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                onCloseClick={handleInfoWindowCloseACB}
              >
                <View style={styles.infoWindow}>
                  <Text style={styles.infoTitle}>{selectedMarker.name}</Text>
                  {!!selectedMarker.location && (
                    <Text style={styles.infoLocation}>{selectedMarker.location}</Text>
                  )}
                  <Pressable
                    style={styles.infoButton}
                    onPress={function onSeeMoreACB() { handleSeeMoreACB(selectedMarker); }}
                  >
                    <Text style={styles.infoButtonText}>See More</Text>
                  </Pressable>
                </View>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </View>

      {mappableSearchResults.length > 0 && (
        <View style={styles.resultsBadge}>
          <Text style={styles.resultsBadgeText}>
            {mappableSearchResults.length} result{mappableSearchResults.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 420,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e5e7eb",
  },
  messageContainer: {
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  messageText: {
    color: "#374151",
    fontSize: 14,
  },
  bluePin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0ea5e9",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  infoWindow: {
    padding: 4,
    gap: 4,
    minWidth: 140,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  infoLocation: {
    fontSize: 12,
    color: "#6b7280",
  },
  infoButton: {
    marginTop: 6,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  infoButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  resultsBadge: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 10,
  },
  resultsBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
