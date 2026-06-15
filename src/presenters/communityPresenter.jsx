import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  listenToCommunityPosts,
  addCommunityPost,
  toggleLikePost,
  deleteCommunityPost,
} from "../services/communityService.js";
import CommunityView from "../native-views/communityView.jsx";

export const CommunityPresenter = observer(function CommunityPresenter({ model }) {
  const [postModalVisible, setPostModalVisible] = useState(false);

  useEffect(function subscribePostsACB() {
    return listenToCommunityPosts(function onPostsUpdateACB(posts) {
      model.setCommunityPosts(posts);
    });
  }, []);

  async function userWantsToSubmitPostACB(text, locationTag, category) {
    if (!model.currentUser?.uid || !text.trim()) return;

    const name = model.profile?.name || model.currentUser.displayName || "Anonymous";
    const avatar = model.profile?.avatarUrl || model.currentUser.photoURL || "";

    await addCommunityPost(
      model.currentUser.uid,
      name,
      avatar,
      text.trim(),
      locationTag.trim(),
      category
    );
    setPostModalVisible(false);
  }

  async function userWantsToLikeACB(postId) {
    if (!model.currentUser?.uid) return;
    const post = model.communityPosts.find((p) => p.id === postId);
    if (!post) return;
    const liked = post.likedBy?.includes(model.currentUser.uid) ?? false;
    await toggleLikePost(postId, model.currentUser.uid, liked);
  }

  async function userWantsToDeleteACB(postId) {
    await deleteCommunityPost(postId);
  }

  return (
    <CommunityView
      posts={model.communityPosts}
      currentUid={model.currentUser?.uid}
      postModalVisible={postModalVisible}
      onOpenPostModal={() => setPostModalVisible(true)}
      onClosePostModal={() => setPostModalVisible(false)}
      onSubmitPost={userWantsToSubmitPostACB}
      onLike={userWantsToLikeACB}
      onDelete={userWantsToDeleteACB}
    />
  );
});

export default CommunityPresenter;
