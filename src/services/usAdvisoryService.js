// i used proxy for this cos somehow it wont work without it. 
// But i wont be putting it inside the .env file
// TODO: move to .env
const PROXY_URL = "https://brfenergi.se/iprog/group/541/";
const PROXY_KEY = "3d2a031b4cmsh5cd4e7b939ada54p19f679jsn9a775627d767";
const PROXY_GROUP = "541";

export async function fetchUSAdvisoryACB(countryId) {
  const response = await fetch(
    `${PROXY_URL}https://cadataapi.state.gov/api/TravelAdvisories/${countryId}`,
    { headers: { "X-DH2642-Key": PROXY_KEY, "X-DH2642-Group": PROXY_GROUP } }
  );
  if (!response.ok) return null;
  const data = await response.json();
  console.log("[US advisory] raw:", JSON.stringify(data).substring(0, 300));

  const entry = Array.isArray(data) ? data[0] : data;
  if (!entry?.Title) return null;

  const level = Number(entry.Title.match(/Level (\d)/)?.[1]) || null;
  const levelLabel = entry.Title.match(/Level \d+:\s*(.+)/)?.[1]?.trim() || null;

  return { level, levelLabel, updatedAt: entry.Updated || null, webUrl: entry.Link || null };
}
