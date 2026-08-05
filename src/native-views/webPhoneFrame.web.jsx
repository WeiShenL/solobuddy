import { Text, View } from "react-native";
import "react-mockframe/styles/mockframe-iphones.css";
import { MockFrame } from "react-mockframe";

// can consider this in the future, but i think for now rn is better
// "rn": react-native-device-mockup — pure RN Views

export function WebPhoneFrame({ children }) {
    return (
        <View style={styles.backdrop}>
            <Text style={styles.disclaimer}>
                This is a mobile app. This web page is a mock to preview how it looks and feels on a phone. For
                the full experience, please see the{" "}
                <Text
                    href="https://github.com/WeiShenL/solobuddy/releases/latest"
                    target="_blank"
                    style={styles.disclaimerLink}
                >
                    GitHub Release page
                </Text>{" "}
                for the relevant files and the{" "}
                <Text href="https://github.com/WeiShenL/solobuddy" target="_blank" style={styles.disclaimerLink}>
                    GitHub repo
                </Text>{" "}
                for Expo Go instructions.
            </Text>
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
    disclaimer: {
        position: "fixed",
        top: 12,
        left: 0,
        right: 0,
        textAlign: "center",
        color: "#9a9a9a",
        fontSize: 12,
        fontFamily: "sans-serif",
    },
    disclaimerLink: {
        color: "#c7c7c7",
        textDecorationLine: "underline",
    },
};
