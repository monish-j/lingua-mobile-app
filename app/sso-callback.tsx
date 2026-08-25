import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      // Once Clerk is loaded, redirect the user back to the home route
      router.replace("/");
    }
  }, [isLoaded, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
      <ActivityIndicator size="large" color="#6C4EF5" />
      <Text className="text-body-medium font-poppins-semibold text-neutral-text-secondary mt-4">
        Completing authentication...
      </Text>
    </View>
  );
}
