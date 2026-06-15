import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { SafetyView } from "../native-views/safetyView.jsx";
import { getUSAdvisoryId } from "../services/usAdvisoryCountryMap.js";

const SafetyPresenter = observer(function SafetyPresenter(props) {
  const model = props.model;

  async function userWantsToRefreshWeatherACB() {
    const location = await model.resolveLocation();
    model.fetchWeatherBanner(location.latitude, location.longitude);
  }

  async function userWantsToOpenWeatherDetailsACB() {
    try {
      const location = await model.resolveLocation();
      model.fetchWeatherDetails(location.latitude, location.longitude);
    } catch (error) {
      console.error("Failed to load weather details:", error);
    }
  }
  // TODO: this alert might not be needed? or can change a bit
  async function userWantsToRefreshSafetyAlertsACB() {
    model.setLoading?.(true);
    try {
      if (!model.weatherBannerPromiseState.data) {
        await userWantsToRefreshWeatherACB();
      }
      model.updateWeatherAlerts();
    } catch (error) {
      console.error("Failed to refresh safety alerts:", error);
      model.setWeatherAlerts?.([
        {
          event: "Safety alerts unavailable",
          description:
            error.message === "Location permission denied"
              ? "Enable location permission to check alerts for your current area."
              : "We could not load local safety alerts right now.",
        },
      ]);
    } finally {
      model.setLoading?.(false);
    }
  }

  async function userWantsToRefreshNewsACB() {
    try {
      // ensure the place has been resolved (news can fire on login before the
      // safety data load runs); then read city/country off the model
      if (!model.currentCity && !model.currentCountry) {
        await model.resolveLocation();
      }
      const place = [model.currentCity, model.currentCountry].filter(Boolean).join(" ") || null;
      if (!place) return;
      // change here for different query.... but search results arent rlly good tbvh
      model.fetchNews(`${place} AND (safety OR tourist)`);
    } catch (error) {
      console.error("Failed to refresh news:", error);
    }
  }

  async function loadSafetyDataACB() {
    model.setLoading?.(true);
    try {
      await userWantsToRefreshWeatherACB();
      if (!model.weatherAlerts || model.weatherAlerts.length === 0) {
        model.updateWeatherAlerts();
      }
      // TODO: some countries does not work, especially countries with >=2 words. but for now i will let it slide first..
      // country was resolved by userWantsToRefreshWeatherACB above
      const country = model.currentCountry;
      if (country) {
        const slug = country.toLowerCase().replace(/\s+/g, "-");
        model.fetchTravelAdvisory(slug);
        const usId = getUSAdvisoryId(country);
        if (usId) model.fetchUSAdvisory(usId);
      }
    } catch (error) {
      console.error("Failed to load safety data:", error);
      model.setWeatherAlerts?.([
        {
          event: "Weather unavailable",
          description:
            error.message === "Location permission denied"
              ? "Enable location permission to show weather for your current position."
              : "We could not load weather for your location right now.",
        },
      ]);
    } finally {
      model.setLoading?.(false);
    }
  }

  useEffect(function loadInitialSafetyDataACB() {
    loadSafetyDataACB();
  }, []);

  useEffect(
    function refreshNewsOnLoginACB() {
      if (model.currentUser) {
        userWantsToRefreshNewsACB();
      }
    },
    [model.currentUser]
  );

  const weatherDetailsLoading =
    !!model.weatherDetailsPromiseState.promise &&
    !model.weatherDetailsPromiseState.data &&
    !model.weatherDetailsPromiseState.error;

  return (
    <SafetyView
      usAdvisory={model.usAdvisoryPromiseState.data || null}
      travelAdvisory={model.travelAdvisoryPromiseState.data || null}
      currentWeather={
        model.weatherBannerPromiseState.data
          ? { ...model.weatherBannerPromiseState.data, ...(model.weatherDetailsPromiseState.data || {}) }
          : null
      }
      weatherAlerts={model.weatherAlerts || []}
      weatherDetailsLoading={weatherDetailsLoading}
      touristNews={model.newsPromiseState.data || []}
      loadingStatus={model.loadingStatus}
      onOpenWeatherDetails={userWantsToOpenWeatherDetailsACB}
      onRefreshSafetyAlerts={userWantsToRefreshSafetyAlertsACB}
      onRefreshNews={userWantsToRefreshNewsACB}
    />
  );
});

export default SafetyPresenter;
