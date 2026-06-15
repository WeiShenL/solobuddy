import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseModel.js";

let unsubscribeCommunity = null;

export function listenToCommunityPosts(onUpdate) {
  if (unsubscribeCommunity) {
    unsubscribeCommunity();
    unsubscribeCommunity = null;
  }
  const q = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"));
  unsubscribeCommunity = onSnapshot(
    q,
    (snap) => {
      const posts = [];
      snap.forEach((d) => posts.push({ id: d.id, ...d.data() }));
      onUpdate(posts);
    },
    (err) => {
      console.error("community listener error", err);
      onUpdate([]);
    }
  );
  return () => {
    if (unsubscribeCommunity) {
      unsubscribeCommunity();
      unsubscribeCommunity = null;
    }
  };
}

export function addCommunityPost(uid, authorName, authorAvatar, text, locationTag, category) {
  return addDoc(collection(db, "communityPosts"), {
    authorUid: uid,
    authorName: authorName || "Anonymous",
    authorAvatar: authorAvatar || "",
    text,
    locationTag: locationTag || "",
    category: category || "experience",
    likedBy: [],
    createdAt: serverTimestamp(),
  });
}

export async function toggleLikePost(postId, uid, currentlyLiked) {
  const postRef = doc(db, "communityPosts", postId);
  return updateDoc(postRef, {
    likedBy: currentlyLiked ? arrayRemove(uid) : arrayUnion(uid),
  });
}

export function deleteCommunityPost(postId) {
  return deleteDoc(doc(db, "communityPosts", postId));
}
