import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseModel.js";

// Was a live fetch to gov.uk on every page load 
// However i swapped for a Firestore read of a monthly-refreshed cache 
// (see cloud-functions/refreshAdvisories)
// to stop every visitor from re-triggering the live API.
export async function fetchUKAdvisoryACB(countrySlug) {
  const snapshot = await getDoc(doc(db, "advisories_uk", countrySlug));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    countryName: data.details?.country?.name || countrySlug,
    alertStatus: data.details?.alert_status || [],
    updatedAt: data.updated_at || null,
    webUrl: `https://www.gov.uk/foreign-travel-advice/${countrySlug}`,
  };
}
