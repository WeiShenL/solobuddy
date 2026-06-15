import { makeAutoObservable, configure } from "mobx";
configure({ enforceActions: "observed" });
import { resolvePromise } from "./resolvePromise.js";
import { fetchWeatherBannerACB, fetchWeatherDetailsACB, buildWeatherAlertsACB } from "./services/weatherService.js";
import { fetchAttractionsACB, fetchPlaceDetailsACB } from "./services/placesService.js";
import { fetchNewsACB } from "./services/newsService.js";
import { fetchUKAdvisoryACB } from "./services/ukAdvisoryService.js";
import { fetchUSAdvisoryACB } from "./services/usAdvisoryService.js";
import { generateItineraryACB } from "./services/openRouterService.js";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  saveUserProfile,
  uploadProfilePhoto,
  setWishlistItem,
  removeWishlistItem,
  markWishlistItemVisited,
} from "./firebaseModel.js";
import { getDeviceLocationACB, reverseGeocodeACB } from "./services/locationService.js";

class AppModel {
  // promise states for async data
  weatherBannerPromiseState = {};
  weatherDetailsPromiseState = {};
  attractionsPromiseState = {};
  placeDetailsPromiseState = {};

  // currently selected attraction
  currentAttraction = null;

  // weather alerts derived from weather data
  weatherAlerts = [];

  // news
  newsPromiseState = {};

  // travel advisory
  travelAdvisoryPromiseState = {};
  usAdvisoryPromiseState = {};

  // ai itinerary generation
  itineraryPromiseState = {};

  // auth state
  currentUser = null;
  profile = null;
  ready = false;

  // attraction wishlist
  wishlist = [];

  // community posts feed
  communityPosts = [];

  // map text-search results
  mapSearchResults = [];
  mapSearchLoading = false;

  // user's current device location { latitude, longitude } or null
  currentLocation = null;

  // reverse-geocoded place for the current location (derived once, read everywhere)
  currentCity = null;
  currentCountry = null;

  // loading state
  loadingStatus = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // --- weather ---
  fetchWeatherBanner(lat, lng) {
    resolvePromise(fetchWeatherBannerACB(lat, lng), this.weatherBannerPromiseState);
  }

  fetchWeatherDetails(lat, lng) {
    resolvePromise(fetchWeatherDetailsACB(lat, lng), this.weatherDetailsPromiseState);
  }

  // TODO: this alert might not be needed? or can change a bit
  updateWeatherAlerts() {
    const weather = this.weatherDetailsPromiseState.data || this.weatherBannerPromiseState.data;
    this.weatherAlerts = buildWeatherAlertsACB(weather);
  }

  // --- attractions ---
  fetchAttractions(lat, lng) {
    resolvePromise(fetchAttractionsACB(lat, lng), this.attractionsPromiseState);
  }

  // --- news ---
  fetchNews(query) {
    resolvePromise(fetchNewsACB(query), this.newsPromiseState);
  }

  // --- travel advisory ---
  fetchTravelAdvisory(countrySlug) {
    resolvePromise(fetchUKAdvisoryACB(countrySlug), this.travelAdvisoryPromiseState);
  }

  fetchUSAdvisory(countryId) {
    resolvePromise(fetchUSAdvisoryACB(countryId), this.usAdvisoryPromiseState);
  }

  setCurrentAttraction(attraction) {
    this.currentAttraction = attraction;
  }

  fetchPlaceDetails(placeId) {
    resolvePromise(fetchPlaceDetailsACB(placeId), this.placeDetailsPromiseState);
  }

  clearPlaceDetails() {
    this.placeDetailsPromiseState.promise = null;
    this.placeDetailsPromiseState.data = null;
    this.placeDetailsPromiseState.error = null;
  }

  // setter
  setLoading(status) {
    this.loadingStatus = status;
  }

  setWeatherAlerts(alerts) {
    this.weatherAlerts = alerts;
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  clearProfile() {
    this.profile = null;
  }

  resetUserState() {
    this.currentUser = null;
    this.profile = null;
  }

  setReady(status) {
    this.ready = status;
  }

  setCurrentLocation(location) {
    this.currentLocation = location;
  }

  setCurrentCity(city) {
    this.currentCity = city;
  }

  setCurrentCountry(country) {
    this.currentCountry = country;
  }

  // fetch fresh device location and derive its city/country in one place.
  // both the home and safety presenters call this; everyone else reads the
  // resulting currentLocation / currentCity / currentCountry off the model.
  async resolveLocation() {
    const location = await getDeviceLocationACB();
    this.setCurrentLocation(location);

    try {
      const place = await reverseGeocodeACB(location.latitude, location.longitude);
      this.setCurrentCity(place.city);
      this.setCurrentCountry(place.country);
    } catch (error) {
      console.error("Reverse geocode failed:", error);
    }

    return location;
  }

  // set wishlist to replace current items
  setWishlist(items) {
    this.wishlist = Array.isArray(items) ? items : [];
  }

  setCommunityPosts(posts) {
    this.communityPosts = Array.isArray(posts) ? posts : [];
  }

  setMapSearchResults(results) {
    this.mapSearchResults = Array.isArray(results) ? results : [];
  }

  setMapSearchLoading(status) {
    this.mapSearchLoading = status;
  }

  clearMapSearchResults() {
    this.mapSearchResults = [];
  }

  //  auth & profile actions called from firebasemodel
  async loginUser(email, password) {
    await signInWithEmail(email, password);
  }

  async registerUser(email, password, { name, birthday, phone }, avatarUri) {
    const credential = await signUpWithEmail(email, password);
    const uid = credential.user.uid;
    let avatarUrl = "";
    if (avatarUri) {
      avatarUrl = await uploadProfilePhoto(avatarUri, uid);
    }
    await saveUserProfile(uid, {
      name: name.trim(),
      email: email.trim(),
      birthday: birthday.trim(),
      phone: phone.trim(),
      avatarUrl,
    });
  }

  async saveProfile(uid, patch) {
    await saveUserProfile(uid, patch);
  }

  async uploadPhoto(uri, uid) {
    return uploadProfilePhoto(uri, uid);
  }

  async logoutUser() {
    await signOutUser();
  }

  // ai itinerary
  generateItinerary() {
    const active = (this.wishlist || []).filter(function isActiveACB(item) {
      return !item.visited;
    });
    if (active.length < 5) return;
    resolvePromise(generateItineraryACB(active), this.itineraryPromiseState);
  }

  async addToWishlist(attraction) {
    if (!this.currentUser?.uid || !attraction?.id) return;
    await setWishlistItem(this.currentUser.uid, {
      id: attraction.id,
      name: attraction.name || "Untitled",
      location: attraction.location || "",
      imageUrl: attraction.imageUrl || "",
      description: attraction.shortDescription || "",
      userRating: attraction.userRating ?? null,
      lat: attraction.latitude ?? null,
      lng: attraction.longitude ?? null,
    });
  }

  async removeFromWishlist(itemId) {
    if (!this.currentUser?.uid || !itemId) return;
    await removeWishlistItem(this.currentUser.uid, itemId);
  }

  async markVisited(itemId, visited) {
    if (!this.currentUser?.uid || !itemId) return;
    await markWishlistItemVisited(this.currentUser.uid, itemId, visited);
  }
}

export const model = new AppModel();