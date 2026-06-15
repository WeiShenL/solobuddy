const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export async function searchPlacesByTextACB(query, lat, lng) {
  const body = {
    textQuery: query,
    maxResultCount: 20,
  };

  if (lat != null && lng != null) {
    body.locationBias = {
      circle: { center: { latitude: lat, longitude: lng }, radius: 50000 },
    };
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.photos",
          "places.primaryTypeDisplayName",
        ].join(","),
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) throw new Error("Failed to search places");

  const data = await response.json();
  const places = data.places ?? [];

  const imageUrls = await Promise.all(
    places.map((place) => fetchPhotoUrlACB(place.photos?.[0]?.name))
  );

  return places.map((place, i) => normalizePlaceACB(place, imageUrls[i]));
}

async function fetchPhotoUrlACB(photoName) {
  if (!photoName) return null;
  const url =
    `https://places.googleapis.com/v1/${photoName}/media` +
    `?maxWidthPx=800&skipHttpRedirect=true&key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data.photoUri ?? null;
}

export async function fetchPlaceDetailsACB(placeId) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": [
          "editorialSummary",
          "formattedAddress",
          "nationalPhoneNumber",
          "websiteUri",
          "googleMapsUri",
          "rating",
          "userRatingCount",
          "currentOpeningHours",
          "regularOpeningHours",
        ].join(","),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch place details");
  }

  return response.json();
}

function normalizePlaceACB(place, imageUrl) {
  return {
    id: place.id,
    name: place.displayName?.text ?? "Unknown",
    location: place.formattedAddress ?? "",
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    userRating: place.rating ?? null,
    imageUrl,
    shortDescription: place.primaryTypeDisplayName?.text ?? "",
  };
}

export async function fetchAttractionsACB(latitude, longitude) {
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.photos",
          "places.primaryTypeDisplayName",
        ].join(","),
      },
      body: JSON.stringify({
        includedTypes: ["tourist_attraction", "museum", "park"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: 5000,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch nearby places");
  }

  const data = await response.json();
  const places = data.places ?? [];

  const imageUrls = await Promise.all(
    places.map((place) => fetchPhotoUrlACB(place.photos?.[0]?.name))
  );

  return places.map((place, i) => normalizePlaceACB(place, imageUrls[i]));
}
