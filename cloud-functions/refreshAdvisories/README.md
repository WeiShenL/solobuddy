# refreshAdvisories — deploy via Cloud Console (no CLI)

Fetches UK (gov.uk) and US (State Dept) travel advisories for every country
and caches them in Firestore, so the app never calls those APIs live from a
visitor's device again. Run once a month via Cloud Scheduler.

Firestore already backs this app (`src/firebaseModel.js`), so this uses the
**same Firebase project** — no new project needed.

## 1. Deploy the function

1. Go to [console.cloud.google.com/functions](https://console.cloud.google.com/functions), make sure the project selector (top bar) is set to your Firebase project.
2. **Create Function** → **2nd gen**.
3. Basics:
   - **Function name**: `refreshAdvisories`
   - **Region**: pick the same region your Firestore database uses (Firestore → your DB → check the region shown there).
   - **Trigger type**: HTTPS
   - **Authentication**: **Require authentication** (keep it off-limits to the public internet — Cloud Scheduler will call it with a token, see step 2).
4. **Runtime, build, connections and security settings** (expand this):
   - **Runtime**: Node.js 20
   - **Timeout**: raise to `540` seconds (226+ sequential external calls take a couple of minutes — the default 60s will cut it off).
   - **Memory**: default (256MiB) is fine.
   - **Runtime environment variables**: add `REFRESH_SECRET` = any random string you make up (e.g. generate one with `openssl rand -hex 16` locally). This is a second layer of protection on top of "require authentication" — the function checks this itself, see `index.js`.
5. **Source**: choose **Inline editor**.
   - Set **Entry point** to `refreshAdvisories`.
   - Replace the generated `index.js` content with the content of `index.js` in this folder.
   - Replace the generated `package.json` content with the content of `package.json` in this folder.
6. **Deploy**. First deploy takes a couple of minutes.
7. Once deployed, copy the function's **URL** (shown on the function's detail page, "Trigger" tab) — you'll need it in step 2.

The function's service account (shown on the function's detail page, "Details" tab → usually `<project-id>@appspot.gserviceaccount.com`) needs Firestore write access — on most Firebase projects this default service account already has the `Editor` role project-wide, which covers it. If writes fail with a permission error in the logs, grant that service account the **Cloud Datastore User** (or **Firebase Admin**) IAM role via IAM & Admin → grant access.

## 2. Schedule it monthly with Cloud Scheduler

1. Go to [console.cloud.google.com/cloudscheduler](https://console.cloud.google.com/cloudscheduler).
2. **Create Job**.
3. Basics:
   - **Name**: `refresh-advisories-monthly`
   - **Region**: same region as the function.
   - **Frequency** (cron): `0 3 1 * *` (03:00 UTC on the 1st of every month — adjust as you like).
   - **Timezone**: your choice, doesn't matter much for a monthly job.
4. **Target**:
   - **Target type**: HTTP
   - **URL**: the function URL from step 1.7, with `?secret=<the REFRESH_SECRET you set>` appended, e.g. `https://REGION-PROJECT.cloudfunctions.net/refreshAdvisories?secret=abc123...`
   - **HTTP method**: GET
   - **Auth header**: **Add OIDC token**
     - **Service account**: use the same one the function runs as (App Engine default service account, or create a dedicated one — either works as long as it has the Cloud Functions Invoker role, which Cloud Scheduler will offer to grant automatically when you pick it).
5. **Create**. Use the **"Force run"** button on the job's page to test it immediately rather than waiting a month.

## 3. Verify it worked

- Function logs: the function's **Logs** tab should show `Advisory refresh complete` with written/failed counts for both `uk` and `us`.
- Firestore data: [console.firebase.google.com](https://console.firebase.google.com) → Firestore Database → you should see new top-level collections `advisories_uk` (~226 docs, one per country slug) and `advisories_us` (~211 docs, one per 2-letter country code).

## 4. Firestore security rules

The client reads these collections **without signing in** (advisory data isn't
user-specific), but only the Cloud Function should ever write to them. Add
this to your Firestore Rules (Firebase Console → Firestore Database → Rules):

```
match /advisories_uk/{slug} {
  allow read: if true;
  allow write: if false; // only written by the refreshAdvisories Cloud Function via the Admin SDK, which bypasses rules entirely
}
match /advisories_us/{id} {
  allow read: if true;
  allow write: if false;
}
```

(The Admin SDK the Cloud Function uses always bypasses security rules, so
`allow write: if false` only blocks *client* writes — it doesn't block the
scheduled refresh.)
