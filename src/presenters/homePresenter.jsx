import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { HomeView } from "../native-views/homeView.jsx";
import { searchPlacesByTextACB } from "../services/placesService.js";

const HomePresenter = observer(function HomePresenter(props) {
  const model = props.model;

  async function loadHomeScreenDataACB() {
    try {
      // resolves device location + city/country once on the model
      const location = await model.resolveLocation();
      model.fetchAttractions(location.latitude, location.longitude);
    } catch (error) {
      console.error("Failed to load home screen data:", error);
    }
  }

  function userWantsToSelectAttractionACB(attraction) {
    console.log("Selected attraction:", attraction?.name);
    model.setCurrentAttraction(attraction);
  }

  function userWantsToSeeMoreAttractionACB(attraction) {
    model.setCurrentAttraction(attraction);
    model.fetchPlaceDetails(attraction.id);
  }

  function userWantsToCloseAttractionDetailsACB() {
    model.clearPlaceDetails();
  }

  async function userWantsToSearchPlacesACB(query) {
    if (!query?.trim()) {
      model.clearMapSearchResults();
      return;
    }
    model.setMapSearchLoading(true);
    try {
      const location = model.currentLocation;
      const results = await searchPlacesByTextACB(
        query.trim(),
        location?.latitude ?? null,
        location?.longitude ?? null
      );
      model.setMapSearchResults(results);
    } catch (error) {
      console.error("Place search failed:", error);
      model.setMapSearchResults([]);
    } finally {
      model.setMapSearchLoading(false);
    }
  }

  function userWantsToClearSearchACB() {
    model.clearMapSearchResults();
  }

  // save attraction into the user's wishlist
  async function userWantsToAddToWishlistACB() {
    console.log("Attraction added to wishlist:", model.currentAttraction);
    await model.addToWishlist(model.currentAttraction);
  }

  useEffect(function loadInitialDataACB() {
    loadHomeScreenDataACB();
  }, []);

  const placeDetailsLoading =
    !!model.placeDetailsPromiseState.promise &&
    !model.placeDetailsPromiseState.data &&
    !model.placeDetailsPromiseState.error;

  return (
    <HomeView
      attractions={model.attractionsPromiseState.data || []}
      currentAttraction={model.currentAttraction}
      onSelectAttraction={userWantsToSelectAttractionACB}
      onSeeMoreAttraction={userWantsToSeeMoreAttractionACB}
      placeDetails={model.placeDetailsPromiseState.data}
      placeDetailsLoading={placeDetailsLoading}
      onCloseAttractionDetails={userWantsToCloseAttractionDetailsACB}
      onAddToWishlist={userWantsToAddToWishlistACB}
      mapSearchResults={model.mapSearchResults}
      mapSearchLoading={model.mapSearchLoading}
      onSearchPlaces={userWantsToSearchPlacesACB}
      onClearSearch={userWantsToClearSearchACB}
    />
  );
});

export default HomePresenter;
