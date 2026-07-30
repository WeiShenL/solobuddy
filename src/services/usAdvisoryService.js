import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseModel.js";

export function isSafeHttpUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Was a live fetch through a rate-limited third-party proxy holding a
// hardcoded key — swapped for a Firestore read of a monthly-refreshed
// cache (see cloud-functions/refreshAdvisories) to stop every visitor from
// re-triggering the live API and to drop the exposed proxy key entirely.
export async function fetchUSAdvisoryACB(countryId) {
  const snapshot = await getDoc(doc(db, "advisories_us", countryId));
  if (!snapshot.exists()) return null;
  // Firestore documents can't store a bare array at the root, so the cloud
  // function wraps the original single-country array as { entries: [...] }.
  const data = snapshot.data().entries;

  const entry = Array.isArray(data) ? data[0] : data;
  if (!entry?.Title) return null;

  const level = Number(entry.Title.match(/Level (\d)/)?.[1]) || null;
  const levelLabel = entry.Title.match(/Level \d+:\s*(.+)/)?.[1]?.trim() || null;

  const webUrl = entry.Link && isSafeHttpUrl(entry.Link) ? entry.Link : null;
  return { level, levelLabel, updatedAt: entry.Updated || null, webUrl };
}
