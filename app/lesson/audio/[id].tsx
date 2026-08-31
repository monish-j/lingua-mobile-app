import React, { useState, useEffect, useRef, useMemo } from "react";
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
  NativeModules,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useUser } from "@clerk/expo";
import {
  StreamVideo,
  StreamCall,
  Call,
  CallingState,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";

import { lessons } from "../../../data/lessons";
import { units } from "../../../data/units";
import { languages } from "../../../data/languages";
import { images } from "../../../constants/images";
import { useAppStore } from "../../../store/useAppStore";
import {
  getOrCreateStreamVideoClient,
  createStreamCallSession,
} from "../../../lib/stream";

const isWebRTCAvailable = Boolean(NativeModules.WebRTCModule);

export default function AudioLessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { completeLesson } = useAppStore();
  const { user: clerkUser } = useUser();

  // Find the lesson and language details
  const lesson = lessons.find((l) => l.id === id);
  const unit = units.find((u) => u.id === lesson?.unitId);
  const language =
    languages.find((l) => l.code === unit?.languageCode) || languages[0];

  // Localized fallback greeting based on language
  const greeting =
    language.code === "es"
      ? "¡Hola!"
      : language.code === "fr"
      ? "Bonjour !"
      : language.code === "ja"
      ? "こんにちは !"
      : language.code === "de"
      ? "Hallo !"
      : "Hello!";

  // AI Teacher prompt details (with dynamic fallbacks)
  const teacherPrompt = lesson?.aiTeacherPrompt || {
    systemPrompt: `You are a supportive AI teacher for ${language.name}.`,
    welcomeMessage: `${greeting} Welcome to your ${language.name} lesson: ${
      lesson?.title || "Audio Lesson"
    }. Let's practice!`,
    suggestedTopics: ["Greeting each other", "Reviewing phrases"],
    keyVocabulary: lesson?.vocabulary?.map((v) => v.word) || [],
    keyPhrases: lesson?.phrases?.map((p) => p.phrase) || [],
  };

  // Stream & Call State Management
  const [streamCall, setStreamCall] = useState<Call | null>(null);
  const [streamState, setStreamState] = useState<
    "idle" | "connecting" | "joined" | "error" | "ended"
  >("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);

  // Lesson Audio State Management
  const [status, setStatus] = useState<
    "connecting" | "online" | "listening" | "responded"
  >("connecting");
  const [isCameraOn, setIsCameraOn] = useState(false); // Audio-only by default
  const [isMicActive, setIsMicActive] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [teacherMessage, setTeacherMessage] = useState(
    teacherPrompt.welcomeMessage
  );
  const [teacherTranslation, setTeacherTranslation] = useState(
    lesson?.phrases?.find((p) => p.phrase === teacherPrompt.welcomeMessage)
      ?.translation ||
      `Hello! Welcome to your ${language.name} lesson. How are you?`
  );
  const [userSpeech, setUserSpeech] = useState<string | null>(null);
  const [isSpeakingSimulated, setIsSpeakingSimulated] = useState(false);
  const [showLessonDetails, setShowLessonDetails] = useState(false);

  // Performance ratings states
  const [speakingRating, setSpeakingRating] = useState("---");
  const [pronunciationRating, setPronunciationRating] = useState("---");
  const [grammarRating, setGrammarRating] = useState("---");

  // Animations
  const dotScale = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  // Stream User configuration
  const streamUser = useMemo(() => {
    const userId =
      clerkUser?.id ||
      `guest_${Math.random().toString(36).substring(2, 9)}`;
    const name =
      clerkUser?.fullName ||
      clerkUser?.firstName ||
      clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      "Learner";
    const image = clerkUser?.imageUrl || undefined;

    return {
      id: userId,
      name,
      image,
    };
  }, [clerkUser]);

  // Stream Video Client Singleton (instantiated only when WebRTC native module is present)
  const streamClient = useMemo(() => {
    if (!isWebRTCAvailable) return null;
    return getOrCreateStreamVideoClient(streamUser);
  }, [streamUser]);

  // Stream Call ID
  const callId = useMemo(() => {
    const sanitizedLessonId = (lesson?.id || "lesson").replace(/[^a-zA-Z0-9_-]/g, "_");
    const sanitizedUserId = streamUser.id.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `audio_${sanitizedLessonId}_${sanitizedUserId}`;
  }, [lesson?.id, streamUser.id]);

  // Online pulse animation
  useEffect(() => {
    if (streamState === "connecting" || streamState === "error") return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [streamState, dotScale]);

  // Connect & join Stream audio call
  useEffect(() => {
    if (!lesson) return;
    const currentLesson = lesson;
    let isCancelled = false;

    async function initAudioCall(activeLesson: typeof currentLesson) {
      try {
        setStreamState("connecting");
        setErrorMessage(null);
        setStatus("connecting");

        // 1. Notify server route to create/register call session
        await createStreamCallSession({
          callId,
          userId: streamUser.id,
          lessonId: activeLesson.id,
          lessonTitle: activeLesson.title,
          languageCode: language.code,
          languageName: language.name,
        }).catch((err) => {
          console.warn("[Stream API] Server call session notice:", err?.message || err);
        });

        if (isCancelled) return;

        // 2. If WebRTC native module is available, connect live Stream call
        if (isWebRTCAvailable && streamClient) {
          const call = streamClient.call("default", callId, {
            reuseInstance: true,
          });

          currentCall = call;
          setStreamCall(call);

          await call.join({ create: true });

          if (isCancelled) return;

          // 3. Audio-only configuration: disable camera and activate mic
          await call.camera.disable().catch(() => {});
          await call.microphone.enable().catch(() => {});
        }

        setStreamState("joined");
        setStatus("online");
        setIsMicActive(true);

        // Fade in teacher bubble
        Animated.timing(bubbleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();

        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      } catch (err: any) {
        console.error("[Stream Audio] Error joining call:", err);
        if (isCancelled) return;
        setStreamState("error");
        setErrorMessage(
          err?.message || "Unable to establish Stream audio call."
        );
      }
    }

    let currentCall: Call | null = null;
    initAudioCall(currentLesson);

    return () => {
      isCancelled = true;
      if (currentCall && currentCall.state.callingState !== CallingState.LEFT) {
        currentCall
          .leave()
          .catch((err) => console.warn("[Stream Audio] Leave error on cleanup:", err));
      }
    };
  }, [
    bubbleOpacity,
    callId,
    language.code,
    language.name,
    lesson,
    retryCounter,
    streamClient,
    streamUser,
  ]);

  // Transition status to "listening" when mic is unmuted
  useEffect(() => {
    if (isMicActive && !isSpeakingSimulated && status === "online") {
      setStatus("listening");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [isMicActive, isSpeakingSimulated, status]);

  // Speech practice simulation and feedback
  useEffect(() => {
    if (status === "listening" && !isSpeakingSimulated) {
      const targetPhrase =
        lesson?.phrases?.[0]?.phrase ||
        lesson?.vocabulary?.[0]?.word ||
        "Practice phrase";

      const speakingTimer = setTimeout(() => {
        setUserSpeech(targetPhrase);
        setStatus("responded");
        setIsSpeakingSimulated(true);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});

        // Teacher response
        const feedbackMessage =
          language.code === "es"
            ? "¡Excelente pronunciación! Eso es exactamente correcto."
            : language.code === "fr"
            ? "Excellent ! C'est tout à fait correct."
            : language.code === "ja"
            ? "素晴らしい！完璧ですね。"
            : language.code === "de"
            ? "Ausgezeichnet! Das ist absolut richtig."
            : "Excellent! That is absolutely correct.";

        const feedbackTranslation =
          language.code === "es"
            ? "Excellent pronunciation! That is exactly correct."
            : language.code === "fr"
            ? "Excellent! That is exactly correct."
            : language.code === "ja"
            ? "Wonderful! That's perfect."
            : language.code === "de"
            ? "Excellent! That is absolutely correct."
            : "Excellent! That is exactly correct.";

        setTeacherMessage(feedbackMessage);
        setTeacherTranslation(feedbackTranslation);

        setSpeakingRating("Excellent");
        setPronunciationRating("Great");
        setGrammarRating("Good");

        if (lesson) {
          completeLesson(lesson.id);
        }
      }, 4000);

      return () => clearTimeout(speakingTimer);
    }
  }, [status, isSpeakingSimulated, lesson, language.code, completeLesson]);

  // Handle Toggle Microphone on Stream Call
  const handleToggleMic = async () => {
    if (streamState !== "joined") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      if (streamCall) {
        await streamCall.microphone.toggle();
        const nextMicState = !isMicActive;
        setIsMicActive(nextMicState);
        if (nextMicState && status !== "responded") {
          setStatus("listening");
        }
      } else {
        setIsMicActive((prev) => !prev);
      }
    } catch (err) {
      console.error("[Stream Audio] Error toggling microphone:", err);
    }
  };

  // Handle Toggle Camera on Stream Call
  const handleToggleCamera = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      if (streamCall) {
        await streamCall.camera.toggle();
      }
      setIsCameraOn((prev) => !prev);
    } catch (err) {
      console.warn("[Stream Audio] Camera toggle note:", err);
      setIsCameraOn((prev) => !prev);
    }
  };

  // Handle Audio Replay
  const handlePlayAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      "Audio Practice",
      `Teacher says: "${teacherMessage}"\n\n(${teacherTranslation})`,
      [{ text: "OK", style: "default" }]
    );
  };

  // Handle End Call
  const handleEndCall = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    const leaveCallAndNavigate = async (route: string) => {
      try {
        if (
          streamCall &&
          streamCall.state.callingState !== CallingState.LEFT
        ) {
          await streamCall.leave();
        }
      } catch (err) {
        console.warn("[Stream Audio] Error leaving call:", err);
      }
      setStreamState("ended");
      router.replace(route as any);
    };

    if (isSpeakingSimulated || status === "responded") {
      if (lesson) {
        completeLesson(lesson.id);
      }
      Alert.alert(
        "Call Completed! 🎉",
        `You finished the audio lesson and earned +${
          lesson?.xp || 15
        } XP! Great job practicing with Stream audio!`,
        [
          {
            text: "Return Home",
            onPress: () => leaveCallAndNavigate("/(tabs)/learn"),
          },
        ]
      );
    } else {
      Alert.alert(
        "End Lesson?",
        "Are you sure you want to end this audio call early? Progress for this session will not be saved.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "End Call",
            style: "destructive",
            onPress: () => leaveCallAndNavigate("/(tabs)/learn"),
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

  // Derive status label and color
  const statusConfig: Record<
    "idle" | "connecting" | "joined" | "error" | "ended",
    { label: string; color: string; dotBg: string }
  > = {
    idle: {
      label: "Connecting audio...",
      color: "#FF8A00",
      dotBg: "bg-amber-500",
    },
    connecting: {
      label: "Connecting audio...",
      color: "#FF8A00",
      dotBg: "bg-amber-500",
    },
    error: {
      label: "Connection Error",
      color: "#EF4444",
      dotBg: "bg-red-500",
    },
    ended: {
      label: "Call Ended",
      color: "#94A3B8",
      dotBg: "bg-slate-400",
    },
    joined: {
      label: !isMicActive
        ? `Muted • ${language.name}`
        : `Live Audio • ${language.name}`,
      color: !isMicActive ? "#FF8A00" : "#22C55E",
      dotBg: !isMicActive ? "bg-amber-500" : "bg-green-500",
    },
  };

  const currentStatus = statusConfig[streamState];

  const content = (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER COMPONENT */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-neutral-border bg-white">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={handleEndCall}
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
              <Animated.View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: currentStatus.color,
                  marginRight: 6,
                  transform: [
                    {
                      scale:
                        streamState === "joined" && isMicActive
                          ? dotScale
                          : 1,
                    },
                  ],
                }}
              />
              <Text className="text-caption font-poppins-semibold text-neutral-text-secondary">
                {currentStatus.label}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2.5">
          {/* Audio call active icon */}
          <View
            className={`p-2 rounded-xl border ${
              streamState === "joined"
                ? "bg-green-50 border-green-200"
                : "bg-neutral-surface border-neutral-border"
            }`}
          >
            <Feather
              name="phone"
              size={15}
              color={streamState === "joined" ? "#16A34A" : "#6C4EF5"}
            />
          </View>

          {/* XP pill */}
          <View className="bg-[#FFF4E6] border border-[#FFE0B2] px-3 py-1.5 rounded-full flex-row items-center gap-1">
            <Feather name="zap" size={13} color="#FF8A00" />
            <Text className="text-caption font-poppins-bold text-[#FF8A00]">
              {`+${lesson.xp} XP`}
            </Text>
          </View>

          {/* User Info Avatar */}
          {streamUser.image ? (
            <Image
              source={{ uri: streamUser.image }}
              className="w-8 h-8 rounded-full border border-neutral-border bg-slate-200"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-violet-100 items-center justify-center border border-violet-200">
              <Text className="text-caption font-poppins-bold text-primary-purple">
                {streamUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-slate-50"
      >
        {/* 2. TEACHER CARD BACKDROP */}
        <View
          className="mx-4 mt-4 relative rounded-3xl overflow-hidden shadow-md bg-violet-900 border border-violet-800"
          style={{ height: 350 }}
        >
          {/* Backdrop lighting */}
          <View className="absolute inset-0 bg-gradient-to-tr from-violet-950 via-indigo-900 to-purple-800 opacity-90" />
          <View className="absolute w-32 h-32 rounded-full bg-yellow-500/10 -top-10 -left-10" />
          <View className="absolute w-48 h-48 rounded-full bg-purple-500/15 -bottom-20 -right-20" />

          {/* Stream Audio Live Badge */}
          <View className="absolute top-4 left-4 z-10 flex-row items-center bg-black/40 px-3 py-1 rounded-full border border-white/15 gap-1.5">
            <View
              className={`w-2 h-2 rounded-full ${
                streamState === "joined"
                  ? isMicActive
                    ? "bg-green-400"
                    : "bg-amber-400"
                  : streamState === "error"
                  ? "bg-red-400"
                  : "bg-amber-400"
              }`}
            />
            <Text className="text-[11px] font-poppins-bold text-white tracking-wide">
              {streamState === "joined"
                ? isMicActive
                  ? "STREAM AUDIO LIVE"
                  : "STREAM MUTED"
                : streamState === "error"
                ? "STREAM OFFLINE"
                : "CONNECTING TO STREAM"}
            </Text>
          </View>

          {/* Main Mascot Illustration */}
          <View className="absolute inset-x-0 top-6 items-center">
            <Image
              source={images.mascotWelcome}
              className="w-48 h-48"
              resizeMode="contain"
            />
          </View>

          {/* Error Banner overlay if connection failed */}
          {streamState === "error" ? (
            <View className="absolute inset-0 bg-black/75 items-center justify-center p-6 z-20">
              <Feather name="alert-triangle" size={36} color="#EF4444" />
              <Text className="text-body-medium font-poppins-bold text-white text-center mt-3 mb-1">
                Audio Call Connection Failed
              </Text>
              <Text className="text-caption font-poppins-medium text-slate-300 text-center mb-4">
                {errorMessage || "Check your internet connection or credentials."}
              </Text>
              <TouchableOpacity
                onPress={() => setRetryCounter((c) => c + 1)}
                className="bg-primary-purple px-5 py-2.5 rounded-full flex-row items-center gap-2"
              >
                <Feather name="refresh-cw" size={14} color="#FFFFFF" />
                <Text className="text-caption font-poppins-bold text-white">
                  Retry Call
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* 3. TEACHER RESPONSE BUBBLE */}
          {streamState !== "error" ? (
            <Animated.View
              style={[styles.bubbleContainer, { opacity: bubbleOpacity }]}
              className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg border border-slate-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-body-medium font-poppins-bold text-neutral-text-primary">
                    {teacherMessage}
                  </Text>
                  {showSubtitles ? (
                    <Text className="text-caption font-poppins-medium text-neutral-text-secondary mt-1">
                      {teacherTranslation}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={handlePlayAudio}
                  className="w-10 h-10 rounded-full bg-violet-100 items-center justify-center active:bg-violet-200"
                >
                  <Feather name="volume-2" size={20} color="#6C4EF5" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : null}
        </View>

        {/* Dynamic Speech / Call Status Prompt */}
        <View className="items-center mt-3 px-6 h-8 justify-center">
          {streamState === "connecting" ? (
            <View className="flex-row items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <ActivityIndicator size="small" color="#FF8A00" />
              <Text className="text-caption font-poppins-semibold text-amber-800">
                Establishing Stream audio call...
              </Text>
            </View>
          ) : null}

          {streamState === "joined" && !isMicActive ? (
            <View className="flex-row items-center bg-amber-100 px-4 py-1 rounded-full gap-1.5 border border-amber-300">
              <Ionicons name="mic-off" size={13} color="#B45309" />
              <Text className="text-caption font-poppins-bold text-amber-800">
                Microphone is Muted • Tap Mic to Speak
              </Text>
            </View>
          ) : null}

          {streamState === "joined" && isMicActive && status === "listening" ? (
            <View className="flex-row items-center bg-violet-100 px-4 py-1 rounded-full gap-1.5 border border-violet-200">
              <View className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              <Text className="text-caption font-poppins-bold text-violet-700 text-center">
                Listening on Stream... Say: &quot;
                {lesson?.phrases?.[0]?.phrase || "Hello"}
                &quot;
              </Text>
            </View>
          ) : null}

          {streamState === "joined" &&
          isMicActive &&
          status === "online" &&
          !isSpeakingSimulated ? (
            <Text className="text-caption font-poppins-bold text-neutral-text-secondary bg-white px-3 py-1 rounded-full border border-neutral-border shadow-xs">
              🎙️ Speak into microphone to respond
            </Text>
          ) : null}

          {status === "responded" ? (
            <View className="bg-green-50 border border-green-200 px-4 py-1 rounded-full flex-row items-center gap-1.5">
              <Feather name="check-circle" size={13} color="#16A34A" />
              <Text className="text-caption font-poppins-bold text-green-700">
                Lesson completed successfully!
              </Text>
            </View>
          ) : null}
        </View>

        {/* 4. AUDIO LESSON CONTROLS */}
        <View className="flex-row justify-around items-center px-6 py-4 mt-2">
          {/* Camera Button (Audio-only lesson toggle) */}
          <View className="items-center">
            <TouchableOpacity
              onPress={handleToggleCamera}
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
              {isCameraOn ? "Camera On" : "Audio Only"}
            </Text>
          </View>

          {/* Mic Button (Real Stream Audio Mute/Unmute) */}
          <View className="items-center">
            <TouchableOpacity
              onPress={handleToggleMic}
              disabled={streamState === "connecting" || streamState === "error"}
              className={`w-16 h-16 rounded-full items-center justify-center shadow-md border ${
                isMicActive
                  ? "bg-violet-600 border-violet-500"
                  : "bg-white border-slate-200"
              } ${
                streamState === "connecting" || streamState === "error"
                  ? "opacity-50"
                  : "opacity-100"
              }`}
            >
              <Ionicons
                name={isMicActive ? "mic" : "mic-off"}
                size={26}
                color={isMicActive ? "#FFFFFF" : "#EF4444"}
              />
            </TouchableOpacity>
            <Text
              className={`text-caption font-poppins-semibold mt-1.5 ${
                isMicActive ? "text-primary-purple" : "text-red-500"
              }`}
            >
              {isMicActive ? "Mic Active" : "Unmute"}
            </Text>
          </View>

          {/* Subtitles Button */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
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

        {/* User spoken bubble */}
        {Boolean(userSpeech) ? (
          <View className="mx-6 mb-4 self-end bg-violet-100 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] border border-violet-200 shadow-sm">
            <View className="flex-row items-center justify-between mb-0.5">
              <Text className="text-caption font-poppins-bold text-violet-800">
                {streamUser.name}
              </Text>
              <Text className="text-[10px] font-poppins-medium text-violet-500 ml-2">
                Stream Audio
              </Text>
            </View>
            <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary">
              {userSpeech}
            </Text>
          </View>
        ) : null}

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
                  speakingRating === "---"
                    ? "text-slate-400"
                    : "text-primary-green"
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
                  pronunciationRating === "---"
                    ? "text-slate-400"
                    : "text-primary-blue"
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
                  grammarRating === "---"
                    ? "text-slate-400"
                    : "text-primary-purple"
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
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {}
              );
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

          {showLessonDetails ? (
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
                  <View
                    key={idx}
                    className="bg-slate-50 p-2.5 rounded-xl border border-neutral-border mt-1.5"
                  >
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
              {lesson.vocabulary && lesson.vocabulary.length > 0 ? (
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
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (isWebRTCAvailable && streamClient) {
    return (
      <StreamVideo client={streamClient}>
        {streamCall ? (
          <StreamCall call={streamCall}>{content}</StreamCall>
        ) : (
          content
        )}
      </StreamVideo>
    );
  }

  return content;
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
