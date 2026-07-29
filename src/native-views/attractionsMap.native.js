import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

// rmb its stockholm default location if any issue w loc 
const DEFAULT_REGION = {
  latitude: 59.3293,
  longitude: 18.0686,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export function AttractionsMap({
  attractions,
  onSelectAttraction,
  searchResults,
  focusedSearchResult,
}) {
  const mapRef = useRef(null);
  const searchMarkerRefs = useRef({});
  const [userLocation, setUserLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const mappableAttractions = useMemo(function computeMappableACB() {
    return (attractions || []).filter(function hasCoordinatesACB(attraction) {
      return (
        Number.isFinite(attraction.latitude) &&
        Number.isFinite(attraction.longitude)
      );
    });
  }, [attractions]);

  const mappableSearchResults = useMemo(function computeMappableSearchACB() {
    return (searchResults || []).filter(
      (r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude)
    );
  }, [searchResults]);

  const fallbackRegion = useMemo(function computeFallbackRegionACB() {
    if (!mappableAttractions.length) {
      return DEFAULT_REGION;
    }

    const latitudes = mappableAttractions.map((item) => item.latitude);
    const longitudes = mappableAttractions.map((item) => item.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.05),
      longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.05),
    };
  }, [mappableAttractions]);

  // follow docs for animatetoregion reactnativemapsss
  useEffect(function animateToFocusedResultACB() {
    if (!focusedSearchResult || !mapRef.current) return;
    if (!Number.isFinite(focusedSearchResult.latitude) || !Number.isFinite(focusedSearchResult.longitude)) return;

    const key = String(focusedSearchResult.id ?? focusedSearchResult.name);
    mapRef.current.animateToRegion(
      {
        latitude: focusedSearchResult.latitude,
        longitude: focusedSearchResult.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600
    );
    searchMarkerRefs.current[key]?.showCallout();
  }, [focusedSearchResult]);

  // when search results arrive, animate the map to fit them all
  useEffect(function animateToSearchResultsACB() {
    if (!mappableSearchResults.length || !mapRef.current) return;

    if (mappableSearchResults.length === 1) {
      mapRef.current.animateToRegion(
        {
          latitude: mappableSearchResults[0].latitude,
          longitude: mappableSearchResults[0].longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        600
      );
      return;
    }

    const lats = mappableSearchResults.map((r) => r.latitude);
    const lngs = mappableSearchResults.map((r) => r.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    mapRef.current.animateToRegion(
      {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.05),
        longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.05),
      },
      600
    );
  }, [mappableSearchResults]);

  useEffect(() => {
    let isMounted = true;

    async function loadUserLocationACB() {
      try {
        setIsLoadingLocation(true);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          if (isMounted) setPermissionDenied(true);
          return;
        }

        const position = await Location.getLastKnownPositionAsync();
        if (!isMounted) return;

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(coords);

        requestAnimationFrame(() => {
          mapRef.current?.animateToRegion(
            { ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 },
            800
          );
        });
      } catch (_error) {
      } finally {
        if (isMounted) setIsLoadingLocation(false);
      }
    }

    loadUserLocationACB();
    return () => { isMounted = false; };
  }, []);

  const initialRegion = userLocation
    ? { ...userLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : fallbackRegion;

  return (
    <View style={styles.container}>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
      >
        {userLocation ? (
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="#2563eb"
          />
        ) : null}

        {mappableAttractions.map(function renderAttractionMarkerACB(attraction) {
          return (
            <Marker
              key={`attraction-${String(attraction.id ?? attraction.name)}`}
              coordinate={{ latitude: attraction.latitude, longitude: attraction.longitude }}
              title={attraction.name}
              description={attraction.location || ""}
              onPress={function onMarkerPressACB() {
                onSelectAttraction?.(attraction);
              }}
            />
          );
        })}

        {mappableSearchResults.map(function renderSearchMarkerACB(result) {
          const key = String(result.id ?? result.name);
          return (
            <Marker
              key={`search-${key}`}
              ref={function setMarkerRefACB(ref) { searchMarkerRefs.current[key] = ref; }}
              coordinate={{ latitude: result.latitude, longitude: result.longitude }}
              title={result.name}
              description={result.location || ""}
              pinColor="#0ea5e9"
              onPress={function onSearchMarkerPressACB() {
                onSelectAttraction?.(result);
              }}
            />
          );
        })}
      </MapView>

      {isLoadingLocation ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" color="#111827" />
          <Text style={styles.overlayText}>Finding your location…</Text>
        </View>
      ) : null}

      {permissionDenied ? (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            Location permission was denied, so the map is centered on attractions
            instead.
          </Text>
        </View>
      ) : null}

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
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: 420,
  },
  overlay: {
    position: "absolute",
    top: 64,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  overlayText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },
  permissionBanner: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(17,24,39,0.88)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  permissionText: {
    color: "#ffffff",
    fontSize: 13,
    textAlign: "center",
  },
  resultsBadge: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  resultsBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
