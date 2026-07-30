import { Tabs } from "expo-router"
import { Text } from "react-native"
import { model } from "../model.js"
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { connectToAuth } from "../firebaseModel.js";
import AuthPresenter from "../presenters/authPresenter.jsx";
import { Image } from "react-native"
import { WebPhoneFrame } from "../native-views/webPhoneFrame"

export default observer(function RootLayout() {
    // aft app mounts, set up the firebase auth state observer 
    // connectotauth calls firebase lsitner onauthstatechaged, update model.currentUser and model.ready
    useEffect(function setupAuthListenerACB() {
        const unsubscribe = connectToAuth(model);
        return unsubscribe;
    }, []);

    // firebase resolve the initial auth state
    if (!model.ready) {
        return <WebPhoneFrame><Text>Loading...</Text></WebPhoneFrame>;
    }

    // show auth screen if not logged in
    if (!model.currentUser) {
        return <WebPhoneFrame><AuthPresenter model={model} /></WebPhoneFrame>;
    }

    const currentUserName = model.profile?.name || "there";
    const targetLocation = model.currentCity || model.currentCountry;

    // logged in
    return (
        <WebPhoneFrame>
            <Tabs>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Explore",
                        tabBarLabel: "Explore",
                        headerStyle: {
                            backgroundColor: "#7D5A50",
                        },
                        headerTintColor: "#fff", // text color
                        headerTitle: targetLocation ? `Hey ${currentUserName}, let's explore ${targetLocation}!` : `Hey ${currentUserName}, let's explore!`,
                        tabBarIcon: function renderExploreTabIconACB({ size }) {
                            return (
                                <Image
                                    source={require("../assets/explore-icon.png")}
                                    style={{ width: size, height: size }}
                                    resizeMode="contain"
                                />
                            );
                        },
                    }}
                />
                <Tabs.Screen
                    name="safety"
                    options={{
                        title: "Safety",
                        headerStyle: {
                            backgroundColor: "#7D5A50",
                        },
                        headerTintColor: "#fff", // text color        
                        tabBarIcon: function renderSafetyTabIconACB({ size }) {
                            return (
                                <Image
                                    source={require("../assets/safety-icon.png")}
                                    style={{ width: size, height: size }}
                                    resizeMode="contain"
                                />
                            );
                        },
                    }}
                />
                <Tabs.Screen
                    name="community"
                    options={{
                        title: "Community and Vibes",   // changed the name to remove duplicates
                        tabBarLabel: "Community",   // made this cleaner in the footer
                        headerStyle: {
                            backgroundColor: "#7D5A50",
                        },
                        headerTintColor: "#fff", // text color
                        tabBarIcon: function renderCommunityTabIconACB({ size }) {
                            return (
                                <Image
                                    source={require("../assets/community-icon.png")}
                                    style={{ width: size, height: size }}
                                    resizeMode="contain"
                                />
                            );
                        },
                    }}
                />
                <Tabs.Screen
                    name="wishlist"
                    options={{
                        title: "My Trips",
                        headerStyle: {
                            backgroundColor: "#7D5A50",
                        },
                        headerTintColor: "#fff", // text color
                        tabBarIcon: function renderWishlistTabIconACB({ size }) {
                            return (
                                <Image
                                    source={require("../assets/wishlist-icon.png")}
                                    // source={require("../assets/explore-icon.png")}
                                    style={{ width: size, height: size }}
                                    resizeMode="contain"
                                />
                            );
                        },
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        headerStyle: {
                            backgroundColor: "#7D5A50",
                        },
                        headerTintColor: "#fff", // text color
                        tabBarIcon: function renderProfileTabIconACB({ size }) {
                            return (
                                <Image
                                    source={require("../assets/profile-icon.png")}
                                    style={{ width: size, height: size }}
                                    resizeMode="contain"
                                />
                            );
                        },
                    }}
                />
            </Tabs>
        </WebPhoneFrame>
    );
});
