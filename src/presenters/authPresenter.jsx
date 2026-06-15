import { useState } from "react";
import { observer } from "mobx-react-lite";
import * as ImagePicker from "expo-image-picker";
import { AuthView } from "/src/native-views/authView.jsx";

// handles both login, register, logout.
//   props.model - the reactive MobX model
const AuthPresenter = observer(function AuthPresenter(props) {
    const model = props.model;

    // i use useState here instead of mobx cuz these are temporary form values
    // only exist when user is on the auth screen, no need store them.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // extra fields for registration
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUri, setAvatarUri] = useState(null);
    const [uploading, setUploading] = useState(false);

    async function userChosePhotoACB() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            setErrorMessage("Permission to access photos was denied.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.length) {
            setAvatarUri(result.assets[0].uri);
        }
    }

    async function userSubmittedFormACB() {
        setErrorMessage(null);
        try {
            if (isRegisterMode) {
                setUploading(!!avatarUri);
                try {
                    await model.registerUser(
                        email,
                        password,
                        { name, birthday, phone },
                        avatarUri
                    );
                } finally {
                    setUploading(false);
                }
            } else {
                await model.loginUser(email, password);
            }
            // onauthstatechanged in _layout.jsx handles updating model.currentUser
        } catch (error) {
            const code = error.code ?? "";
            if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found" || code === "auth/invalid-email") {
                setErrorMessage("Invalid email or password.");
            } else if (code === "auth/email-already-in-use") {
                setErrorMessage("An account with this email already exists.");
            } else if (code === "auth/weak-password") {
                setErrorMessage("Password must be at least 6 characters.");
            } else {
                setErrorMessage("Something went wrong. Please try again.");
            }
        }
    }

    function userToggledModeACB() {
        setErrorMessage(null);
        setName("");
        setBirthday("");
        setPhone("");
        setAvatarUri(null);
        setIsRegisterMode(!isRegisterMode);
    }

    return (
        <AuthView
            isRegisterMode={isRegisterMode}
            email={email}
            password={password}
            name={name}
            birthday={birthday}
            phone={phone}
            avatarUri={avatarUri}
            uploading={uploading}
            errorMessage={errorMessage}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onNameChange={setName}
            onBirthdayChange={(val) => setBirthday((val || "").replace(/[^\d-]/g, ""))}
            onPhoneChange={(val) => setPhone((val || "").replace(/\D/g, ""))}
            onChoosePhoto={userChosePhotoACB}
            onSubmit={userSubmittedFormACB}
            onToggleMode={userToggledModeACB}
        />
    );
});

export default AuthPresenter;