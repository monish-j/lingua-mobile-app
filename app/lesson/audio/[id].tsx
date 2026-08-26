import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { lessons } from "../../../data/lessons";
import { units } from "../../../data/units";
import { languages } from "../../../data/languages";
import { images } from "../../../constants/images";
import { useAppStore } from "../../../store/useAppStore";

export default function AudioLessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { completeLesson } = useAppStore();

  // Find the lesson and language details
  const lesson = lessons.find((l) => l.id === id);
  const unit = units.find((u) => u.id === lesson?.unitId);
  const language = languages.find((l) => l.code === unit?.languageCode) || languages[0];

  // Localized fallback greeting based on language
  const greeting =
    language.code === "es" ? "¡Hola!" :
    language.code === "fr" ? "Bonjour !" :
    language.code === "ja" ? "こんにちは !" :
    language.code === "de" ? "Hallo !" :
    "Hello!";

  // AI Teacher prompt details (with dynamic fallbacks)
  const teacherPrompt = lesson?.aiTeacherPrompt || {
    systemPrompt: `You are a supportive AI teacher for ${language.name}.`,
    welcomeMessage: `${greeting} Welcome to your ${language.name} lesson: ${lesson?.title || "Audio Lesson"}. Let's practice!`,
    suggestedTopics: ["Greeting each other", "Reviewing phrases"],
    keyVocabulary: lesson?.vocabulary?.map((v) => v.word) || [],
    keyPhrases: lesson?.phrases?.map((p) => p.phrase) || [],
  };

  // State Management
  const [status, setStatus] = useState<"connecting" | "online" | "listening" | "responded">("connecting");
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [teacherMessage, setTeacherMessage] = useState("");
  const [teacherTranslation, setTeacherTranslation] = useState("");
  const [userSpeech, setUserSpeech] = useState<string | null>(null);
  const [isSpeakingSimulated, setIsSpeakingSimulated] = useState(false);
  const [showLessonDetails, setShowLessonDetails] = useState(false);

  // Performance ratings states (start empty or placeholder, become graded after interaction)
  const [speakingRating, setSpeakingRating] = useState("---");
  const [pronunciationRating, setPronunciationRating] = useState("---");
  const [grammarRating, setGrammarRating] = useState("---");

  // Animations
  const dotScale = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  // Simulate online pulse animation
  useEffect(() => {
    if (status === "connecting") return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [status, dotScale]);

  // Connect Simulation & Initialize Teacher
  useEffect(() => {
    // Initial delay to simulate connecting to Stream
    const timer = setTimeout(() => {
      setStatus("online");
      setTeacherMessage(teacherPrompt.welcomeMessage);
      
      // Attempt translation fallback if not explicitly provided
      const translation = 
        lesson?.phrases?.find(p => p.phrase === teacherPrompt.welcomeMessage)?.translation ||
        "Hello! Welcome to your language lesson. How are you?";
      setTeacherTranslation(translation);

      // Fade in response bubble
      Animated.timing(bubbleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [id, bubbleOpacity, lesson?.phrases, teacherPrompt.welcomeMessage]);

  // 1. Transition status to "listening" and trigger haptics when mic is unmuted
  useEffect(() => {
    if (isMicActive && !isSpeakingSimulated && status === "online") {
      setStatus("listening");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [isMicActive, isSpeakingSimulated, status]);

  // 2. Perform speech simulation and completion when status is "listening"
  useEffect(() => {
    if (status === "listening" && !isSpeakingSimulated) {
      const targetPhrase = lesson?.phrases?.[0]?.phrase || "Practice phrase";

      const speakingTimer = setTimeout(() => {
        // User "spoke"
        setUserSpeech(targetPhrase);
        setStatus("responded");
        setIsSpeakingSimulated(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        // Teacher responds to user
        const feedbackMessage = 
          language.code === "es" ? "¡Excelente pronunciación! Eso es exactamente correcto." :
          language.code === "fr" ? "Excellent ! C'est tout à fait correct." :
          language.code === "ja" ? "素晴らしい！完璧ですね。" :
          "Excellent! That is absolutely correct.";
          
        const feedbackTranslation = 
          language.code === "es" ? "Excellent pronunciation! That is exactly correct." :
          language.code === "fr" ? "Excellent! That is exactly correct." :
          language.code === "ja" ? "Wonderful! That's perfect." :
          "Excellent! That is exactly correct.";

        setTeacherMessage(feedbackMessage);
        setTeacherTranslation(feedbackTranslation);

        // Grade the user's simulation
        setSpeakingRating("Excellent");
        setPronunciationRating("Great");
        setGrammarRating("Good");

        // Complete lesson in background storage
        if (lesson) {
          completeLesson(lesson.id);
        }
      }, 3500);

      return () => clearTimeout(speakingTimer);
    }
  }, [status, isSpeakingSimulated, lesson, language.code, completeLesson]);

  // Handle speaker tap to repeat message
  const handlePlayAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      "Audio Replay",
      `Simulating text-to-speech for: "${teacherMessage}"`,
      [{ text: "OK", style: "default" }]
    );
  };

  // Handle call wrap up / end call
  const handleEndCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    
    if (isSpeakingSimulated) {
      Alert.alert(
        "Call Completed! 🎉",
        `You finished the audio lesson and earned +${lesson?.xp || 15} XP! Great work!`,
        [
          {
            text: "Return Home",
            onPress: () => router.replace("/(tabs)/learn"),
          },
        ]
      );
    } else {
      Alert.alert(
        "End Lesson?",
        "Are you sure you want to end this audio lesson early? Your progress will not be saved.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "End Call",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View className="flex-1 items-center justify-center bg-neutral-background px-6">
          <Feather name="alert-circle" size={48} color="#FF4D4F" className="mb-4" />
          <Text className="text-h2 font-poppins-bold text-neutral-text-primary text-center mb-2">
            Lesson Not Found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="btn-3d btn-3d-purple h-12 px-6 items-center justify-center"
          >
            <Text className="text-body-medium font-poppins-bold text-neutral-background">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER COMPONENT */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-neutral-border bg-white">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1 mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="chevron-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <Text className="text-body-large font-poppins-bold text-neutral-text-primary leading-tight">
              AI Teacher
            </Text>
            <View className="flex-row items-center mt-0.5">
              {status !== "connecting" && (
                <Animated.View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#22C55E",
                    marginRight: 6,
                    transform: [{ scale: dotScale }],
                  }}
                />
              )}
              <Text className="text-caption font-poppins-semibold text-neutral-text-secondary">
                {status === "connecting" ? "Connecting..." : `Online • ${language.name}`}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Audio call active icon */}
          <View className="bg-neutral-surface p-2 rounded-xl border border-neutral-border">
            <Feather name="phone" size={16} color="#6C4EF5" />
          </View>

          {/* XP pill */}
          <View className="bg-[#FFF4E6] border border-[#FFE0B2] px-3 py-1.5 rounded-full flex-row items-center gap-1">
            <Feather name="zap" size={13} color="#FF8A00" />
            <Text className="text-caption font-poppins-bold text-[#FF8A00]">
              +{lesson.xp} XP
            </Text>
          </View>

          {/* User Placeholder */}
          <View className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden items-center justify-center border border-neutral-border">
            <Feather name="user" size={16} color="#64748B" />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-slate-50"
      >
        {/* 2. TEACHER CARD BACKDROP */}
        <View className="mx-4 mt-4 relative rounded-3xl overflow-hidden shadow-md bg-violet-900 border border-violet-800" style={{ height: 350 }}>
          {/* Customized backdrop layout representing room/classroom */}
          <View className="absolute inset-0 bg-gradient-to-tr from-violet-950 via-indigo-900 to-purple-800 opacity-90" />
          
          {/* Background decorative circles representing cozy lighting */}
          <View className="absolute w-32 h-32 rounded-full bg-yellow-500/10 -top-10 -left-10" />
          <View className="absolute w-48 h-48 rounded-full bg-purple-500/15 -bottom-20 -right-20" />
          
          {/* Main Mascot Illustration */}
          <View className="absolute inset-x-0 top-6 items-center">
            <Image
              source={images.mascotWelcome}
              className="w-48 h-48"
              resizeMode="contain"
            />
          </View>

          {/* 3. TEACHER RESPONSE BUBBLE */}
          {status !== "connecting" && (
            <Animated.View
              style={[
                styles.bubbleContainer,
                { opacity: bubbleOpacity },
              ]}
              className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg border border-slate-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-body-medium font-poppins-bold text-neutral-text-primary">
                    {teacherMessage}
                  </Text>
                  {showSubtitles && (
                    <Text className="text-caption font-poppins-medium text-neutral-text-secondary mt-1">
                      {teacherTranslation}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={handlePlayAudio}
                  className="w-10 h-10 rounded-full bg-violet-100 items-center justify-center active:bg-violet-200"
                >
                  <Feather name="volume-2" size={20} color="#6C4EF5" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Dynamic Speech Status Prompt */}
        <View className="items-center mt-3 px-6 h-8">
          {status === "connecting" && (
            <ActivityIndicator size="small" color="#6C4EF5" />
          )}
          {status === "listening" && (
            <View className="flex-row items-center bg-violet-100 px-4 py-1 rounded-full gap-1.5 border border-violet-200">
              <View className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              <Text className="text-caption font-poppins-bold text-violet-700 text-center">
                Listening... Try saying: &quot;{lesson?.phrases?.[0]?.phrase || "Hello"}&quot;
              </Text>
            </View>
          )}
          {status === "online" && !isSpeakingSimulated && (
            <Text className="text-caption font-poppins-bold text-neutral-text-secondary bg-white px-3 py-1 rounded-full border border-neutral-border shadow-xs">
              🎙️ Tap the Mic to respond
            </Text>
          )}
          {status === "responded" && (
            <View className="bg-green-50 border border-green-200 px-4 py-1 rounded-full">
              <Text className="text-caption font-poppins-bold text-green-700">
                ✓ Lesson completed successfully!
              </Text>
            </View>
          )}
        </View>

        {/* 4. AUDIO LESSON CONTROLS */}
        <View className="flex-row justify-around items-center px-6 py-4 mt-2">
          {/* Camera Button */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setIsCameraOn(!isCameraOn);
              }}
              className={`w-14 h-14 rounded-full items-center justify-center shadow-sm border border-slate-200 ${
                isCameraOn ? "bg-white" : "bg-slate-200"
              }`}
            >
              <Feather
                name={isCameraOn ? "video" : "video-off"}
                size={22}
                color={isCameraOn ? "#1E293B" : "#64748B"}
              />
            </TouchableOpacity>
            <Text className="text-caption font-poppins-semibold text-neutral-text-secondary mt-1.5">
              Camera
            </Text>
          </View>

          {/* Mic Button */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => {
                if (status === "connecting") return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setIsMicActive(!isMicActive);
              }}
              className={`w-16 h-16 rounded-full items-center justify-center shadow-md border ${
                isMicActive
                  ? "bg-violet-600 border-violet-500"
                  : "bg-white border-slate-200"
              }`}
            >
              <Ionicons
                name={isMicActive ? "mic" : "mic-off"}
                size={26}
                color={isMicActive ? "#FFFFFF" : "#1E293B"}
              />
            </TouchableOpacity>
            <Text className="text-caption font-poppins-semibold text-neutral-text-secondary mt-1.5">
              Mic
            </Text>
          </View>

          {/* Subtitles Button */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setShowSubtitles(!showSubtitles);
              }}
              className={`w-14 h-14 rounded-full items-center justify-center shadow-sm border border-slate-200 ${
                showSubtitles ? "bg-white" : "bg-slate-200"
              }`}
            >
              <Feather
                name="message-square"
                size={22}
                color={showSubtitles ? "#1E293B" : "#64748B"}
              />
            </TouchableOpacity>
            <Text className="text-caption font-poppins-semibold text-neutral-text-secondary mt-1.5">
              Subtitles
            </Text>
          </View>

          {/* End Call Button */}
          <View className="items-center">
            <TouchableOpacity
              onPress={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-500 items-center justify-center shadow-md active:bg-red-600"
            >
              <Feather name="phone-off" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-caption font-poppins-semibold text-red-500 mt-1.5">
              End Call
            </Text>
          </View>
        </View>

        {/* User spoken bubble simulator */}
        {userSpeech && (
          <View className="mx-6 mb-4 self-end bg-violet-100 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] border border-violet-200 shadow-sm">
            <Text className="text-caption font-poppins-bold text-violet-800 mb-0.5">You</Text>
            <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary">
              {userSpeech}
            </Text>
          </View>
        )}

        {/* 5. PERFORMANCE FEEDBACK CARD */}
        <View className="mx-4 mt-2 mb-4 bg-white rounded-2xl p-4 shadow-xs border border-neutral-border">
          <Text className="text-caption font-poppins-bold text-neutral-text-secondary uppercase tracking-widest mb-3 text-center">
            Live Session Feedback
          </Text>
          <View className="flex-row justify-around items-center">
            {/* Speaking */}
            <View className="items-center">
              <Text className="text-caption font-poppins-semibold text-neutral-text-secondary">
                Speaking
              </Text>
              <Text
                className={`text-body-medium font-poppins-bold mt-1 ${
                  speakingRating === "---" ? "text-slate-400" : "text-primary-green"
                }`}
              >
                {speakingRating}
              </Text>
            </View>
            <View className="w-[1px] h-8 bg-neutral-border" />

            {/* Pronunciation */}
            <View className="items-center">
              <Text className="text-caption font-poppins-semibold text-neutral-text-secondary">
                Pronunciation
              </Text>
              <Text
                className={`text-body-medium font-poppins-bold mt-1 ${
                  pronunciationRating === "---" ? "text-slate-400" : "text-primary-blue"
                }`}
              >
                {pronunciationRating}
              </Text>
            </View>
            <View className="w-[1px] h-8 bg-neutral-border" />

            {/* Grammar */}
            <View className="items-center">
              <Text className="text-caption font-poppins-semibold text-neutral-text-secondary">
                Grammar
              </Text>
              <Text
                className={`text-body-medium font-poppins-bold mt-1 ${
                  grammarRating === "---" ? "text-slate-400" : "text-primary-purple"
                }`}
              >
                {grammarRating}
              </Text>
            </View>
          </View>
        </View>

        {/* 6. COLLAPSIBLE LESSON OBJECTIVES DRAWERS */}
        <View className="mx-4 mb-8 bg-white rounded-2xl border border-neutral-border overflow-hidden">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setShowLessonDetails(!showLessonDetails);
            }}
            className="flex-row items-center justify-between p-4 bg-slate-50 border-b border-neutral-border"
          >
            <View className="flex-row items-center gap-2">
              <Feather name="book-open" size={16} color="#6C4EF5" />
              <Text className="text-body-medium font-poppins-bold text-neutral-text-primary">
                Lesson Syllabus: {lesson.title}
              </Text>
            </View>
            <Feather
              name={showLessonDetails ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {showLessonDetails && (
            <View className="p-4 gap-4">
              {/* Goals */}
              <View>
                <Text className="text-caption font-poppins-bold text-neutral-text-secondary uppercase tracking-widest mb-1.5">
                  Objectives
                </Text>
                {lesson.goals?.map((goal, idx) => (
                  <View key={idx} className="flex-row items-center gap-2 mt-1">
                    <Feather name="check" size={12} color="#21C16B" />
                    <Text className="text-body-small font-poppins-medium text-neutral-text-primary">
                      {goal}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Phrases */}
              <View>
                <Text className="text-caption font-poppins-bold text-neutral-text-secondary uppercase tracking-widest mb-1.5">
                  Practice Phrases
                </Text>
                {lesson.phrases?.map((ph, idx) => (
                  <View key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-neutral-border mt-1.5">
                    <Text className="text-body-medium font-poppins-bold text-neutral-text-primary">
                      {ph.phrase}
                    </Text>
                    <Text className="text-body-small font-poppins-medium text-neutral-text-secondary mt-0.5">
                      {ph.translation}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Vocab */}
              {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                <View>
                  <Text className="text-caption font-poppins-bold text-neutral-text-secondary uppercase tracking-widest mb-1.5">
                    Vocabulary Preview
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5 mt-1">
                    {lesson.vocabulary.map((vocab) => (
                      <View
                        key={vocab.id}
                        className="bg-neutral-surface border border-neutral-border rounded-full px-3 py-1 flex-row items-center"
                      >
                        <Text className="text-body-small font-poppins-bold text-primary-purple">
                          {vocab.word}
                        </Text>
                        <Text className="text-[10px] font-poppins-medium text-neutral-text-secondary ml-1">
                          ({vocab.translation})
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
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
    paddingBottom: 40,
  },
  bubbleContainer: {
    left: 16,
    right: 16,
    bottom: 16,
  },
});
