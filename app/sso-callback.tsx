import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Once Clerk is loaded and user is signed in, redirect to home
        router.replace("/");
      } else {
        // Fallback: wait up to 2 seconds for state propagation before redirecting to onboarding
        const timer = setTimeout(() => {
          router.replace("/onboarding");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
      <ActivityIndicator size="large" color="#6C4EF5" />
    </View>
  );
}
