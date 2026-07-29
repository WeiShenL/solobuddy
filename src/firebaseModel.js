// Demo in-memory replacement for Firebase, used only on this Snack-preview
// branch. The Firebase JS SDK depends on modules Snackager cannot bundle for
// the Snack runtime, and .env is gitignored anyway (no keys ship to Snack),
// so this fakes the same call shape (auth + profile + wishlist) that
// model.js and the presenters already expect, backed by module-level state
// instead of a real backend. Auto-logs in a seeded demo user on connect.

function makeDemoUser(email) {
  return {
    uid: "demo-uid",
    email: email || "demo@solobuddy.app",
    displayName: "",
    photoURL: "",
    phoneNumber: "",
  };
}

let currentUser = makeDemoUser();
let profile = {
  email: currentUser.email,
  name: "Demo Traveler",
  birthday: "1996-04-12",
  phone: "",
  avatarUrl: "",
  wishlist: [],
  visitedPlaces: [],
  createdAt: null,
};
let wishlist = [
  {
    id: "demo-1",
    name: "Eiffel Tower",
    location: "Paris, France",
    imageUrl: "https://placehold.co/300x200.png?text=Eiffel+Tower",
    description: "Iconic Parisian landmark.",
    userRating: 4.7,
    lat: 48.8584,
    lng: 2.2945,
    visited: false,
    createdAt: null,
  },
  {
    id: "demo-2",
    name: "Shibuya Crossing",
    location: "Tokyo, Japan",
    imageUrl: "https://placehold.co/300x200.png?text=Shibuya",
    description: "World's busiest pedestrian crossing.",
    userRating: 4.5,
    lat: 35.6595,
    lng: 139.7005,
    visited: true,
    createdAt: null,
  },
];

const authListeners = new Set();

export function connectToAuth(model) {
  function emitAuthState() {
    if (currentUser) {
      model.setCurrentUser(currentUser);
      model.setProfile(profile);
      model.setWishlist(wishlist);
    } else {
      model.resetUserState();
      model.setWishlist([]);
    }
    if (!model.ready) model.setReady(true);
  }

  authListeners.add(emitAuthState);
  emitAuthState();

  return function cleanup() {
    authListeners.delete(emitAuthState);
  };
}

function notifyAuth() {
  authListeners.forEach((fn) => fn());
}

export async function signInWithEmail(email) {
  currentUser = makeDemoUser(email);
  notifyAuth();
  return { user: currentUser };
}

export async function signUpWithEmail(email) {
  currentUser = makeDemoUser(email);
  profile = {
    email: currentUser.email,
    name: "",
    birthday: "",
    phone: "",
    avatarUrl: "",
    wishlist: [],
    visitedPlaces: [],
    createdAt: null,
  };
  notifyAuth();
  return { user: currentUser };
}

export async function signOutUser() {
  currentUser = null;
  notifyAuth();
}

export async function saveUserProfile(uid, patch) {
  profile = { ...profile, ...patch };
  notifyAuth();
}

export async function uploadProfilePhoto(uri, uid) {
  // Snack can't reach Firebase Storage; keep the locally picked image URI.
  await saveUserProfile(uid, { avatarUrl: uri });
  return uri;
}

export function setWishlistItem(uid, item) {
  wishlist = [
    { ...item, visited: false, createdAt: null },
    ...wishlist.filter((w) => w.id !== item.id),
  ];
  notifyAuth();
  return Promise.resolve();
}

export function markWishlistItemVisited(uid, itemId, visited) {
  wishlist = wishlist.map((w) => (w.id === itemId ? { ...w, visited } : w));
  notifyAuth();
  return Promise.resolve();
}

export function removeWishlistItem(uid, itemId) {
  wishlist = wishlist.filter((w) => w.id !== itemId);
  notifyAuth();
  return Promise.resolve();
}
