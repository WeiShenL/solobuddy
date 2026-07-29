// Demo in-memory replacement for the Firestore-backed community feed, used
// only on this Snack-preview branch — see firebaseModel.js for why the real
// Firebase SDK can't be bundled by Snackager.

let posts = [
  {
    id: "post-1",
    authorUid: "demo-uid-2",
    authorName: "Alex",
    authorAvatar: "",
    text: "Just got back from Kyoto, the bamboo forest at dawn is unreal.",
    locationTag: "Kyoto, Japan",
    category: "experience",
    likedBy: [],
    createdAt: null,
  },
];

const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn([...posts]));
}

export function listenToCommunityPosts(onUpdate) {
  listeners.add(onUpdate);
  onUpdate([...posts]);
  return function cleanup() {
    listeners.delete(onUpdate);
  };
}

export function addCommunityPost(uid, authorName, authorAvatar, text, locationTag, category) {
  posts = [
    {
      id: `post-${Date.now()}`,
      authorUid: uid,
      authorName: authorName || "Anonymous",
      authorAvatar: authorAvatar || "",
      text,
      locationTag: locationTag || "",
      category: category || "experience",
      likedBy: [],
      createdAt: null,
    },
    ...posts,
  ];
  notify();
  return Promise.resolve();
}

export function toggleLikePost(postId, uid, currentlyLiked) {
  posts = posts.map((p) =>
    p.id === postId
      ? {
          ...p,
          likedBy: currentlyLiked
            ? p.likedBy.filter((id) => id !== uid)
            : [...p.likedBy, uid],
        }
      : p
  );
  notify();
  return Promise.resolve();
}

export function deleteCommunityPost(postId) {
  posts = posts.filter((p) => p.id !== postId);
  notify();
  return Promise.resolve();
}
