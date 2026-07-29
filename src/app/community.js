import { model } from "../model.js";
import CommunityPresenter from "../presenters/communityPresenter.js";

export default function CommunityPage() {
  return <CommunityPresenter model={model} />;
}
