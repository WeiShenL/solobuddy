import { Modal as RNModal, View, Platform, StyleSheet } from "react-native";

export default function AppModal({
  visible,
  children,
  transparent = true,
  animationType = "slide",
  onRequestClose,
  ...rest
}) {
  if (Platform.OS !== "web") {
    return (
      <RNModal
        visible={visible}
        transparent={transparent}
        animationType={animationType}
        onRequestClose={onRequestClose}
        {...rest}
      >
        {children}
      </RNModal>
    );
  }

  if (!visible) return null;

  return (
    <View style={styles.webContainer} pointerEvents="auto">
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    overflow: "hidden",
  },
});
