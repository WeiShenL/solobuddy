// Monthly cache refresh for the two travel advisory sources used by
// src/services/ukAdvisoryService.js and src/services/usAdvisoryService.js.
//
// This is a standalone Google Cloud Function (2nd gen, HTTP trigger),
// meant to be pasted into the Cloud Console's inline source editor
// (console.cloud.google.com/functions -> Create Function -> Inline Editor)
// rather than deployed through this repo's own build. See README.md in
// this same folder for exact click-by-click deploy + scheduling steps.
//
// What it does: fetches the FULL upstream UK (gov.uk) and US (State Dept)
// travel advisory data ONCE per invocation and writes one Firestore
// document per country, in the exact same raw shape the live endpoints
// already returned. The client services then read those cached docs
// instead of calling gov.uk / State Dept directly on every page load, so
// their existing parsing logic doesn't need to change at all.
//
// Firestore layout:
//   advisories_uk/{slug}  <- raw gov.uk /api/content/foreign-travel-advice/{slug} response
//   advisories_us/{id}    <- raw single-country array from cadataapi.state.gov, e.g. [{ Title, Link, Category, Updated, ... }]
"use strict";

const crypto = require("crypto");
const functions = require("@google-cloud/functions-framework");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const UK_INDEX_URL = "https://www.gov.uk/api/content/foreign-travel-advice";
const UK_DETAIL_URL = (slug) => `https://www.gov.uk/api/content/foreign-travel-advice/${slug}`;
const US_BULK_URL = "https://cadataapi.state.gov/api/TravelAdvisories";

const REFRESH_SECRET = process.env.REFRESH_SECRET || null;

function safeCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function fetchJsonACB(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

async function refreshUKAdvisoriesACB() {
  const index = await fetchJsonACB(UK_INDEX_URL);
  const children = index?.links?.children || [];
  let written = 0;
  let failed = 0;
  for (const child of children) {
    const slug = child?.details?.country?.slug || child?.base_path?.split("/").pop();
    if (!slug) continue;
    try {
      const detail = await fetchJsonACB(UK_DETAIL_URL(slug));
      await db.collection("advisories_uk").doc(slug).set(detail);
      written += 1;
    } catch (error) {
      failed += 1;
      console.warn(`[uk] skipped "${slug}": ${error.message}`);
    }
  }
  return { total: children.length, written, failed };
}

async function refreshUSAdvisoriesACB() {
  const all = await fetchJsonACB(US_BULK_URL);
  let written = 0;
  let skipped = 0;
  for (const entry of all) {
    const id = entry?.Category?.[0];
    if (!id) {
      skipped += 1;
      continue;
    }
    // usAdvisoryService.js expects the same shape the single-country
    // endpoint returns: an array containing one entry for that country.
    await db.collection("advisories_us").doc(id).set({ entries: [entry] });
    written += 1;
  }
  return { total: all.length, written, skipped };
}

functions.http("refreshAdvisories", async (req, res) => {
  if (!REFRESH_SECRET) {
    res.status(500).json({ ok: false, error: "REFRESH_SECRET environment variable is not configured" });
    return;
  }
  const providedSecret = req.get("X-Refresh-Secret") || req.query.secret;
  if (!safeCompare(providedSecret, REFRESH_SECRET)) {
    res.status(403).json({ ok: false, error: "Forbidden" });
    return;
  }
  try {
    const uk = await refreshUKAdvisoriesACB();
    const us = await refreshUSAdvisoriesACB();
    console.log("Advisory refresh complete", { uk, us });
    res.status(200).json({ ok: true, uk, us });
  } catch (error) {
    console.error("Advisory refresh failed:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});
