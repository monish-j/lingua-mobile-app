import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center bg-neutral-background px-6">
        <Text className="text-h1 font-poppins-bold text-primary-purple mb-2">
          Home Screen
        </Text>
        <Text className="text-body-medium text-neutral-text-secondary text-center">
          This is a placeholder for the Home screen UI.
        </Text>
      </View>
    </SafeAreaView>
  );
}
