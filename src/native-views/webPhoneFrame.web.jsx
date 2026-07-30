import { View } from "react-native";

// - "rn"        : react-native-device-mockup — pure RN Views
// - "mockframe" : react-mockframe — DOM-based, iPhone 17 w/ Dynamic Island.

const VARIANT = "mockframe";

export function WebPhoneFrame({ children }) {
    return <View style={styles.backdrop}>{renderVariant(children)}</View>;
}

function renderVariant(children) {
    switch (VARIANT) {
        case "mockframe": {
            require("react-mockframe/styles/mockframe-iphones.css");
            const { MockFrame } = require("react-mockframe");
            return (
                <MockFrame device="iPhone 17" width={393} height={852}>
                    <View style={{ width: "100%", height: "100%", paddingTop: 59 }}>{children}</View>
                </MockFrame>
            );
        }
        case "rn":
        default: {
            const { IPhoneMockup } = require("react-native-device-mockup");
            return (
                <IPhoneMockup screenWidth={390} screenType="island">
                    {children}
                </IPhoneMockup>
            );
        }
    }
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
