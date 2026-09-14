import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseModel.js";

// tips are about the place not the user, so one shared doc per Google place id
// every user reuses them instead of asking the LLM again
const TIPS_COLLECTION = "attraction_tips";
const TIP_TTL_MS = 90 * 24 * 60 * 60 * 1000;

// returns { [placeId]: tip } for fresh cache hits only, missing/stale ids are left out
export async function fetchCachedTipsACB(items) {
  const snapshots = await Promise.all(
    items.map(function readTipACB(item) {
      return getDoc(doc(db, TIPS_COLLECTION, item.id));
    })
  );

  const tips = {};
  snapshots.forEach(function collectTipACB(snapshot, i) {
    if (!snapshot.exists()) return;
    const data = snapshot.data();
    const createdMs = data.createdAt?.toMillis?.();
    const fresh = createdMs != null && Date.now() - createdMs < TIP_TTL_MS;
    if (fresh && typeof data.tip === "string" && data.tip.trim()) {
      tips[items[i].id] = data.tip;
    }
  });
  return tips;
}

export function saveTipsACB(entries) {
  return Promise.all(
    entries.map(function writeTipACB({ id, name, tip }) {
      return setDoc(doc(db, TIPS_COLLECTION, id), {
        name,
        tip,
        createdAt: serverTimestamp(),
      });
    })
  );
}
