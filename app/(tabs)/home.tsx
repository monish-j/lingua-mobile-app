import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useAppStore } from "../../store/useAppStore";
import { languages } from "../../data/languages";
import { units } from "../../data/units";
import { lessons } from "../../data/lessons";
import { images } from "../../constants/images";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { selectedLanguageCode, setSelectedLanguageCode, hasHydrated } = useAppStore();

  if (!isUserLoaded || !hasHydrated) {
    return null;
  }

  // Get active language details
  const activeLanguage = languages.find((l) => l.code === selectedLanguageCode) || languages[0];

  // Language specific greetings
  const greetingMap: Record<string, string> = {
    es: "Hola",
    fr: "Bonjour",
    ja: "こんにちは",
    de: "Hallo",
  };
  const greeting = greetingMap[activeLanguage.code] || "Hello";
  const displayName = user?.firstName || "Learner";

  // Get learning data dynamically
  const activeUnit = units.find((u) => u.languageCode === activeLanguage.code) || units[0];
  const activeLessons = lessons.filter((l) => l.unitId === activeUnit.id);
  const currentLesson = activeLessons[0] || lessons[0];

  const handleResetState = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset your language selection and progress state?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setSelectedLanguageCode(null);
              await AsyncStorage.removeItem("lingua-app-storage");
              // Display success confirmation and redirect to entry routing
              Alert.alert("Success", "Language selection state cleared!", [
                { text: "OK", onPress: () => router.replace("/") }
              ]);
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : "Failed to clear state.";
              Alert.alert("Error", errorMessage);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3">
            {/* Circular Language Flag Frame */}
            <View className="w-10 h-10 rounded-full border-2 border-neutral-border overflow-hidden">
              <Image 
                source={{ uri: activeLanguage.flag }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View>
              <Text className="text-body-medium text-neutral-text-secondary leading-tight">
                {greeting},
              </Text>
              <Text className="text-h4 font-poppins-bold text-neutral-text-primary leading-tight">
                {displayName}! 👋
              </Text>
            </View>
          </View>

          {/* Right Action Icons (Streak & Notifications) */}
          <View className="flex-row items-center gap-3">
            {/* Streak count pill */}
            <TouchableOpacity 
              activeOpacity={0.8}
              className="flex-row items-center gap-1.5 px-3 py-1.5 bg-[#FFF4E6] rounded-full border border-[#FFE0B2]"
            >
              <Image 
                source={images.streakFire}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-body-medium font-poppins-bold text-semantic-streak">
                12
              </Text>
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity 
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full border border-neutral-border items-center justify-center bg-white active:bg-neutral-surface"
            >
              <Feather name="bell" size={20} color="#0D132B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Goal Progress Card */}
        <View className="mb-6 bg-[#FDF6EE] p-5 rounded-3xl border border-[#F5ECE2] flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-caption font-poppins-semibold text-neutral-text-secondary uppercase tracking-wider mb-0.5">
              Daily Goal
            </Text>
            <View className="flex-row items-baseline mb-2">
              <Text className="text-h3 font-poppins-bold text-neutral-text-primary">15</Text>
              <Text className="text-body-medium font-poppins-medium text-neutral-text-secondary ml-1">/ 20 XP</Text>
            </View>
            {/* Progress bar */}
            <View className="h-2.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
              <View className="h-full bg-semantic-streak rounded-full w-[75%]" />
            </View>
          </View>
          {/* Treasure Chest illustration */}
          <Image 
            source={images.treasure}
            className="w-[68px] h-[68px]"
            resizeMode="contain"
          />
        </View>

        {/* Continue Learning Purple Gradient Card */}
        <View className="mb-8 bg-primary-purple p-6 rounded-3xl relative overflow-hidden flex-row justify-between items-center" style={styles.shadowCard}>
          <View className="flex-1 z-10 mr-4">
            <Text className="text-caption font-poppins-semibold text-white/70 uppercase tracking-wider mb-1">
              Continue learning
            </Text>
            <Text className="text-h2 font-poppins-bold text-white mb-0.5">
              {activeLanguage.name}
            </Text>
            <Text className="text-body-small font-poppins-medium text-white/80 mb-5">
              A1 • Unit {activeUnit.order}
            </Text>
            <TouchableOpacity 
              activeOpacity={0.9}
              className="bg-white px-6 py-2.5 rounded-full self-start"
              // Route to the dynamic lesson details screen passing the current lesson ID
              onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: currentLesson.id } })}
            >
              <Text className="text-body-medium font-poppins-bold text-primary-purple">
                Continue
              </Text>
            </TouchableOpacity>
          </View>

          {/* Palace / Cathedral background image on the right */}
          <View className="w-32 h-32 opacity-95">
            <Image 
              source={images.palace}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Today's Plan Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-h3 font-poppins-bold text-neutral-text-primary">
              {"Today's plan"}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-body-medium font-poppins-semibold text-primary-purple">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Plan items stack */}
          <View className="bg-white rounded-2xl border border-neutral-border overflow-hidden">
            {/* Item 1: Lesson */}
            <View className="flex-row items-center justify-between p-4 border-b border-neutral-border">
              <View className="flex-row items-center gap-3.5 flex-1">
                <View className="w-11 h-11 rounded-2xl bg-primary-purple/10 items-center justify-center">
                  <Feather name="book-open" size={20} color="#6C4EF5" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-medium font-poppins-bold text-neutral-text-primary">
                    Lesson
                  </Text>
                  <Text className="text-body-small text-neutral-text-secondary" numberOfLines={1}>
                    {currentLesson.title}
                  </Text>
                </View>
              </View>
              {/* Completed checkmark badge */}
              <View className="w-6 h-6 rounded-full bg-primary-purple items-center justify-center">
                <Feather name="check" size={14} color="#FFFFFF" />
              </View>
            </View>

            {/* Item 2: AI Conversation */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.push("/(tabs)/ai-teacher")}
              className="flex-row items-center justify-between p-4 border-b border-neutral-border active:bg-neutral-surface/40"
            >
              <View className="flex-row items-center gap-3.5 flex-1">
                <View className="w-11 h-11 rounded-2xl bg-primary-blue/10 items-center justify-center">
                  <Feather name="message-circle" size={20} color="#4D8BFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-medium font-poppins-bold text-neutral-text-primary">
                    AI Conversation
                  </Text>
                  <Text className="text-body-small text-neutral-text-secondary">
                    Practice speaking
                  </Text>
                </View>
              </View>
              {/* Incomplete circle status */}
              <View className="w-6 h-6 rounded-full border-2 border-neutral-border" />
            </TouchableOpacity>

            {/* Item 3: New Words */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3.5 flex-1">
                <View className="w-11 h-11 rounded-2xl bg-semantic-warning/10 items-center justify-center">
                  <Feather name="layers" size={20} color="#FFC800" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-medium font-poppins-bold text-neutral-text-primary">
                    New words
                  </Text>
                  <Text className="text-body-small text-neutral-text-secondary">
                    {currentLesson.vocabulary.length} new words
                  </Text>
                </View>
              </View>
              {/* Incomplete circle status */}
              <View className="w-6 h-6 rounded-full border-2 border-neutral-border" />
            </View>
          </View>
        </View>


        {/* Dev Tools resetting state helper */}
        {__DEV__ && (
          <View className="mb-6 mt-2 border-t border-dashed border-neutral-border pt-6 items-center">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleResetState}
              className="flex-row items-center gap-2 px-5 py-3 bg-neutral-surface rounded-2xl border border-neutral-border active:bg-neutral-border/20"
            >
              <Feather name="refresh-cw" size={16} color="#6B7280" />
              <Text className="text-body-small font-poppins-bold text-neutral-text-secondary">
                Reset App State (Developer Helper)
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  shadowCard: {
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});

