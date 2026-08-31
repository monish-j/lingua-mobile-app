import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePostHog } from "posthog-react-native";
import { lessons } from "../../data/lessons";
import { units } from "../../data/units";

export default function LessonDetailsScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { id } = useLocalSearchParams();

  // Find the lesson in the dataset
  const lesson = lessons.find((l) => l.id === id);

  // Handle missing lesson safely
  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View className="flex-1 items-center justify-center bg-neutral-background px-6">
          <Feather name="alert-circle" size={48} color="#FF4D4F" className="mb-4" />
          <Text className="text-h2 font-poppins-bold text-neutral-text-primary text-center mb-2">
            Lesson Not Found
          </Text>
          <Text className="text-body-medium text-neutral-text-secondary text-center mb-6">
            The requested lesson details could not be loaded.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home")}
            className="btn-3d btn-3d-purple h-12 px-6 items-center justify-center"
          >
            <Text className="text-body-medium font-poppins-bold text-neutral-background">
              Go Back Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Derive unit details only after lesson validation
  const unit = units.find((u) => u.id === lesson.unitId);

  const handleStart = () => {
    posthog.capture("lesson_started", {
      lesson_id: lesson.id,
      unit_id: lesson.unitId,
      lesson_xp: lesson.xp,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    // Navigate to the audio-only AI teacher lesson screen
    router.push({ pathname: "/lesson/audio/[id]", params: { id: lesson.id } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Sticky Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-border bg-neutral-background">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={24} color="#0D132B" />
        </TouchableOpacity>
        <Text className="text-h4 font-poppins-bold text-neutral-text-primary text-center">
          Lesson Details
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Unit Info & Lesson Title */}
        <View className="mb-6">
          <Text className="text-caption font-poppins-bold text-primary-purple uppercase tracking-widest mb-1">
            {unit ? `Unit ${unit.order}: ${unit.title}` : "Learning Unit"}
          </Text>
          <Text className="text-h1 font-poppins-bold text-neutral-text-primary leading-tight mb-2">
            {lesson.title}
          </Text>
          <Text className="text-body-medium text-neutral-text-secondary leading-relaxed">
            {lesson.description}
          </Text>
        </View>

        {/* XP Reward card */}
        <View className="mb-6 flex-row items-center bg-[#FFF4E6] border border-[#FFE0B2] p-4 rounded-2xl gap-3">
          <View className="bg-semantic-streak/10 p-2 rounded-xl">
            <Feather name="zap" size={20} color="#FF8A00" />
          </View>
          <View>
            <Text className="text-body-medium font-poppins-bold text-[#FF8A00]">
              {`+${lesson.xp} XP Reward`}
            </Text>
            <Text className="text-body-small text-neutral-text-secondary">
              Earn XP upon successful completion
            </Text>
          </View>
        </View>

        {/* Learning Goals Section */}
        {Boolean(lesson.goals && lesson.goals.length > 0) ? (
          <View className="mb-6">
            <Text className="text-h4 font-poppins-bold text-neutral-text-primary mb-3">
              What you will learn
            </Text>
            <View className="gap-2.5">
              {lesson.goals?.map((goal, index) => (
                <View key={index} className="flex-row items-start gap-2.5">
                  <View className="bg-primary-green/10 p-1 rounded-full mt-0.5">
                    <Feather name="check" size={14} color="#21C16B" />
                  </View>
                  <Text className="text-body-medium text-neutral-text-primary flex-1">
                    {goal}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Vocabulary Preview Section */}
        {Boolean(lesson.vocabulary && lesson.vocabulary.length > 0) ? (
          <View className="mb-8">
            <Text className="text-h4 font-poppins-bold text-neutral-text-primary mb-3">
              Vocabulary preview
            </Text>
            <View className="gap-3">
              {lesson.vocabulary?.map((vocab) => (
                <View 
                  key={vocab.id} 
                  className="p-4 bg-neutral-surface rounded-2xl border border-neutral-border flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-body-large font-poppins-bold text-neutral-text-primary">
                      {vocab.word}
                    </Text>
                    {Boolean(vocab.pronunciation) ? (
                      <Text className="text-caption font-poppins-medium text-neutral-text-secondary mt-0.5">
                        {`Pronunciation: /${vocab.pronunciation}/`}
                      </Text>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <Text className="text-body-medium font-poppins-semibold text-primary-purple">
                      {vocab.translation}
                    </Text>
                    {Boolean(vocab.partOfSpeech) ? (
                      <Text className="text-caption font-poppins-medium text-neutral-text-secondary uppercase tracking-widest mt-0.5">
                        {vocab.partOfSpeech}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky Start Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleStart}
          className="btn-3d btn-3d-green h-14 w-full items-center justify-center"
        >
          <Text className="text-body-large font-poppins-bold text-neutral-background text-center">
            START LESSON
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 20,
    paddingBottom: 120, // space to ensure scrolling above sticky button
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
});
