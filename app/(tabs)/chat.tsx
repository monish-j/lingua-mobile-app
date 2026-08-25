import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function ChatScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center bg-neutral-background px-6">
        <View className="bg-primary-green/10 p-4 rounded-full mb-4">
          <Feather name="message-circle" size={40} color="#21C16B" />
        </View>
        <Text className="text-h1 font-poppins-bold text-neutral-text-primary mb-2">
          Chat Tutor
        </Text>
        <Text className="text-body-medium text-neutral-text-secondary text-center">
          Chat with your personal AI language tutor for real-time practice.
        </Text>
      </View>
    </SafeAreaView>
  );
}
