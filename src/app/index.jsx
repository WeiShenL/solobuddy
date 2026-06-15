import React from "react";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { model } from "../model.js";

import HomePresenter from "../presenters/homePresenter.jsx";

export default observer(function ExplorePage() {
  return (
    <View style={{ flex: 1 }}>
      <HomePresenter model={model} />
    </View>
  );
});