# SoloBuddy, your Travel Safety Companion

<p align="center">
  <img src="https://github.com/user-attachments/assets/525ab536-5642-4c01-88c0-26c53d024071" width="190" alt="Explore tab with map" />
<!--   <img src="URL_safety" width="240" alt="Safety advisories and news" /> -->
  <img src="https://github.com/user-attachments/assets/b4a5a080-f1e6-4620-ac7c-0d54ce424460" width="190" alt="AI-generated itinerary" />
</p>
<p align="center">
  <em>Explore</em> &nbsp;·&nbsp; <em>AI Itinerary</em>
</p>

SoloBuddy is a travel companion app built for solo travellers. It combines destination exploration (nearby attractions, maps, search), suggested itinerary creation, a community feed and a dedicated Safety tab surfacing official travel advisories, local news and real time local weather. Save places to your trip wishlist, track what you have visited, and head somewhere new with confidence.

## Try the App (Android)

Download the latest Android APK from our Expo build page:

📱 [Download APK (Android)](https://expo.dev/accounts/weishenlo/projects/solobuddy/builds/bc191881-1980-47f3-9707-a38f69bf6419)

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo Go](https://expo.dev/go) on your phone
- [Android Studio](https://developer.android.com/studio) (for Android emulator)
- [Xcode](https://developer.apple.com/xcode/) (for iOS simulator)

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/WeiShenL/solobuddy
   cd solobuddy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

Once running, press `?` to see all options, then:

| Key | Action |
|-----|--------|
| `s` | Switch to Expo Go / Development Build |
| `w` | Open in web browser |
| `a` | Open in Android emulator |
| `i` | Open in iOS simulator (macOS only) |

First, press `s` to ensure the dev server is using **Expo Go**. Then:

- **Android:** Open Android Studio and launch your preferred device emulator from the Device Manager, then press `a` in the terminal. (Tested with Pixel 10 Pro in Studio) 
- **iOS:** Press `i` in the terminal to open the iOS simulator. (Mac only) 
- **Physical phone:** Open the **Expo Go** app and scan the QR code shown in the terminal (iOS: use the Camera app; Android: use the "Scan QR code" option inside Expo Go).

> **Note:** If the terminal prompts `It is recommended to log in with your Expo account before proceeding`, just select **Proceed anonymously**.

## Tech Stack

- [React Native](https://reactnative.dev/) + [Expo SDK 54](https://expo.dev/)
- [Expo Router](https://expo.github.io/router/) — file-based navigation
- [MobX](https://mobx.js.org/) — reactive state management
- [react-native-maps](https://github.com/react-native-maps/react-native-maps) — native map rendering on iOS & Android (IOS: Apple Maps, Android: Google Maps)

## External APIs

| API | Purpose |
|-----|---------|
| [Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service) | Nearby attractions, text search, place details |
| [Google Weather API](https://developers.google.com/maps/documentation/weather) | Current conditions, 7-day forecast, UV index |
| [Google Air Quality API](https://developers.google.com/maps/documentation/air-quality) | Real-time Air Quality Index (AQI) |
| [UK Foreign Travel Advisory](https://www.gov.uk/foreign-travel-advice) | Official UK government travel safety alerts |
| [US State Dept. Travel Advisory](https://travel.state.gov/) | US travel safety level (1–4) by country |
| [NewsAPI](https://newsapi.org/) | Recent news articles for the destination |
| [OpenRouter](https://openrouter.ai/) | AI-generated day-by-day travel itinerary |
| [Firebase Auth](https://firebase.google.com/docs/auth) | User authentication |
| [Firebase Firestore](https://firebase.google.com/docs/firestore) | User profiles, wishlist, community posts (real-time) |
| [Firebase Storage](https://firebase.google.com/docs/storage) | Profile photo upload and hosting |

## Key Architectural Patterns & Code Highlights

### 1. resolvePromise: Elegant Async State Handling
All asynchronous API calls flow through a centralized `resolvePromise` utility (`src/resolvePromise.js`) rather than cluttering components with scattered `useState` or `useEffect` hooks. It encapsulates the promise, resolved data, and error state into a plain object that **MobX observes reactively**.

```javascript
// model.js
fetchAttractions(lat, lng) {
  resolvePromise(fetchAttractionsACB(lat, lng), this.attractionsPromiseState);
}
```

A crucial detail is the **stale-response guard**: if a new API request is fired before the previous one resolves, the older result is silently discarded because the reference check ensures only the latest promise updates the state.

```javascript
// resolvePromise.js
function successACB(result) {
  if (promiseState.promise === promise) { // Guard against stale responses
    promiseState.data = result;
  }
}

```

Views conditionally render UI elements by reactively reading `.promise`, `.data`, and `.error` from the `promiseState` object.

### 2. MobX Observer Pattern: Decoupled Presenters & Views

Presenters are wrapped in MobX's `observer()`, enabling them to **automatically re-render** whenever any observable field they consume from the model changes. This completely eliminates manual subscriptions or brittle `useEffect` dependency arrays for sync tracking.

```javascript
// homePresenter.jsx
const HomePresenter = observer(function HomePresenter(props) {
  const model = props.model;
  
  // Reading model.attractionsPromiseState.data here establishes an automatic 
  // reactive dependency. The component re-renders instantly when data updates.
  return (
    <HomeView
      attractions={model.attractionsPromiseState.data || []}
      currentAttraction={model.currentAttraction}
      onSelectAttraction={userWantsToSelectAttractionACB}
      /* ...other props */
    />
  );
});

```

Architecture Note: Views themselves are *not* observers. They remain plain React components that receive data and callbacks strictly via `props`, keeping the UI layer fully decoupled from MobX.

### 3. Firebase Real-Time Listeners: Live Data Syncing

Instead of one-off data fetching, features like the user wishlist and community posts utilize Firestore's `onSnapshot` for live, bi-directional synchronization. Any database modification (whether from this device or another) is pushed to the client instantly without polling.

```javascript
// wishlistService.js
export function listenToWishlist(uid, onUpdate) {
  const q = query(collection(db, "users", uid, "wishlist"), orderBy("createdAt", "desc"));
  
  unsubscribeWishlist = onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    onUpdate(items); // Updates the MobX model via model.setWishlist(items)
  });
}

```

The presenter triggers this subscription within a `useEffect` hook and returns the `unsubscribe` function as a cleanup phase, ensuring zero memory leaks when a user logs out or unmounts the view.

### 4. Auth Gate & Session Resolution in Root Layout

To provide a seamless UX, the authentication state is fully resolved before rendering any application screens. The root `_layout.jsx` triggers `connectToAuth(model)` on mount, which flips `model.ready = true` only after Firebase confirms the user session.

```javascript
// _layout.jsx
if (!model.ready) return <Text>Loading...</Text>;
if (!model.currentUser) return <AuthPresenter model="{model}"/>;

return <Tabs>...</Tabs>; // Renders main application tabs once authenticated

```

By holding the render state until the session is verified, we successfully prevent the jarring "login screen flash" for already-authenticated users.

### 5. Cross-Platform Map Layer via Extension Resolution

The mapping feature leverages React Native's automated **platform file resolution** (`.native.jsx` vs `.web.jsx`) to deliver high-performance UI tailored to each runtime environment while maintaining a unified interface.

```text
├── attractionsMap.native.jsx  ← Automatically loaded on iOS & Android (react-native-maps)
└── attractionsMap.web.jsx     ← Automatically loaded in Browser (@vis.gl/react-google-maps)

```

Both files export components accepting identical prop types. As a result, the rest of the codebase remains agnostic of the underlying platform split, maximizing code reuse.
