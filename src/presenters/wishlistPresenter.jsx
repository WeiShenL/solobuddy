import React from "react";
import { observer } from "mobx-react-lite";
import WishlistView from "../native-views/wishlistView.jsx";

export const WishlistPresenter = observer(function WishlistPresenter({ model }) {
  // the wishlist is kept in sync with Firestore by firebaseModel (tied to auth),
  // so the presenter just reads model.wishlist and calls model actions.

  // load the current wishlist items from the model, split into active and visited
  const allItems = model.wishlist || [];
  const activeItems = allItems.filter((item) => !item.visited);
  const visitedItems = allItems.filter((item) => item.visited);
  const activeCount = activeItems.length;
  const canGenerate = activeCount >= 5;
  const itineraryState = {
    promise: model.itineraryPromiseState.promise,
    data: model.itineraryPromiseState.data,
    error: model.itineraryPromiseState.error,
  };

  // ACB to remove an item; the firestore listener updates the UI automatically
  async function removeItemACB(itemId) {
    await model.removeFromWishlist(itemId);
  }

  // ACB to toggle visited state on a wishlist item
  async function markVisitedACB(itemId, visited) {
    await model.markVisited(itemId, visited);
  }

  function generateItineraryACB() {
    model.generateItinerary();
  }

  return (
    <WishlistView
      activeItems={activeItems}
      visitedItems={visitedItems}
      activeCount={activeCount}
      canGenerate={canGenerate}
      itineraryState={itineraryState}
      onGenerateItinerary={generateItineraryACB}
      onRemoveItem={removeItemACB}
      onMarkVisited={markVisitedACB}
    />
  );
});

export default WishlistPresenter;
