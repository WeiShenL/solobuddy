import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { AttractionCard } from "./attractionCard";
import { AttractionsMap } from "./attractionsMap";
import { AttractionDetailsModal } from "./attractionDetailsModal";

import styles from "./homeView.styles.js";

export function HomeView(props) {
  // added some variables to use for attraction card animation
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [listWidth, setListWidth] = useState(Dimensions.get("window").width);
  const [attractionModalVisible, setAttractionModalVisible] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [focusedSearchResult, setFocusedSearchResult] = useState(null);
  const [showResultsList, setShowResultsList] = useState(true);

  const baseAttractions = props.attractions || [];
  const shouldLoop = baseAttractions.length > 1;

  const loopedAttractions = useMemo(function buildLoopedAttractionsACB() {
    if (!shouldLoop) {
      return baseAttractions;
    }

    return [
      baseAttractions[baseAttractions.length - 1],
      ...baseAttractions,
      baseAttractions[0],
    ];
  }, [baseAttractions, shouldLoop]);

  const cardWidth = Math.min(listWidth * 0.72, 320);
  const spacing = 14;
  const fullWidth = cardWidth + spacing;
  const sideSpacing = Math.max((listWidth - cardWidth) / 2 - spacing / 2, 16);

  useEffect(
    function syncCarouselPositionACB() {
      if (!shouldLoop) {
        return;
      }

      const frameId = requestAnimationFrame(function scrollToFirstRealCardACB() {
        flatListRef.current?.scrollToIndex({
          index: 1,
          animated: false,
        });
      });

      return function cleanupCarouselACB() {
        cancelAnimationFrame(frameId);
      };
    },
    [shouldLoop, listWidth, loopedAttractions.length]
  );

  function userWantsToSeeMoreACB(attraction) {
    props.onSeeMoreAttraction?.(attraction);
    setAttractionModalVisible(true);
  }

  function closeAttractionModalACB() {
    setAttractionModalVisible(false);
    props.onCloseAttractionDetails?.();
  }

  function renderAttractionRowACB({ item, index }) {
    const inputRange = [
      (index - 1) * fullWidth,
      index * fullWidth,
      (index + 1) * fullWidth,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1, 0.88],
      extrapolate: "clamp",
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [10, 0, 10],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            width: cardWidth,
            marginRight: spacing,
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <AttractionCard
          attraction={item}
          onSeeMore={function onSeeMorePressACB() {
            userWantsToSeeMoreACB(item);
          }}
          cardWidth={cardWidth}
        />
      </Animated.View>
    );
  }

  // added a function to make the sliding smoother
  function handleCarouselMomentumEndACB(event) {
    if (!shouldLoop) {
      return;
    }

    const offsetX = event.nativeEvent.contentOffset.x;
    const snappedIndex = Math.round(offsetX / fullWidth);

    if (snappedIndex === 0) {
      flatListRef.current?.scrollToIndex({
        index: baseAttractions.length,
        animated: false,
      });
      return;
    }

    if (snappedIndex === loopedAttractions.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: 1,
        animated: false,
      });
    }
  }

  function keyExtractorACB(item, index) {
    return `${item.id ?? "item"}-${index}`;
  }

  // added a new ACB for timeout clearing because it's reused several times in different ACBs anyway
  function clearSearchTimeoutACB() {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }

  function handleMapQueryChangeACB(text) {
    setMapQuery(text);
    setFocusedSearchResult(null);
    setShowResultsList(true);

    clearSearchTimeoutACB();

    if (!text.trim()) {
      props.onClearSearch?.();
      return;
    }

    searchTimeoutRef.current = setTimeout(function performSearchACB() {
      props.onSearchPlaces?.(text.trim());
    }, 300);
  }

  function handleMapSearchSubmitACB() {
    clearSearchTimeoutACB();
    if (mapQuery.trim()) props.onSearchPlaces?.(mapQuery);
  }

  function handleMapClearACB() {
    clearSearchTimeoutACB();
    setMapQuery("");
    props.onClearSearch?.();
  }

  useEffect(function cleanupSearchTimerACB() {
    return function cleanupACB() {
      clearSearchTimeoutACB();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          <View style={styles.mapSearchBar}>
            <TextInput
              style={styles.mapSearchInput}
              placeholder="Search places..."
              placeholderTextColor="#9ca3af"
              value={mapQuery}
              onChangeText={handleMapQueryChangeACB}
              onSubmitEditing={handleMapSearchSubmitACB}
              returnKeyType="search"
            />
            {props.mapSearchLoading ? (
              <ActivityIndicator size="small" color="#111827" style={styles.mapSearchIcon} />
            ) : mapQuery.length > 0 ? (
              <Pressable onPress={handleMapClearACB} style={styles.mapSearchIcon}>
                <Text style={styles.mapSearchClearText}>✕</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleMapSearchSubmitACB} style={styles.mapSearchIcon}>
                <Text style={styles.mapSearchIconText}>🔍</Text>
              </Pressable>
            )}
          </View>

          {props.mapSearchResults?.length > 0 && showResultsList ? (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>
                {props.mapSearchResults.length} result{props.mapSearchResults.length !== 1 ? "s" : ""}
              </Text>
              {props.mapSearchResults.map((result, index) => (
                <View
                  key={`search-result-${index}-${String(result.id ?? result.name)}`}
                  style={styles.searchResultItem}
                >
                  <Pressable
                    style={styles.searchResultInfo}
                    onPress={function onPressSearchResultACB() {
                      setFocusedSearchResult(result);
                    }}
                  >
                    <Text style={styles.searchResultName}>{result.name}</Text>
                    {result.location ? (
                      <Text style={styles.searchResultLocation}>{result.location}</Text>
                    ) : null}
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.searchResultSeeMore, pressed && { opacity: 0.7 }]}
                    onPress={function onSeeMoreACB() { userWantsToSeeMoreACB(result); }}
                  >
                    <Text style={styles.searchResultSeeMoreText}>See More</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.mapSection}>
            <AttractionsMap
              attractions={baseAttractions}
              currentAttraction={props.currentAttraction}
              onSelectAttraction={userWantsToSeeMoreACB}
              searchResults={props.mapSearchResults || []}
              focusedSearchResult={focusedSearchResult}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Attractions</Text>

        <View
          style={styles.carouselContainer}
          onLayout={function onCarouselLayoutACB(event) {
            setListWidth(event.nativeEvent.layout.width);
          }}
        >
          <Animated.FlatList
            ref={flatListRef}
            data={loopedAttractions}
            keyExtractor={keyExtractorACB}
            renderItem={renderAttractionRowACB}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: sideSpacing }}
            snapToInterval={fullWidth}
            decelerationRate="fast"
            bounces={false}
            onMomentumScrollEnd={handleCarouselMomentumEndACB}
            scrollEventThrottle={16}
            getItemLayout={function getItemLayoutACB(_data, index) {
              return {
                length: fullWidth,
                offset: fullWidth * index,
                index,
              };
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
          />
        </View>

      </ScrollView>

      <AttractionDetailsModal
        visible={attractionModalVisible}
        onClose={closeAttractionModalACB}
        attraction={props.currentAttraction}
        placeDetails={props.placeDetails}
        loading={props.placeDetailsLoading}
        onAddToWishlist={props.onAddToWishlist}
      />
    </View>
  );
}

// lots and lots of styling...maybe need to move it to a separate file
// okay i moved them to a separate file