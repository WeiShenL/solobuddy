// thin wrapper around expo-location so the rest of the app never imports it directly.
// the model orchestrates these; presenters read the resulting state off the model.
import * as Location from "expo-location";

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
  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
  return {
    city: place?.city ?? null,
    country: place?.country ?? null,
  };
}
