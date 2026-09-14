import {
  hasCoordinates,
  bestNearestNeighbourRoute,
  legDistancesKm,
  resolveDaySizes,
  isValidDaySchedule,
  normaliseDuration,
  normaliseTime,
  computeDayTimes,
} from "./itineraryUtils.js";
import { fetchCachedTipsACB, saveTipsACB } from "./tipCacheService.js";
import { callOpenRouterACB } from "./openRouterService.js";

// matches the attraction_tips size limit in firestore.rules
const MAX_TIP_LENGTH = 2000;

// hybrid flow: code orders the route + reuses cached tips, LLM only does the creative glue
export async function generateItineraryACB(items) {
  // coords come from Places so this should basically never happen, but if it does let the LLM do everything
  if (!items.every(hasCoordinates)) {
    console.log("[Itinerary] missing coordinates, using full LLM itinerary");
    return generateFullItineraryACB(items);
  }

  const route = bestNearestNeighbourRoute(items);
  const legKms = legDistancesKm(route);

  let cachedTips = {};
  try {
    cachedTips = await fetchCachedTipsACB(route);
  } catch (error) {
    // cache is only an optimisation, a failed read just means every tip is generated
    console.warn("[TipCache] read failed:", error);
  }
  const needsTip = route.filter(function isMissACB(item) {
    return !cachedTips[item.id];
  });
  console.log("[TipCache] hits:", route.length - needsTip.length, "misses:", needsTip.length);

  const aiPlan = await callOpenRouterACB(buildPlanPrompt(route, legKms, cachedTips));
  if (!Array.isArray(aiPlan?.days) || aiPlan.days.length === 0) {
    // make the silent fallback visible: without days there is no AI split, order, times or themes
    console.warn("[Itinerary] AI plan unusable (no days), using default split and computed times");
  }
  const aiStops = indexAiStops(aiPlan);
  const itinerary = mergeItinerary(route, cachedTips, aiPlan, aiStops);

  const newTips = needsTip
    .map(function newTipACB(item) {
      return { id: item.id, name: item.name, tip: aiStops.get(item.id)?.stop.tip };
    })
    .filter(function hasTipACB(entry) {
      return typeof entry.tip === "string" && entry.tip.trim() && entry.tip.length <= MAX_TIP_LENGTH;
    });
  if (newTips.length > 0) {
    // fire and forget, a failed cache write should never break the itinerary
    saveTipsACB(newTips).catch(function logWriteErrorACB(error) {
      console.warn("[TipCache] write failed:", error);
    });
  }

  return itinerary;
}

function buildPlanPrompt(route, legKms, cachedTips) {
  const anyTipsNeeded = route.some(function isMissACB(item) {
    return !cachedTips[item.id];
  });

  // names, ids, place type and leg distances; cached tips are sent so the schedule doesn't contradict them,
  // location only when the LLM has to write a new tip
  const stopLines = route.map(function stopLineACB(item, i) {
    let line = `${i + 1}. ${item.name} (id: ${item.id})`;
    if (item.description) line += ` - ${item.description}`;
    if (i > 0) line += `, ${legKms[i].toFixed(1)} km from previous`;
    if (cachedTips[item.id]) line += `, tip: ${JSON.stringify(cachedTips[item.id])}`;
    else line += ` [needs tip; location: ${item.location}]`;
    return line;
  });

  const rules = [
    "Split the stops into days using consecutive runs of this list (e.g. stops 1-3 on day 1, 4-6 on day 2). " +
      "Do not move a stop to a different day, and do not add or remove stops.",
    "Within a day you may reorder stops when it makes the day better, e.g. a food place at lunch or dinner time, " +
      "or a viewpoint near sunset. List each day's stops in the order they should be visited.",
    "Pace days realistically: roughly 09:00 to 18:00 (later is fine for nightlife or night views), leave time for lunch, " +
      "and avoid a day with only one short stop.",
    "For every stop give durationMinutes realistic for that kind of place (e.g. a large museum 150-180, " +
      "a landmark photo stop 30-45) and a start time in HH:MM rounded to the nearest 15 minutes, increasing within the day " +
      "and allowing for the visit and travel between stops (distances are from the previous stop in this list).",
    "Keep the schedule consistent with each stop's existing tip (e.g. if a tip says go at sunset, schedule it near sunset).",
    anyTipsNeeded
      ? "Only for stops marked [needs tip], write a few sentences practical tip about the place in general " +
        "(it is reused for other travellers, so do not refer to this itinerary). " +
        "Avoid specifics you are not sure of, like stall numbers, exact prices or opening hours. Omit tip for all other stops."
      : "Do not include tips.",
    "Use the provided id verbatim as attractionId.",
  ];

  return (
    "Plan a day-by-day solo-travel itinerary. The stops below are listed in a suggested travel order " +
    "(each is near the previous one).\n\n" +
    "Rules:\n" +
    rules.map(function ruleLineACB(rule) { return `- ${rule}`; }).join("\n") +
    "\n\nReturn ONLY valid JSON (no markdown, no prose) matching this exact shape:\n" +
    "{\n" +
    "  \"summary\": \"string overview\",\n" +
    "  \"days\": [\n" +
    "    {\n" +
    "      \"theme\": \"string theme\",\n" +
    "      \"stops\": [\n" +
    "        { \"attractionId\": \"id-from-input\", \"time\": \"HH:MM\", \"durationMinutes\": <minutes>, \"tip\": \"only if needed\" }\n" +
    "      ]\n" +
    "    }\n" +
    "  ]\n" +
    "}\n\n" +
    "Stops:\n" +
    stopLines.join("\n")
  );
}

// id -> { stop, position } where position is the stop's place in the AI's overall visiting order (first one wins)
function indexAiStops(aiPlan) {
  const index = new Map();
  let position = 0;
  for (const day of Array.isArray(aiPlan?.days) ? aiPlan.days : []) {
    for (const stop of Array.isArray(day?.stops) ? day.stops : []) {
      if (typeof stop?.attractionId === "string" && !index.has(stop.attractionId)) {
        index.set(stop.attractionId, { stop, position });
      }
      position++;
    }
  }
  return index;
}

// within a day follow the AI's visiting order, but only if it returned every stop of that day
function orderDayStops(dayItems, aiStops) {
  const allReturned = dayItems.every(function isReturnedACB(item) {
    return aiStops.has(item.id);
  });
  if (!allReturned) return dayItems;
  return dayItems.slice().sort(function byAiPositionACB(a, b) {
    return aiStops.get(a.id).position - aiStops.get(b.id).position;
  });
}

// code decides which stops share a day (consecutive runs of the route) and which ids exist;
// the AI fills in the day split, order within a day, themes, times, durations and new tips
function mergeItinerary(route, cachedTips, aiPlan, aiStops) {
  const aiDays = Array.isArray(aiPlan?.days) ? aiPlan.days : [];
  const daySizes = resolveDaySizes(
    aiDays.map(function daySizeACB(day) {
      return Array.isArray(day?.stops) ? day.stops.length : 0;
    }),
    route.length
  );

  const days = [];
  let offset = 0;
  daySizes.forEach(function buildDayACB(size, dayIdx) {
    const dayItems = orderDayStops(route.slice(offset, offset + size), aiStops);
    offset += size;

    const stops = dayItems.map(function buildStopACB(item) {
      const aiStop = aiStops.get(item.id)?.stop;
      return {
        attractionId: item.id,
        name: item.name,
        time: normaliseTime(aiStop?.time),
        durationMinutes: normaliseDuration(aiStop?.durationMinutes),
        tip: cachedTips[item.id] || (typeof aiStop?.tip === "string" ? aiStop.tip : ""),
      };
    });

    if (!isValidDaySchedule(stops)) {
      console.log("[Itinerary] AI times invalid for day", dayIdx + 1, "- computing them in code");
      // distances follow the final (possibly reordered) visiting order
      const times = computeDayTimes(stops, legDistancesKm(dayItems));
      stops.forEach(function applyTimeACB(stop, i) {
        stop.time = times[i];
      });
    }

    days.push({
      day: dayIdx + 1,
      theme: typeof aiDays[dayIdx]?.theme === "string" ? aiDays[dayIdx].theme : "",
      stops,
    });
  });

  return { summary: typeof aiPlan?.summary === "string" ? aiPlan.summary : "", days };
}

// original all-in-one prompt, kept as the fallback when stops have no coordinates
async function generateFullItineraryACB(items) {
  // i remove the imageURL and description and visited to save tokens. each attraction one item in content list
  const compact = items.map(function compactItemACB(item) {
    return {
      id: item.id,
      name: item.name,
      location: item.location,
      lat: item.lat,
      lng: item.lng,
      rating: item.userRating,
    };
  });

  // tweak prompt
  const prompt =
    "Build a day-by-day solo-travel itinerary from these attractions. " +
    "Cluster by geographic proximity. Order each day to minimise travel time. " +
    "Add a few sentences practical tip per stop. " +
    "Use the provided id verbatim as attractionId for each stop.\n\n" +
    "Return ONLY valid JSON (no markdown, no prose) matching this exact shape:\n" +
    "{\n" +
    "  \"summary\": \"string overview\",\n" +
    "  \"days\": [\n" +
    "    {\n" +
    "      \"day\": 1,\n" +
    "      \"theme\": \"string theme\",\n" +
    "      \"stops\": [\n" +
    "        {\n" +
    "          \"attractionId\": \"id-from-input\",\n" +
    "          \"name\": \"attraction name\",\n" +
    "          \"time\": \"HH:MM\",\n" +
    "          \"durationMinutes\": 60,\n" +
    "          \"tip\": \"few sentences tip\"\n" +
    "        }\n" +
    "      ]\n" +
    "    }\n" +
    "  ]\n" +
    "}\n\n" +
    "Attractions:\n" +
    JSON.stringify(compact, null, 2);

  console.log("[OpenRouter] sending", compact.length, "attractions");
  return callOpenRouterACB(prompt);
}
