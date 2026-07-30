import { View } from "react-native";
import "react-mockframe/styles/mockframe-iphones.css";
import { MockFrame } from "react-mockframe";

// can consider this in the future, but i think for now rn is better
// "rn": react-native-device-mockup — pure RN Views

export function WebPhoneFrame({ children }) {
    return (
        <View style={styles.backdrop}>
            <MockFrame device="iPhone 17" width={393} height={852}>
                <View style={{ width: "100%", height: "100%", paddingTop: 59 }}>{children}</View>
            </MockFrame>
        </View>
    );
}

const styles = {
    backdrop: {
        flex: 1,
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2b2b2b",
    },
};
