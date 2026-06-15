import React from "react";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { model } from "../model.js";
import SafetyPresenter from "../presenters/safetyPresenter.jsx";

export default observer(function SafetyPage() {
  return (
    <View style={{ flex: 1 }}>
      <SafetyPresenter model={model} />
    </View>
  );
});
