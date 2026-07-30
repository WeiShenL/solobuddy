// thin wrapper around expo-location so the rest of the app never imports it directly.
// the model orchestrates these; presenters read the resulting state off the model.
import * as Location from "expo-location";
import { Platform } from "react-native";

// ask for permission and return the device's current coordinates
export async function getDeviceLocationACB() {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error("Location permission denied");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

// reverse geocode coordinates into { city, country } (either may be null)
export async function reverseGeocodeACB(latitude, longitude) {
  if (Platform.OS === "web") {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await res.json();
      const addr = data?.address || {};
      const country = addr.country || null;
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.state || country;
      return { city, country };
    } catch (err) {
      console.warn("[locationService] Nominatim web reverse geocode failed:", err);
      return { city: null, country: null };
    }
  }

  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
  return {
    city: place?.city ?? null,
    country: place?.country ?? null,
  };
}
