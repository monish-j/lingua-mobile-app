import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function LearnScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center bg-neutral-background px-6">
        <View className="bg-primary-purple/10 p-4 rounded-full mb-4">
          <Feather name="book-open" size={40} color="#6C4EF5" />
        </View>
        <Text className="text-h1 font-poppins-bold text-neutral-text-primary mb-2">
          Learn
        </Text>
        <Text className="text-body-medium text-neutral-text-secondary text-center">
          Access your personalized language courses, lessons, and reviews here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
