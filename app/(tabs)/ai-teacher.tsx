import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function AiTeacherScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center bg-neutral-background px-6">
        <View className="bg-semantic-info/10 p-4 rounded-full mb-4">
          <Feather name="video" size={40} color="#4D8BFF" />
        </View>
        <Text className="text-h1 font-poppins-bold text-neutral-text-primary mb-2">
          AI Teacher
        </Text>
        <Text className="text-body-medium text-neutral-text-secondary text-center">
          Practice speaking with your video-based AI language teacher.
        </Text>
      </View>
    </SafeAreaView>
  );
}
