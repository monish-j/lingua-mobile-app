import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { lessons } from "../../../data/lessons";
import { images } from "../../../constants/images";

export default function LessonActiveScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Find the lesson in the dataset
  const lesson = lessons.find((l) => l.id === id);

  // State to track current activity index and user selection
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!lesson || !lesson.activities || lesson.activities.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View className="flex-1 items-center justify-center bg-neutral-background px-6">
          <Feather name="alert-circle" size={48} color="#FF4D4F" className="mb-4" />
          <Text className="text-h2 font-poppins-bold text-neutral-text-primary text-center mb-2">
            No Activities Found
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

  const currentActivity = lesson.activities[currentIdx];
  const progressPercent = ((currentIdx) / lesson.activities.length) * 100;

  const handleSelectOption = (option: string) => {
    if (hasChecked) return;
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;

    let correct = false;
    // Check answer based on activity type
    if (currentActivity.type === "multiple_choice" && "correctAnswer" in currentActivity) {
      correct = selectedOption === currentActivity.correctAnswer;
    } else if (currentActivity.type === "fill_in_blank" && "correctAnswer" in currentActivity) {
      correct = selectedOption === currentActivity.correctAnswer;
    } else {
      // Default fallback for other activity types
      correct = true;
    }

    setIsCorrect(correct);
    setHasChecked(true);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  const handleNext = () => {
    // Reset state for next activity
    setSelectedOption(null);
    setHasChecked(false);
    
    if (currentIdx < lesson.activities.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const handleFinish = () => {
    router.replace("/(tabs)/home");
  };

  // Render Lesson Complete Screen
  if (isFinished) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View className="flex-1 items-center justify-center px-6 py-12">
          {/* Celebrating Mascot */}
          <Image 
            source={images.mascotWelcome}
            style={{ width: 200, height: 200, marginBottom: 24 }}
            resizeMode="contain"
          />

          <Text className="text-h1 font-poppins-bold text-neutral-text-primary text-center mb-2">
            Lesson Complete!
          </Text>
          <Text className="text-body-large text-neutral-text-secondary text-center mb-8">
            {"You've completed \"" + lesson.title + "\" and earned +" + lesson.xp + " XP!"}
          </Text>

          {/* XP Reward card info */}
          <View className="w-full bg-[#FFF4E6] border border-[#FFE0B2] p-5 rounded-2xl flex-row items-center justify-between mb-12">
            <View className="flex-row items-center gap-3">
              <View className="bg-semantic-streak/10 p-2.5 rounded-xl">
                <Feather name="zap" size={24} color="#FF8A00" />
              </View>
              <View>
                <Text className="text-body-medium font-poppins-bold text-[#FF8A00]">
                  XP Earned
                </Text>
                <Text className="text-body-small text-neutral-text-secondary">
                  Added to your weekly profile
                </Text>
              </View>
            </View>
            <Text className="text-h2 font-poppins-bold text-[#FF8A00]">
              +{lesson.xp}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleFinish}
            className="btn-3d btn-3d-green h-14 w-full items-center justify-center"
          >
            <Text className="text-body-large font-poppins-bold text-neutral-background text-center">
              CONTINUE
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Determine active options
  let options: string[] = [];
  if ("options" in currentActivity) {
    options = currentActivity.options;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Close and Progress Bar */}
      <View className="flex-row items-center px-6 py-4 bg-neutral-background relative">
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={24} color="#6B7280" />
        </TouchableOpacity>
        
        {/* Progress Bar Container */}
        <View className="flex-1 h-3 bg-neutral-surface rounded-full mx-4 overflow-hidden border border-neutral-border">
          <View className="h-full bg-primary-green rounded-full" style={{ width: `${progressPercent}%` }} />
        </View>

        <Text className="text-caption font-poppins-bold text-neutral-text-secondary">
          {currentIdx + 1}/{lesson.activities.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Activity Question Header */}
        <Text className="text-caption font-poppins-bold text-primary-purple uppercase tracking-widest mb-2">
          {currentActivity.type.replace("_", " ")}
        </Text>
        <Text className="text-h2 font-poppins-bold text-neutral-text-primary mb-6">
          {currentActivity.question}
        </Text>

        {/* Options list */}
        {options.length > 0 ? (
          <View className="gap-3">
            {options.map((option, idx) => {
              const isSelected = selectedOption === option;
              
              let cardStyle = "border-neutral-border bg-white";
              if (isSelected) cardStyle = "border-primary-purple bg-primary-purple/5";
              if (hasChecked) {
                if (option === ("correctAnswer" in currentActivity ? currentActivity.correctAnswer : "")) {
                  cardStyle = "border-semantic-success bg-semantic-success/5";
                } else if (isSelected && !isCorrect) {
                  cardStyle = "border-semantic-error bg-semantic-error/5";
                }
              }

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => handleSelectOption(option)}
                  disabled={hasChecked}
                  className={`p-4 rounded-2xl border-2 flex-row items-center justify-between ${cardStyle}`}
                >
                  <Text className={`text-body-large font-poppins-semibold flex-1 ${
                    isSelected ? "text-primary-purple" : "text-neutral-text-primary"
                  }`}>
                    {option}
                  </Text>
                  
                  {/* Circle Selection Indicator */}
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isSelected ? "border-primary-purple" : "border-neutral-border"
                  }`}>
                    {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-primary-purple" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Fallback view for other interactive styles (e.g. matching pairs) */
          <View className="p-8 bg-neutral-surface border border-neutral-border rounded-3xl items-center justify-center">
            <Feather name="smile" size={48} color="#6C4EF5" className="mb-4" />
            <Text className="text-body-medium font-poppins-bold text-neutral-text-primary text-center">
              Practice this exercise mentally!
            </Text>
            <Text className="text-body-small text-neutral-text-secondary text-center mt-1">
              Select complete below to proceed.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Panel */}
      <View style={styles.actionPanel}>
        {hasChecked ? (
          /* Banner Feedback View */
          <View className="mb-4">
            <View className={`p-4 rounded-2xl flex-row items-center gap-3 mb-4 ${
              isCorrect ? "bg-semantic-success/10 border border-semantic-success/20" : "bg-semantic-error/10 border border-semantic-error/20"
            }`}>
              <Feather 
                name={isCorrect ? "check-circle" : "alert-circle"} 
                size={24} 
                color={isCorrect ? "#21C16B" : "#FF4D4F"} 
              />
              <View className="flex-1">
                <Text className={`text-body-medium font-poppins-bold ${
                  isCorrect ? "text-semantic-success" : "text-semantic-error"
                }`}>
                  {isCorrect ? "Excellent job!" : "Correct answer:"}
                </Text>
                <Text className="text-body-small text-neutral-text-secondary">
                  {isCorrect 
                    ? `Earned +${currentActivity.xpReward} XP!` 
                    : ("correctAnswer" in currentActivity ? (currentActivity.correctAnswer as string) : "Good try!")
                  }
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleNext}
              className="btn-3d btn-3d-green h-14 w-full items-center justify-center"
            >
              <Text className="text-body-large font-poppins-bold text-neutral-background text-center">
                CONTINUE
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Check Answer trigger button */
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!selectedOption && options.length > 0}
            onPress={options.length > 0 ? handleCheckAnswer : handleNext}
            className={`btn-3d ${
              (selectedOption || options.length === 0) ? "btn-3d-green" : "bg-neutral-border border-b-0"
            } h-14 w-full items-center justify-center`}
            style={(!selectedOption && options.length > 0) ? { opacity: 0.5 } : {}}
          >
            <Text className={`text-body-large font-poppins-bold ${
              (selectedOption || options.length === 0) ? "text-neutral-background" : "text-neutral-text-secondary"
            }`}>
              {options.length > 0 ? "CHECK ANSWER" : "CONTINUE"}
            </Text>
          </TouchableOpacity>
        )}
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
    paddingBottom: 140,
  },
  actionPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
});
