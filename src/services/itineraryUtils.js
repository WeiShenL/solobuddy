// pure routing helpers for the itinerary, no network calls here

const EARTH_RADIUS_KM = 6371;
const DEFAULT_STOPS_PER_DAY = 3;
const DAY_START_MINUTES = 9 * 60;
const AVG_TRAVEL_SPEED_KMH = 20;
const MIN_TRAVEL_MINUTES = 15;
const DEFAULT_DURATION_MINUTES = 60;

export function hasCoordinates(item) {
  return Number.isFinite(item?.lat) && Number.isFinite(item?.lng);
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// haversine = straight line distance, not real travel distance but good enough to order stops
export function distanceKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function routeLengthKm(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += distanceKm(route[i - 1], route[i]);
  }
  return total;
}

// greedy: from the start, always walk to the closest unvisited stop
function nearestNeighbourRoute(items, startIdx) {
  const unvisited = items.slice();
  const route = unvisited.splice(startIdx, 1);
  while (unvisited.length > 0) {
    const current = route[route.length - 1];
    let closestIdx = 0;
    let closestKm = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const km = distanceKm(current, unvisited[i]);
      if (km < closestKm) {
        closestKm = km;
        closestIdx = i;
      }
    }
    route.push(unvisited.splice(closestIdx, 1)[0]);
  }
  return route;
}

// greedy result depends on the start, so try every start and keep the shortest route
export function bestNearestNeighbourRoute(items) {
  if (items.length <= 2) return items.slice();
  let bestRoute = null;
  let bestKm = Infinity;
  for (let start = 0; start < items.length; start++) {
    const route = nearestNeighbourRoute(items, start);
    const km = routeLengthKm(route);
    if (km < bestKm) {
      bestKm = km;
      bestRoute = route;
    }
  }
  return bestRoute;
}

// legKms[i] = km from stop i-1 to stop i (0 for the first stop)
export function legDistancesKm(route) {
  return route.map(function legACB(stop, i) {
    return i === 0 ? 0 : distanceKm(route[i - 1], stop);
  });
}

// AI picks the day sizes; they must cover every stop in order, else fall back to 3 per day
export function resolveDaySizes(daySizes, stopCount) {
  const valid =
    Array.isArray(daySizes) &&
    daySizes.length > 0 &&
    daySizes.every(function isPositiveIntACB(n) {
      return Number.isInteger(n) && n > 0;
    }) &&
    daySizes.reduce(function sumACB(a, b) { return a + b; }, 0) === stopCount;
  if (valid) return daySizes;

  const sizes = [];
  for (let remaining = stopCount; remaining > 0; remaining -= DEFAULT_STOPS_PER_DAY) {
    sizes.push(Math.min(DEFAULT_STOPS_PER_DAY, remaining));
  }
  return sizes;
}

const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

// AI sometimes writes "9:30"; pad it so the UI always shows HH:MM
export function normaliseTime(time) {
  if (typeof time !== "string" || !TIME_PATTERN.test(time.trim())) return null;
  return time.trim().padStart(5, "0");
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const clamped = Math.min(minutes, 23 * 60 + 59);
  const h = String(Math.floor(clamped / 60)).padStart(2, "0");
  const m = String(clamped % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// AI times are kept only if every one is a valid time and each stop starts after the previous visit ends
export function isValidDaySchedule(stops) {
  for (let i = 0; i < stops.length; i++) {
    if (!normaliseTime(stops[i].time)) return false;
    if (i > 0) {
      const previousEnd = timeToMinutes(stops[i - 1].time) + normaliseDuration(stops[i - 1].durationMinutes);
      if (timeToMinutes(stops[i].time) < previousEnd) return false;
    }
  }
  return true;
}

export function normaliseDuration(minutes) {
  return Number.isInteger(minutes) && minutes > 0 ? minutes : DEFAULT_DURATION_MINUTES;
}

function estimateTravelMinutes(km) {
  const raw = (km / AVG_TRAVEL_SPEED_KMH) * 60;
  return Math.max(MIN_TRAVEL_MINUTES, Math.ceil(raw / 5) * 5);
}

// fallback when AI times are broken: start 09:00, add duration + estimated travel
export function computeDayTimes(stops, legKms) {
  let clock = DAY_START_MINUTES;
  return stops.map(function timeStopACB(stop, i) {
    if (i > 0) {
      clock += normaliseDuration(stops[i - 1].durationMinutes) + estimateTravelMinutes(legKms[i]);
    }
    return minutesToTime(clock);
  });
}
