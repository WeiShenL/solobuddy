import { model } from "../model.js";
import CommunityPresenter from "../presenters/communityPresenter.jsx";

export default function CommunityPage() {
  return <CommunityPresenter model={model} />;
}
