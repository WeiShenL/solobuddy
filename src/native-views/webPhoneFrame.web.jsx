import { Text, View, useWindowDimensions } from "react-native";
import "react-mockframe/styles/mockframe-iphones.css";
import { MockFrame } from "react-mockframe";

// can consider this in the future, but i think for now rn is better
// "rn": react-native-device-mockup — pure RN Views

const SCREEN_WIDTH = 393;
const SCREEN_HEIGHT = 852;
const BEZEL = 12; 
const FRAME_WIDTH = SCREEN_WIDTH + BEZEL * 2;
const FRAME_HEIGHT = SCREEN_HEIGHT + BEZEL * 2;

const GUTTER = 16;
// reserved height so the text never sits on the frame
const DISCLAIMER_BLOCK = 56; 
const GAP = 12;
// below this the mock frame adds nothing 
const NARROW_BREAKPOINT = 700;

function Disclaimer() {
    return (
        <Text style={styles.disclaimer}>
            This is a mobile app. This web page is a mock to preview how it looks and feels on a phone. For the
            full experience, please see the{" "}
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
    );
}

export function WebPhoneFrame({ children }) {
    const { width, height } = useWindowDimensions();

    // Real phones / very small windows: drop the frame, run the app full-bleed.
    if (width < NARROW_BREAKPOINT) {
        return (
            <View style={styles.bare}>
                <View style={styles.bareDisclaimer}>
                    <Disclaimer />
                </View>
                <View style={styles.bareContent}>{children}</View>
            </View>
        );
    }

    // Shrink the frame to whatever the viewport can actually fit (never upscale).
    const zoom = Math.min(
        1,
        (width - GUTTER * 2) / FRAME_WIDTH,
        (height - GUTTER * 2 - DISCLAIMER_BLOCK - GAP) / FRAME_HEIGHT,
    );

    return (
        <View style={styles.backdrop}>
            <View style={styles.disclaimerBlock}>
                <Disclaimer />
            </View>
            {/* zoom is a transform (origin top-left), so it doesn't shrink the layout
                box. this wrapper carries the scaled size so centering stays correct. */}
            <View style={{ width: FRAME_WIDTH * zoom, height: FRAME_HEIGHT * zoom }}>
                <MockFrame device="iPhone 17" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} zoom={zoom} animated>
                    <View style={{ width: "100%", height: "100%", paddingTop: 59 }}>{children}</View>
                </MockFrame>
            </View>
        </View>
    );
}

const styles = {
    backdrop: {
        flex: 1,
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: GUTTER,
        gap: GAP,
        backgroundColor: "#2b2b2b",
    },
    disclaimerBlock: {
        height: DISCLAIMER_BLOCK,
        maxWidth: 640,
        justifyContent: "center",
    },
    disclaimer: {
        textAlign: "center",
        color: "#9a9a9a",
        fontSize: 12,
        lineHeight: 16,
        fontFamily: "sans-serif",
    },
    disclaimerLink: {
        color: "#c7c7c7",
        textDecorationLine: "underline",
    },
    bare: {
        flex: 1,
        minHeight: "100vh",
        backgroundColor: "#2b2b2b",
    },
    bareDisclaimer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    bareContent: {
        flex: 1,
    },
};
