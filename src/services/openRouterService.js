const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
// if need chnge model; that's sickkkk
const MODEL = "openai/gpt-oss-120b:free";

export async function generateItineraryACB(items) {
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

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      // this might increase time though
    }),
  });

  console.log("OpenRouter response status:", response.status);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  // only get the useful reply, drop everythign else
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned no content");
  }

  console.log("OpenRouter content:", content.slice(0, 500));
  return JSON.parse(content);
}
