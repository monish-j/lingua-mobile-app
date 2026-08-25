import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useAppStore } from "../../store/useAppStore";
import { languages } from "../../data/languages";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { selectedLanguageCode, setSelectedLanguageCode } = useAppStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      setSelectedLanguageCode(null);
      router.replace("/onboarding");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to sign out.");
    }
  };

  const handleClearStorage = async () => {
    try {
      setSelectedLanguageCode(null);
      await AsyncStorage.removeItem("lingua-app-storage");
      Alert.alert("Success", "Language selection state cleared!", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to clear state.");
    }
  };

  const selectedLanguage = languages.find((l) => l.code === selectedLanguageCode);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card Header */}
        <View className="items-center mt-6 mb-8">
          <View className="w-24 h-24 rounded-full bg-primary-purple/10 items-center justify-center border-4 border-primary-purple/20 relative overflow-hidden mb-4">
            {user?.imageUrl ? (
              <Image 
                source={{ uri: user.imageUrl }} 
                className="w-full h-full" 
                resizeMode="cover"
              />
            ) : (
              <Feather name="user" size={48} color="#6C4EF5" />
            )}
          </View>
          <Text className="text-h2 font-poppins-bold text-neutral-text-primary text-center">
            {user?.fullName || user?.primaryEmailAddress?.emailAddress || "Guest Learner"}
          </Text>
          <Text className="text-body-small text-neutral-text-secondary text-center mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* Selected Language Section */}
        <View className="mb-6">
          <Text className="text-caption font-poppins-bold text-neutral-text-secondary uppercase tracking-widest mb-3">
            Learning Progress
          </Text>
          {selectedLanguage ? (
            <View className="p-4 bg-neutral-surface rounded-2xl border border-neutral-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Image 
                  source={{ uri: selectedLanguage.flag }} 
                  style={styles.flagImage}
                  resizeMode="cover"
                />
                <View>
                  <Text className="text-caption font-poppins-semibold text-neutral-text-secondary">
                    Active Language
                  </Text>
                  <Text className="text-body-large font-poppins-bold text-neutral-text-primary">
                    {selectedLanguage.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/language-select")}
                className="bg-neutral-background border border-neutral-border py-2 px-4 rounded-xl active:bg-neutral-surface"
              >
                <Text className="text-body-small font-poppins-bold text-primary-purple">
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="p-4 bg-neutral-surface rounded-2xl border border-dashed border-neutral-border items-center justify-center">
              <Text className="text-body-medium text-neutral-text-secondary text-center font-poppins-medium">
                No active language. Choose one to start!
              </Text>
            </View>
          )}
        </View>

        {/* Settings / Actions Section */}
        <View className="mb-8">
          <Text className="text-caption font-poppins-bold text-neutral-text-secondary uppercase tracking-widest mb-3">
            Account Options
          </Text>
          
          <View className="bg-neutral-surface rounded-2xl border border-neutral-border overflow-hidden">
            {/* Clear Storage */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={handleClearStorage}
              className="flex-row items-center justify-between p-4 border-b border-neutral-border bg-white"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-semantic-warning/10 p-2 rounded-xl">
                  <Feather name="refresh-cw" size={20} color="#FFC800" />
                </View>
                <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary">
                  Reset Progress (Clear Storage)
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={handleSignOut}
              className="flex-row items-center justify-between p-4 bg-white"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-semantic-error/10 p-2 rounded-xl">
                  <Feather name="log-out" size={20} color="#FF4D4F" />
                </View>
                <Text className="text-body-medium font-poppins-semibold text-semantic-error">
                  Sign Out
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  flagImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
