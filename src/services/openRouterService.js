const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
// if need chnge model; that's sickkkk
// tried in order: OpenRouter falls back to the next one if a model errors (rate limited, down)
// all of these support JSON mode (response_format) so they reply with raw JSON
const MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

// thin HTTP client only, itinerary logic lives in itineraryService.js
export async function callOpenRouterACB(prompt) {
  const startedAt = Date.now();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      models: MODELS,
      response_format: { type: "json_object" },
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
    console.error("[OpenRouter] error body:", errorBody);
    throw new Error(`OpenRouter error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  // the model that actually answered, may be a fallback from MODELS
  console.log("OpenRouter model used:", data?.model);
  // log latency + token usage so the before/after of the hybrid flow can actually be measured
  console.log("[OpenRouter] latency ms:", Date.now() - startedAt, "usage:", data?.usage);
  // only get the useful reply, drop everythign else
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned no content");
  }

  console.log("OpenRouter content:", content.slice(0, 500));
  const parsed = JSON.parse(content);
  // some models wrap the object in an array ([{...}]) even in JSON mode, unwrap it
  if (Array.isArray(parsed) && parsed.length === 1 && parsed[0] && typeof parsed[0] === "object") {
    console.warn("[OpenRouter] reply was wrapped in an array, unwrapping it");
    return parsed[0];
  }
  return parsed;
}
