import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { images } from "../constants/images";
import { useAppStore } from "../store/useAppStore";
import { languages } from "../data/languages";

export default function Index() {
  const router = useRouter();
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { selectedLanguageCode } = useAppStore();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to sign out.");
    }
  };

  const selectedLanguage = languages.find((l) => l.code === selectedLanguageCode);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Brand Logo & Welcome Header */}
        <View className="items-center mt-8 mb-12">
          <Image 
            source={images.mascotLogo} 
            style={{ width: 220, height: 90 }}
            resizeMode="contain"
          />
          <Text className="text-h1 font-poppins-bold text-neutral-text-primary text-center mt-4">
            Welcome to lingua
          </Text>
          <Text className="text-body-medium text-neutral-text-secondary text-center mt-1 px-4">
            Your AI-powered interactive language teacher
          </Text>
        </View>

        {/* Selected Language Card */}
        {selectedLanguage ? (
          <View className="mb-8 p-5 bg-neutral-surface rounded-3xl border border-neutral-border flex-row items-center gap-4">
            <Image 
              source={{ uri: selectedLanguage.flag }} 
              style={styles.flagImage}
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-caption font-poppins-semibold text-neutral-text-secondary uppercase tracking-wider">
                CURRENT LANGUAGE
              </Text>
              <Text className="text-h3 font-poppins-bold text-neutral-text-primary">
                {selectedLanguage.name} ({selectedLanguage.nativeName})
              </Text>
            </View>
          </View>
        ) : (
          <View className="mb-8 p-6 bg-neutral-surface rounded-3xl border border-dashed border-neutral-border items-center py-8">
            <Text className="text-body-medium text-neutral-text-secondary text-center font-poppins-medium">
              No language selected yet.{"\n"}Choose a language below to start learning!
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-4 w-full">
          {/* Choose a Language Button */}
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => router.push("/language-select")}
            className="btn-3d btn-3d-purple h-14 items-center justify-center"
          >
            <Text className="text-body-large font-poppins-bold text-neutral-background">
              CHOOSE A LANGUAGE
            </Text>
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={handleSignOut}
            className="btn-3d btn-3d-neutral h-14 items-center justify-center"
          >
            <Text className="text-body-large font-poppins-bold text-semantic-error">
              SIGN OUT
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  flagImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});

