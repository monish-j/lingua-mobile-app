import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePostHog } from "posthog-react-native";
import { lessons } from "../../../data/lessons";
import { images } from "../../../constants/images";
import { useAppStore } from "../../../store/useAppStore";

export default function LessonActiveScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { id } = useLocalSearchParams();
  const { completeLesson } = useAppStore();

  // Find the lesson in the dataset
  const lesson = lessons.find((l) => l.id === id);

  // Core exercise runner states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Variant 1: multiple_choice / fill_in_blank / listening options
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Variant 2: translation wordBank builder
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Variant 3: speaking voice recorder states and timeout tracking ref
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Variant 4: matching_pairs columns selections and dedicated error state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedLefts, setMatchedLefts] = useState<string[]>([]);
  const [errorLeft, setErrorLeft] = useState<string | null>(null);
  const [errorRight, setErrorRight] = useState<string | null>(null);

  const navigation = useNavigation();
  const hasAbandonedCaptured = useRef(false);

  const captureAbandonment = React.useCallback(() => {
    if (!lesson || isFinished || hasAbandonedCaptured.current) return;
    hasAbandonedCaptured.current = true;
    posthog.capture("lesson_abandoned", {
      lesson_id: lesson.id,
      activity_index: currentIdx,
      activity_count: lesson.activities.length,
    });
  }, [isFinished, lesson, currentIdx, posthog]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      captureAbandonment();
    });
    return unsubscribe;
  }, [navigation, captureAbandonment]);

  // Unmount cleanup for simulated recording timer
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

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
  const progressPercent = (currentIdx / lesson.activities.length) * 100;

  // Single option selection handler (multiple_choice, fill_in_blank, listening)
  const handleSelectOption = (option: string) => {
    if (hasChecked) return;
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  // Answer validation and correctness checker
  const handleCheckAnswer = () => {
    let correct = false;

    if (
      currentActivity.type === "multiple_choice" || 
      currentActivity.type === "fill_in_blank" || 
      currentActivity.type === "listening"
    ) {
      if (!selectedOption) return;
      const targetAns = "correctAnswer" in currentActivity ? String(currentActivity.correctAnswer) : "";
      correct = selectedOption.toLowerCase().trim() === targetAns.toLowerCase().trim();
    } 
    else if (currentActivity.type === "translation") {
      if (selectedWords.length === 0) return;
      const userSentence = selectedWords.join(" ").toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
      const validSentences = "correctTranslations" in currentActivity 
        ? (currentActivity.correctTranslations as string[]).map(t => t.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim())
        : [];
      correct = validSentences.includes(userSentence);
    } 
    else if (currentActivity.type === "speaking") {
      correct = speechText.length > 0;
    } 
    else if (currentActivity.type === "matching_pairs") {
      const totalPairs = currentActivity.pairs.length;
      correct = matchedLefts.length === totalPairs;
    }

    posthog.capture("lesson_answer_checked", {
      lesson_id: lesson.id,
      activity_index: currentIdx,
      activity_type: currentActivity.type,
      is_correct: correct,
    });
    setIsCorrect(correct);
    setHasChecked(true);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  // Advance to next card or finish lesson
  const handleNext = () => {
    // Clear and reset the recording timer if running
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    // Reset all state variables
    setSelectedOption(null);
    setSelectedWords([]);
    setIsRecording(false);
    setSpeechText("");
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedLefts([]);
    setErrorLeft(null);
    setErrorRight(null);
    setHasChecked(false);

    if (currentIdx < lesson.activities.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      posthog.capture("lesson_completed", {
        lesson_id: lesson.id,
        activity_count: lesson.activities.length,
        lesson_xp: lesson.xp,
      });
      completeLesson(lesson.id);
      setIsFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const handleFinish = () => {
    router.replace("/(tabs)/learn");
  };

  const handleExitLesson = () => {
    captureAbandonment();
    router.replace("/(tabs)/home");
  };

  // Render Lesson Complete Screen
  if (isFinished) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View className="flex-1 items-center justify-center px-6 py-12">
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

  // Derive if option select cards should render
  let optionsList: string[] = [];
  if ("options" in currentActivity && Array.isArray(currentActivity.options)) {
    optionsList = currentActivity.options;
  }

  // Compute state validation check using type safety without direct casts
  let canCheck = false;
  if (
    currentActivity.type === "multiple_choice" || 
    currentActivity.type === "fill_in_blank" || 
    currentActivity.type === "listening"
  ) {
    canCheck = selectedOption !== null;
  } else if (currentActivity.type === "translation") {
    canCheck = selectedWords.length > 0;
  } else if (currentActivity.type === "speaking") {
    canCheck = speechText.length > 0;
  } else if (currentActivity.type === "matching_pairs") {
    canCheck = matchedLefts.length === currentActivity.pairs.length;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header bar */}
      <View className="flex-row items-center px-6 py-4 bg-neutral-background relative">
        <TouchableOpacity
          onPress={handleExitLesson}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <View className="flex-1 h-3 bg-neutral-surface rounded-full mx-4 overflow-hidden border border-neutral-border">
          <View className="h-full bg-primary-green rounded-full" style={{ width: `${progressPercent}%` }} />
        </View>

        <Text className="text-caption font-poppins-bold text-neutral-text-secondary">
          {currentIdx + 1}/{lesson.activities.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Activity Title */}
        <Text className="text-caption font-poppins-bold text-primary-purple uppercase tracking-widest mb-2">
          {currentActivity.type.replace("_", " ")}
        </Text>
        <Text className="text-h2 font-poppins-bold text-neutral-text-primary mb-6">
          {currentActivity.question}
        </Text>

        {/* 1. RENDER LISTENING AUDIO BUTTON */}
        {currentActivity.type === "listening" && "textToSpeak" in currentActivity ? (
          <View className="items-center mb-6">
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                Alert.alert("Listening Hint", `"${currentActivity.textToSpeak}"`);
              }}
              className="w-20 h-20 rounded-full bg-primary-purple items-center justify-center shadow-lg"
            >
              <Feather name="volume-2" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-body-small text-neutral-text-secondary mt-2">
              Tap to hear active audio hint
            </Text>
          </View>
        ) : null}

        {/* 2. RENDER MULTIPLE CHOICE / FILL IN BLANK / LISTENING OPTIONS */}
        {optionsList.length > 0 ? (
          <View className="gap-3">
            {optionsList.map((option, idx) => {
              const isSelected = selectedOption === option;
              let cardStyle = "border-neutral-border bg-white";
              if (isSelected) cardStyle = "border-primary-purple bg-primary-purple/5";
              if (hasChecked) {
                const correctAns = "correctAnswer" in currentActivity ? String(currentActivity.correctAnswer) : "";
                if (option === correctAns) {
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
                  
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isSelected ? "border-primary-purple" : "border-neutral-border"
                  }`}>
                    {isSelected ? <View className="w-2.5 h-2.5 rounded-full bg-primary-purple" /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* 3. RENDER TRANSLATION COMPONENT */}
        {currentActivity.type === "translation" && "wordBank" in currentActivity ? (
          <View className="gap-6">
            <View className="p-4 bg-neutral-surface border border-neutral-border rounded-2xl flex-row items-center gap-3">
              <Feather name="message-square" size={20} color="#6C4EF5" />
              <Text className="text-body-large font-poppins-semibold text-neutral-text-primary">
                {"sentence" in currentActivity ? String(currentActivity.sentence) : ""}
              </Text>
            </View>

            {/* Translation Output board */}
            <View className="min-h-[100px] p-4 bg-white border-2 border-dashed border-neutral-border rounded-2xl flex-row flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <Text className="text-body-medium text-neutral-text-secondary font-poppins-medium">
                  Tap words from the bank to assemble your translation...
                </Text>
              ) : (
                selectedWords.map((word, index) => (
                  <TouchableOpacity
                    key={`${word}-${index}`}
                    disabled={hasChecked}
                    onPress={() => setSelectedWords(prev => prev.filter((_, i) => i !== index))}
                    className="px-3.5 py-2 bg-primary-purple/10 border border-primary-purple rounded-xl flex-row items-center gap-1.5"
                  >
                    <Text className="text-body-medium font-poppins-semibold text-primary-purple">
                      {word}
                    </Text>
                    {!hasChecked ? <Feather name="x" size={14} color="#6C4EF5" /> : null}
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Translation Word Bank */}
            <View className="flex-row flex-wrap gap-2.5 justify-center mt-4">
              {(currentActivity.wordBank as string[]).map((word, idx) => {
                const occurrences = selectedWords.filter(w => w === word).length;
                const totalInBank = (currentActivity.wordBank as string[]).filter(w => w === word).length;
                const isUsed = occurrences >= totalInBank;

                return (
                  <TouchableOpacity
                    key={idx}
                    disabled={isUsed || hasChecked}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setSelectedWords(prev => [...prev, word]);
                    }}
                    className={`px-4 py-2.5 rounded-xl border-2 ${
                      isUsed 
                        ? "bg-neutral-border/30 border-neutral-border/30 opacity-40" 
                        : "bg-white border-neutral-border active:bg-neutral-surface"
                    }`}
                  >
                    <Text className={`text-body-medium font-poppins-semibold ${
                      isUsed ? "text-neutral-text-secondary" : "text-neutral-text-primary"
                    }`}>
                      {word}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* 4. RENDER SPEAKING COMPONENT */}
        {currentActivity.type === "speaking" && "textToSpeak" in currentActivity ? (
          <View className="items-center gap-6 py-6">
            <View className="items-center p-6 bg-neutral-surface border border-neutral-border rounded-2xl w-full">
              <Text className="text-h2 font-poppins-bold text-primary-purple text-center">
                {String(currentActivity.textToSpeak)}
              </Text>
              <Text className="text-body-small text-neutral-text-secondary text-center mt-2 italic font-poppins-medium">
                {"\"" + ("translation" in currentActivity ? String(currentActivity.translation) : "") + "\""}
              </Text>
            </View>

            <TouchableOpacity
              disabled={hasChecked}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                if (isRecording) {
                  if (recordingTimeoutRef.current) {
                    clearTimeout(recordingTimeoutRef.current);
                    recordingTimeoutRef.current = null;
                  }
                  setIsRecording(false);
                } else {
                  setIsRecording(true);
                  recordingTimeoutRef.current = setTimeout(() => {
                    if (currentActivity.type === "speaking" && "textToSpeak" in currentActivity) {
                      setSpeechText(String(currentActivity.textToSpeak));
                    }
                    setIsRecording(false);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    recordingTimeoutRef.current = null;
                  }, 2000);
                }
              }}
              className={`w-24 h-24 rounded-full items-center justify-center border-4 ${
                isRecording 
                  ? "bg-semantic-error border-semantic-error/30" 
                  : speechText 
                    ? "bg-semantic-success border-semantic-success/30" 
                    : "bg-primary-purple border-primary-purple/30"
              }`}
            >
              <Feather name={isRecording ? "mic-off" : "mic"} size={36} color="#FFFFFF" />
            </TouchableOpacity>

            <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary text-center">
              {isRecording 
                ? "Recording... Repeat the text above" 
                : speechText 
                  ? "Voice checked successfully!" 
                  : "Tap to record your voice review"
              }
            </Text>
          </View>
        ) : null}

        {/* 5. RENDER MATCHING PAIRS COMPONENT */}
        {currentActivity.type === "matching_pairs" ? (
          <View className="gap-4">
            <Text className="text-body-small text-neutral-text-secondary text-center mb-2">
              Select a word on the left and its match on the right!
            </Text>
            {(() => {
              const matchingActivity = currentActivity;
              return (
                <View className="flex-row gap-6 mt-2">
                  {/* Left Column (Foreign Word) */}
                  <View className="flex-1 gap-3">
                    {matchingActivity.pairs.map((pair) => {
                      const isMatched = matchedLefts.includes(pair.left);
                      const isSelected = selectedLeft === pair.left;
                      const isError = errorLeft === pair.left;
                      
                      let btnStyle = "border-neutral-border bg-white";
                      if (isMatched) btnStyle = "border-semantic-success bg-semantic-success/5 opacity-40";
                      else if (isError) btnStyle = "border-semantic-error bg-semantic-error/5";
                      else if (isSelected) btnStyle = "border-primary-purple bg-primary-purple/5";

                      return (
                        <TouchableOpacity
                          key={pair.left}
                          disabled={isMatched || hasChecked}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            setSelectedLeft(pair.left);
                            
                            if (selectedRight) {
                              const match = matchingActivity.pairs.find(
                                p => p.left === pair.left && p.right === selectedRight
                              );
                              if (match) {
                                setMatchedLefts(prev => [...prev, pair.left]);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                              } else {
                                setErrorLeft(pair.left);
                                setErrorRight(selectedRight);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
                                setTimeout(() => {
                                  setErrorLeft(null);
                                  setErrorRight(null);
                                }, 800);
                              }
                              setSelectedLeft(null);
                              setSelectedRight(null);
                            }
                          }}
                          className={`p-4 border-2 rounded-2xl items-center justify-center h-14 ${btnStyle}`}
                        >
                          <Text className={`text-body-medium font-poppins-bold ${
                            isMatched 
                              ? "text-semantic-success" 
                              : isError
                                ? "text-semantic-error"
                                : isSelected 
                                  ? "text-primary-purple" 
                                  : "text-neutral-text-primary"
                          }`}>
                            {pair.left}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Right Column (English translation) */}
                  <View className="flex-1 gap-3">
                    {matchingActivity.pairs.map((pair) => {
                      const isMatched = matchedLefts.includes(pair.left);
                      const isSelected = selectedRight === pair.right;
                      const isError = errorRight === pair.right;
                      
                      let btnStyle = "border-neutral-border bg-white";
                      if (isMatched) btnStyle = "border-semantic-success bg-semantic-success/5 opacity-40";
                      else if (isError) btnStyle = "border-semantic-error bg-semantic-error/5";
                      else if (isSelected) btnStyle = "border-primary-purple bg-primary-purple/5";

                      return (
                        <TouchableOpacity
                          key={pair.right}
                          disabled={isMatched || hasChecked}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            setSelectedRight(pair.right);
                            
                            if (selectedLeft) {
                              const match = matchingActivity.pairs.find(
                                p => p.left === selectedLeft && p.right === pair.right
                              );
                              if (match) {
                                setMatchedLefts(prev => [...prev, selectedLeft]);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                              } else {
                                setErrorLeft(selectedLeft);
                                setErrorRight(pair.right);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
                                setTimeout(() => {
                                  setErrorLeft(null);
                                  setErrorRight(null);
                                }, 800);
                              }
                              setSelectedLeft(null);
                              setSelectedRight(null);
                            }
                          }}
                          className={`p-4 border-2 rounded-2xl items-center justify-center h-14 ${btnStyle}`}
                        >
                          <Text className={`text-body-medium font-poppins-bold ${
                            isMatched 
                              ? "text-semantic-success" 
                              : isError
                                ? "text-semantic-error"
                                : isSelected 
                                  ? "text-primary-purple" 
                                  : "text-neutral-text-primary"
                          }`}>
                            {pair.right}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })()}
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky Bottom Action Panel */}
      <View style={styles.actionPanel}>
        {hasChecked ? (
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
                  {isCorrect ? "Excellent job!" : "Incorrect Answer"}
                </Text>
                <Text className="text-body-small text-neutral-text-secondary">
                  {isCorrect 
                    ? `Earned +${currentActivity.xpReward} XP!` 
                    : ("correctAnswer" in currentActivity 
                        ? `Correct answer: ${currentActivity.correctAnswer}` 
                        : "Good try!")
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
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!canCheck}
            onPress={handleCheckAnswer}
            className={`btn-3d ${
              canCheck ? "btn-3d-green" : "bg-neutral-border border-b-0"
            } h-14 w-full items-center justify-center`}
            style={!canCheck ? { opacity: 0.5 } : {}}
          >
            <Text className={`text-body-large font-poppins-bold ${
              canCheck ? "text-neutral-background" : "text-neutral-text-secondary"
            }`}>
              CHECK ANSWER
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
