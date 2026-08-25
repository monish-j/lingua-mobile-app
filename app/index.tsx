import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useAppStore } from "../store/useAppStore";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { selectedLanguageCode, hasHydrated } = useAppStore();

  if (!isLoaded || !hasHydrated) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguageCode) {
    return <Redirect href="/language-select" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
