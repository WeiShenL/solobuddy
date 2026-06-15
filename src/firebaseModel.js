import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { firebaseConfig } from "/src/firebaseConfig.js";

// I made some changes here to make it easier for testing when swtiching bnetween rpoject ids. (i had some issues)
const existingApp = getApps().find(
  (appInstance) => appInstance.options.projectId === firebaseConfig.projectId
);
const app = existingApp ?? initializeApp(firebaseConfig, firebaseConfig.projectId);

// for debug, for some reason on my phone I'm still connected to the prev firebase
// console.log("Firebase Project ID:", app.options.projectId);
// console.log("Firebase API Key:", app.options.apiKey);

// on React Native getAuth defaults to in-memory persistence, so the session is
// lost when the app is killed. initializeAuth with AsyncStorage persists it.
// it must run only once per app instance, so fall back to getAuth on re-runs (hot reload).
function initAuthWithPersistence(firebaseApp) {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const auth = initAuthWithPersistence(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let unsubscribeProfile = null;
let unsubscribeWishlist = null;

export function connectToAuth(model) {
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }
    if (unsubscribeWishlist) {
      unsubscribeWishlist();
      unsubscribeWishlist = null;
    }

    if (user) {
      model.setCurrentUser({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        phoneNumber: user.phoneNumber || "",
      });

      const profileRef = doc(db, "users", user.uid);

      unsubscribeProfile = onSnapshot(
        profileRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            model.setProfile(snapshot.data());
          } else {
            const starterProfile = {
              email: user.email || "",
              name: user.displayName || "",
              birthday: "",
              phone: user.phoneNumber || "",
              avatarUrl: user.photoURL || "",
              wishlist: [],
              visitedPlaces: [],
              createdAt: serverTimestamp(),
            };

            await setDoc(profileRef, starterProfile);
            model.setProfile({
              ...starterProfile,
              createdAt: null,
            });
          }
        },
        (error) => {
          console.error("Error listening to profile:", error);
          model.clearProfile();
        }
      );

      // keep the wishlist in sync for the logged-in user; teardown happens above
      // on the next auth change (logout or account switch)
      unsubscribeWishlist = listenToWishlist(user.uid, (items) => {
        model.setWishlist(items);
      });
    } else {
      model.resetUserState();
      model.setWishlist([]);
    }

    if (!model.ready) {
      model.setReady(true);
    }
  });

  return function cleanup() {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }
    if (unsubscribeWishlist) {
      unsubscribeWishlist();
      unsubscribeWishlist = null;
    }
    unsubscribeAuth();
  };
}

export async function signUpWithEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", userCredential.user.uid), {
    email: userCredential.user.email || "",
    name: "",
    birthday: "",
    phone: "",
    avatarUrl: "",
    wishlist: [],
    visitedPlaces: [],
    createdAt: serverTimestamp(),
  });

  return userCredential;
}

// sign in an existing user with email and password
export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// sign out the current user
export function signOutUser() {
  return signOut(auth);
}

export function saveUserProfile(uid, profilePatch) {
  return setDoc(doc(db, "users", uid), profilePatch, { merge: true });
}

// func to upload photo
export async function uploadProfilePhoto(uri, uid) {
  const response = await fetch(uri);
  const blob = await response.blob();

  const imageRef = ref(storage, `users/${uid}/profile-photo-${Date.now()}.jpg`);

  await uploadBytes(imageRef, blob, { contentType: "image/jpeg" });

  const downloadURL = await getDownloadURL(imageRef);

  await saveUserProfile(uid, { avatarUrl: downloadURL });

  return downloadURL;
}

// --- wishlist persistence (one item per doc under users/{uid}/wishlist) ---

export function setWishlistItem(uid, item) {
  const itemRef = doc(db, "users", uid, "wishlist", item.id);
  return setDoc(itemRef, { ...item, visited: false, createdAt: serverTimestamp() });
}

export function markWishlistItemVisited(uid, itemId, visited) {
  const itemRef = doc(db, "users", uid, "wishlist", itemId);
  return updateDoc(itemRef, { visited });
}

export function removeWishlistItem(uid, itemId) {
  const itemRef = doc(db, "users", uid, "wishlist", itemId);
  return deleteDoc(itemRef);
}

// subscribe to a user's wishlist; returns an unsubscribe function
export function listenToWishlist(uid, onUpdate) {
  const q = query(
    collection(db, "users", uid, "wishlist"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      onUpdate(items);
    },
    (err) => {
      console.error("wishlist listener error", err);
      onUpdate([]);
    }
  );
}


