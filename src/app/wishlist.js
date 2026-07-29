import { observer } from "mobx-react-lite";
import { model } from "../model.js";
import { WishlistPresenter } from "../presenters/wishlistPresenter.js";

export default observer(function WishlistPage() {
  return <WishlistPresenter model={model} />;
});