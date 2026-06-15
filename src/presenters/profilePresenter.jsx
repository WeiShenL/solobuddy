import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import * as ImagePicker from "expo-image-picker";
import { model } from "../model.js";
import ProfileView from "../native-views/profileView.jsx";
import ProfileEditView from "../native-views/profileEditView.jsx";

export default observer(function ProfilePresenter() {
  const user = model.currentUser;
  const profile = model.profile || {};

  const initialForm = useMemo(
    () => ({
      name: profile.name || user?.displayName || "",
      email: profile.email || user?.email || "",
      birthday: profile.birthday || "",
      phone: profile.phone || user?.phoneNumber || "",
      avatarUrl: profile.avatarUrl || user?.photoURL || "",
    }),
    [profile, user]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorText, setErrorText] = useState("");

  function openEditModeACB() {
    setForm({
      name: profile.name || user?.displayName || "",
      email: profile.email || user?.email || "",
      birthday: profile.birthday || "",
      phone: profile.phone || user?.phoneNumber || "",
      avatarUrl: profile.avatarUrl || user?.photoURL || "",
    });
    setErrorText("");
    setIsEditing(true);
  }

  function cancelEditACB() {
    setErrorText("");
    setIsEditing(false);
  }

  function updateFieldACB(field, value) {
    // set name character limit to avoid overflow
    if (field === "name") {
      const capped = (value || "").slice(0, 30);
      setForm((prev) => ({ ...prev, name: capped }));
      return;
    }

    // only allow digits and dashes only, limit to 10 chars (YYYY-MM-DD)
    if (field === "birthday") {
      const sanitized = (value || "").replace(/[^\d-]/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, birthday: sanitized }));
      return;
    }

    // only allow digits and leading plus, strip other chars, cap length
    if (field === "phone") {
      const sanitized = (value || "").replace(/[^\d+]/g, "").slice(0, 20);
      setForm((prev) => ({ ...prev, phone: sanitized }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function choosePhotoACB() {
    try {
      if (!user?.uid) return;

      setErrorText("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setErrorText("Permission to access photos was denied.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setUploading(true);

      const uploadedUrl = await model.uploadPhoto(result.assets[0].uri, user.uid);

      setForm((prev) => ({
        ...prev,
        avatarUrl: uploadedUrl,
      }));
    } catch (error) {
      console.error(error);
      setErrorText("Could not upload photo.");
    } finally {
      setUploading(false);
    }
  }

  async function savePressedACB() {
    try {
      if (!user?.uid) return;

      setSaving(true);
      setErrorText("");

      // validate birthday format if provided
      const b = (form.birthday || "").trim();
      if (b && !/^\d{4}-\d{2}-\d{2}$/.test(b)) {
        setErrorText("Birthday must be in YYYY-MM-DD format.");
        setSaving(false);
        return;
      }

      // validate phone contains only digits with optional leading +
      const p = (form.phone || "").trim();
      if (p && !/^\+?\d+$/.test(p)) {
        setErrorText("Phone must contain only digits and an optional leading +.");
        setSaving(false);
        return;
      }

      await model.saveProfile(user.uid, {
        name: form.name.trim(),
        email: form.email.trim(),
        birthday: b,
        phone: p,
        avatarUrl: form.avatarUrl || "",
      });

      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setErrorText("Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function logoutPressedACB() {
    await model.logoutUser();
  }

  const displayName =
    profile.name || user?.displayName || form.name || "Anonymous User";
  const displayEmail = profile.email || user?.email || form.email || "";
  const displayBirthday = profile.birthday || "Not provided";
  const displayPhone = profile.phone || user?.phoneNumber || "Not provided";
  const displayAvatarUrl = profile.avatarUrl || user?.photoURL || "";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  if (isEditing) {
    return (
      <ProfileEditView
        form={form}
        saving={saving}
        uploading={uploading}
        errorText={errorText}
        onChangeField={updateFieldACB}
        onChoosePhoto={choosePhotoACB}
        onSave={savePressedACB}
        onCancel={cancelEditACB}
      />
    );
  }

  return (
    <ProfileView
      name={displayName}
      email={displayEmail}
      birthday={displayBirthday}
      phone={displayPhone}
      avatarUrl={displayAvatarUrl}
      initials={initials}
      onEdit={openEditModeACB}
      onLogout={logoutPressedACB}
    />
  );
});