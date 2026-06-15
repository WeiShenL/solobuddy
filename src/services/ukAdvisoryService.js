export async function fetchUKAdvisoryACB(countrySlug) {
  const response = await fetch(
    `https://www.gov.uk/api/content/foreign-travel-advice/${countrySlug}`
  );
  if (!response.ok) return null;
  const data = await response.json();
  return {
    countryName: data.details?.country?.name || countrySlug,
    alertStatus: data.details?.alert_status || [],
    updatedAt: data.updated_at || null,
    webUrl: `https://www.gov.uk/foreign-travel-advice/${countrySlug}`,
  };
}
