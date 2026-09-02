import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Platform,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import {
  StreamVideo,
  StreamCall,
  Call,
  CallingState,
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

const isWebRTCAvailable = Platform.OS !== "web";

export interface LiveCaptionItem {
  id: string;
  speaker: "teacher" | "user";
  speakerName: string;
  text: string;
  translation?: string;
  timestamp: number;
  isLive?: boolean;
}

export default function AudioLessonScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const posthog = usePostHog();
  const { id } = useLocalSearchParams();
  const { completeLesson } = useAppStore();
  const { user: clerkUser } = useUser();

  // Find the lesson and language details
  const lesson = lessons.find((l) => l.id === id);
  const unit = units.find((u) => u.id === lesson?.unitId);
  const language =
    languages.find((l) => l.code === unit?.languageCode) || languages[0];

  const lessonStartTimeRef = useRef<number>(Date.now());
  const isFinishedRef = useRef<boolean>(false);
  const hasAbandonedCaptured = useRef<boolean>(false);

  // Track lesson start event on mount
  useEffect(() => {
    if (lesson) {
      posthog.capture("lesson_started", {
        lesson_id: lesson.id,
        language: language.name,
        lesson_number: lesson.order,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureAbandonment = useCallback(() => {
    if (!lesson || isFinishedRef.current || hasAbandonedCaptured.current) return;
    hasAbandonedCaptured.current = true;
    const timeIntoLessonSeconds = Math.max(
      0,
      Math.floor((Date.now() - lessonStartTimeRef.current) / 1000)
    );
    posthog.capture("lesson_abandoned", {
      lesson_id: lesson.id,
      time_into_lesson_seconds: timeIntoLessonSeconds,
      last_question_index: 0,
    });
  }, [lesson, posthog]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      captureAbandonment();
    });
    return () => {
      unsubscribe();
      captureAbandonment();
    };
  }, [navigation, captureAbandonment]);

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
  const [, setRetryCounter] = useState(0);

  // Lesson Audio State Management
  const [status, setStatus] = useState<
    "connecting" | "online" | "listening" | "responded"
  >("connecting");
  const [isMicActive, setIsMicActive] = useState(false);
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

  // Live Captions State Management
  const [activeTeacherCaption, setActiveTeacherCaption] = useState<string>(
    teacherPrompt.welcomeMessage
  );
  const [activeUserCaption, setActiveUserCaption] = useState<string>("");
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isCaptionsExpanded, setIsCaptionsExpanded] = useState<boolean>(true);
  const [captionHistory, setCaptionHistory] = useState<LiveCaptionItem[]>([
    {
      id: "initial-welcome",
      speaker: "teacher",
      speakerName: "AI Teacher",
      text: teacherPrompt.welcomeMessage,
      translation:
        lesson?.phrases?.find((p) => p.phrase === teacherPrompt.welcomeMessage)
          ?.translation ||
        `Hello! Welcome to your ${language.name} lesson. How are you?`,
      timestamp: Date.now(),
    },
  ]);

  // Performance ratings states
  const [speakingRating, setSpeakingRating] = useState("---");
  const [pronunciationRating, setPronunciationRating] = useState("---");
  const [grammarRating, setGrammarRating] = useState("---");

  // Animations
  const dotScale = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const soundWave1 = useRef(new Animated.Value(0.4)).current;
  const soundWave2 = useRef(new Animated.Value(0.8)).current;
  const soundWave3 = useRef(new Animated.Value(0.5)).current;
  const captionsScrollRef = useRef<ScrollView>(null);

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

  // Stream Video Client Singleton
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

  // Soundwave equalizer animation when teacher or user is actively speaking
  useEffect(() => {
    if (!isTeacherSpeaking && !isUserSpeaking) {
      soundWave1.setValue(0.3);
      soundWave2.setValue(0.5);
      soundWave3.setValue(0.3);
      return;
    }

    const waveAnim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(soundWave1, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(soundWave1, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(soundWave2, {
            toValue: 0.2,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(soundWave2, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(soundWave3, {
            toValue: 0.9,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(soundWave3, {
            toValue: 0.4,
            duration: 420,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    waveAnim.start();
    return () => waveAnim.stop();
  }, [isTeacherSpeaking, isUserSpeaking, soundWave1, soundWave2, soundWave3]);

  // Helper to append a finalized caption item to history
  const addCaptionToHistory = useCallback(
    (speaker: "teacher" | "user", text: string, translation?: string) => {
      const cleanText = text.trim();
      if (!cleanText) return;

      setCaptionHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.speaker === speaker && last.text === cleanText) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `${speaker}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            speaker,
            speakerName: speaker === "teacher" ? "AI Teacher" : streamUser.name,
            text: cleanText,
            translation,
            timestamp: Date.now(),
          },
        ];
      });

      // Auto-scroll to bottom of caption list
      setTimeout(() => {
        captionsScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [streamUser.name]
  );

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
          aiTeacherPrompt: (activeLesson as any).aiTeacherPrompt,
          vocabulary: activeLesson.vocabulary,
          phrases: activeLesson.phrases,
          goals: activeLesson.goals,
        }).catch((err) => {
          console.warn("[Stream API] Server call session notice:", err?.message || err);
        });

        if (isCancelled) return;

        // 2. If WebRTC native module is available, connect live Stream call
        if (isWebRTCAvailable && streamClient) {
          if (Platform.OS === "android") {
            try {
              const hasPermission = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
              );
              if (!hasPermission) {
                await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                  {
                    title: "Microphone Access",
                    message:
                      "Duolingo Clone needs microphone access so you can practice speaking with your AI teacher.",
                    buttonPositive: "Allow",
                  }
                );
              }
            } catch (permErr) {
              console.warn("[Stream Audio] Permission request notice:", permErr);
            }
          }

          const call = streamClient.call("default", callId, {
            reuseInstance: true,
          });

          currentCall = call;
          setStreamCall(call);

          await call.join({ create: true });

          if (isCancelled) return;

          // Audio configuration: disable camera and activate microphone
          await call.camera.disable().catch(() => {});
          await call.microphone.enable().catch(() => {});
        }

        setStreamState("joined");
        setStatus("online");
        setIsMicActive(true);

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
    streamClient,
    streamUser,
  ]);

  // Stream Call Realtime Live Captions Event Subscriptions
  useEffect(() => {
    if (!streamCall) return;

    const handleCustomEvent = (event: any) => {
      const data = event.custom;
      if (!data) return;

      if (data.type === "caption") {
        const { speaker, text, mode } = data;
        if (!text) return;

        if (speaker === "teacher" || speaker === "ai" || speaker === "agent") {
          setIsTeacherSpeaking(true);
          setActiveTeacherCaption(text);
          setTeacherMessage(text);

          const matchedTranslation =
            lesson?.phrases?.find(
              (p) =>
                p.phrase.toLowerCase().includes(text.toLowerCase()) ||
                text.toLowerCase().includes(p.phrase.toLowerCase())
            )?.translation || "";

          setTeacherTranslation(matchedTranslation);

          if (mode === "final") {
            setIsTeacherSpeaking(false);
            addCaptionToHistory("teacher", text, matchedTranslation);
          }
        } else if (
          speaker === "user" ||
          speaker === "student" ||
          speaker === "learner"
        ) {
          setIsUserSpeaking(true);
          setActiveUserCaption(text);
          setUserSpeech(text);

          if (mode === "final") {
            setIsUserSpeaking(false);
            addCaptionToHistory("user", text);
          }
        }
      } else if (data.type === "turn") {
        if (data.speaker === "teacher") {
          if (data.state === "started") {
            setIsTeacherSpeaking(true);
            setActiveTeacherCaption("");
          } else if (data.state === "ended") {
            setIsTeacherSpeaking(false);
            const finalText = (data.final_text || activeTeacherCaption || "").trim();
            if (finalText) {
              const matchedTranslation = lesson?.phrases?.find(
                (p) =>
                  p.phrase.toLowerCase().includes(finalText.toLowerCase()) ||
                  finalText.toLowerCase().includes(p.phrase.toLowerCase())
              )?.translation;
              addCaptionToHistory("teacher", finalText, matchedTranslation);
            }
          }
        } else if (data.speaker === "user") {
          if (data.state === "started") {
            setIsUserSpeaking(true);
            setActiveUserCaption("");
          } else if (data.state === "ended") {
            setIsUserSpeaking(false);
            const finalText = (data.final_text || activeUserCaption || "").trim();
            if (finalText) {
              addCaptionToHistory("user", finalText);
            }
          }
        }
      }
    };

    const handleClosedCaptionEvent = (event: any) => {
      if (event?.closed_caption?.text) {
        const caption = event.closed_caption;
        const isTeacher =
          caption.speaker_id === "ai-language-teacher" ||
          caption.user?.id === "ai-language-teacher";
        if (isTeacher) {
          setIsTeacherSpeaking(true);
          setActiveTeacherCaption(caption.text);
          setTeacherMessage(caption.text);
          addCaptionToHistory("teacher", caption.text);
        } else {
          setIsUserSpeaking(true);
          setActiveUserCaption(caption.text);
          setUserSpeech(caption.text);
          addCaptionToHistory("user", caption.text);
        }
      }
    };

    const unsubCustom = streamCall.on("custom", handleCustomEvent);
    const unsubClosedCaption = streamCall.on(
      "call.closed_caption" as any,
      handleClosedCaptionEvent
    );

    // Also observe closed captions observable from stream call state if active
    const captionSub = streamCall.state.closedCaptions$?.subscribe?.(
      (captionsList) => {
        if (captionsList && captionsList.length > 0) {
          const latest = captionsList[captionsList.length - 1];
          if (latest?.text) {
            const isTeacher = latest.speaker_id === "ai-language-teacher";
            if (isTeacher) {
              setActiveTeacherCaption(latest.text);
              setTeacherMessage(latest.text);
            } else {
              setActiveUserCaption(latest.text);
              setUserSpeech(latest.text);
            }
          }
        }
      }
    );

    return () => {
      unsubCustom();
      unsubClosedCaption();
      captionSub?.unsubscribe?.();
    };
  }, [streamCall, lesson, addCaptionToHistory, activeTeacherCaption, activeUserCaption]);

  // Central Microphone Toggle
  const handleToggleMic = async () => {
    if (streamState !== "joined") return;
    const nextState = !isMicActive;
    setIsMicActive(nextState);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    if (streamCall) {
      if (nextState) {
        await streamCall.microphone.enable().catch(() => {});
        setStatus("online");
      } else {
        await streamCall.microphone.disable().catch(() => {});
        setStatus("online");
      }
    }
  };

  // Transition status to "listening" when mic is unmuted
  useEffect(() => {
    if (isMicActive && !isSpeakingSimulated && status === "online") {
      setStatus("listening");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [isMicActive, isSpeakingSimulated, status]);

  // Speech practice simulation fallback (runs only when native WebRTC is not active, e.g. web/Expo Go)
  useEffect(() => {
    if (!isWebRTCAvailable && status === "listening" && !isSpeakingSimulated) {
      const targetPhrase =
        lesson?.phrases?.[0]?.phrase ||
        lesson?.vocabulary?.[0]?.word ||
        "Practice phrase";

      // 1. Simulate student speaking with streaming caption
      setIsUserSpeaking(true);
      setActiveUserCaption(targetPhrase);

      const speakingTimer = setTimeout(() => {
        setIsUserSpeaking(false);
        setUserSpeech(targetPhrase);
        addCaptionToHistory("user", targetPhrase);
        setStatus("responded");
        setIsSpeakingSimulated(true);

        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});

        // 2. Teacher response
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

        setTimeout(() => {
          setIsTeacherSpeaking(true);
          setActiveTeacherCaption(feedbackMessage);
          setTeacherMessage(feedbackMessage);
          setTeacherTranslation(feedbackTranslation);
          addCaptionToHistory("teacher", feedbackMessage, feedbackTranslation);

          setSpeakingRating("Excellent");
          setPronunciationRating("Great");
          setGrammarRating("Good");

          setTimeout(() => {
            setIsTeacherSpeaking(false);
          }, 2500);

          if (lesson) {
            completeLesson(lesson.id);
          }
        }, 1200);
      }, 3500);

      return () => clearTimeout(speakingTimer);
    }
  }, [
    status,
    isSpeakingSimulated,
    lesson,
    language.code,
    completeLesson,
    addCaptionToHistory,
  ]);

  // Handle Audio Replay
  const handlePlayAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      "Audio Practice",
      `Teacher says: "${teacherMessage}"\n\n(${teacherTranslation})`,
      [{ text: "OK", style: "default" }]
    );
  };

  // Handle Clear Captions Feed
  const handleClearCaptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCaptionHistory([]);
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
      isFinishedRef.current = true;
      if (lesson) {
        completeLesson(lesson.id);
      }
      Alert.alert(
        "Call Completed! 🎉",
        `You finished the audio lesson and earned +${
          lesson?.xp || 15
        } XP! Great job practicing with Stream audio & realtime captions!`,
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
          <Feather name="alert-circle" size={48} color="#FF4D4F" />
          <Text className="text-h2 font-poppins-bold text-neutral-text-primary text-center mt-4 mb-2">
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
    { label: string; color: string }
  > = {
    idle: {
      label: "Connecting audio...",
      color: "#FF8A00",
    },
    connecting: {
      label: "Connecting audio...",
      color: "#FF8A00",
    },
    error: {
      label: "Connection Error",
      color: "#EF4444",
    },
    ended: {
      label: "Call Ended",
      color: "#94A3B8",
    },
    joined: {
      label: isUserSpeaking
        ? `You Speaking • ${language.name}`
        : isTeacherSpeaking
        ? `Teacher Speaking • ${language.name}`
        : `Live Audio • ${language.name}`,
      color: isUserSpeaking ? "#10B981" : isTeacherSpeaking ? "#8B5CF6" : "#22C55E",
    },
  };

  const currentStatus = statusConfig[streamState];

  const content = (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER WITH LIVE STATUS AND END CALL */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-neutral-border bg-white">
        <View className="flex-row items-center flex-1 mr-2">
          <TouchableOpacity
            onPress={handleEndCall}
            className="p-1 mr-2.5"
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
                        streamState === "joined" && (isTeacherSpeaking || isUserSpeaking)
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

        <View className="flex-row items-center gap-2">
          {/* XP pill */}
          <View className="bg-[#FFF4E6] border border-[#FFE0B2] px-3 py-1.5 rounded-full flex-row items-center gap-1">
            <Feather name="zap" size={13} color="#FF8A00" />
            <Text className="text-caption font-poppins-bold text-[#FF8A00]">
              {`+${lesson.xp} XP`}
            </Text>
          </View>

          {/* End Call Button */}
          <TouchableOpacity
            onPress={handleEndCall}
            className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 active:bg-red-100"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="phone-off" size={13} color="#EF4444" />
            <Text className="text-caption font-poppins-bold text-red-600">
              End
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-slate-50"
      >
        {/* 2. TEACHER HERO CARD WITH LIVE AUDIO SUBTITLE */}
        <View
          className="mx-4 mt-4 relative rounded-3xl overflow-hidden shadow-md bg-violet-900 border border-violet-800"
          style={{ height: 350 }}
        >
          {/* Backdrop lighting */}
          <View className="absolute inset-0 bg-gradient-to-tr from-violet-950 via-indigo-900 to-purple-800 opacity-90" />
          <View className="absolute w-32 h-32 rounded-full bg-yellow-500/10 -top-10 -left-10" />
          <View className="absolute w-48 h-48 rounded-full bg-purple-500/15 -bottom-20 -right-20" />

          {/* Live Status Header Overlay */}
          <View className="absolute top-4 left-4 right-4 z-10 flex-row items-center justify-between">
            {/* Stream Audio Live Badge */}
            <View className="flex-row items-center bg-black/40 px-3 py-1 rounded-full border border-white/15 gap-1.5">
              <View
                className={`w-2 h-2 rounded-full ${
                  streamState === "joined"
                    ? isTeacherSpeaking
                      ? "bg-violet-400"
                      : isUserSpeaking
                      ? "bg-emerald-400"
                      : "bg-green-400"
                    : streamState === "error"
                    ? "bg-red-400"
                    : "bg-amber-400"
                }`}
              />
              <Text className="text-[10px] font-poppins-bold text-white uppercase tracking-wider">
                {streamState === "joined"
                  ? isTeacherSpeaking
                    ? "TEACHER SPEAKING"
                    : isUserSpeaking
                    ? "STUDENT SPEAKING"
                    : "STREAM AUDIO LIVE"
                  : streamState === "error"
                  ? "CONNECTION FAILED"
                  : "CONNECTING TO STREAM"}
              </Text>
            </View>

            {/* Live Captions Status Pill */}
            <View className="flex-row items-center bg-white/15 px-2.5 py-1 rounded-full border border-white/20 gap-1">
              <MaterialCommunityIcons
                name="closed-caption"
                size={13}
                color="#FFFFFF"
              />
              <Text className="text-[10px] font-poppins-bold text-white uppercase tracking-wider">
                LIVE CAPTIONS
              </Text>
            </View>
          </View>

          {/* Mascot / Avatar Area */}
          <View className="items-center justify-center pt-10 pb-2">
            <Image
              source={images.mascotWelcome}
              className="w-36 h-36"
              resizeMode="contain"
            />
          </View>

          {/* 3. TEACHER DIALOGUE / REALTIME LIVE CAPTION OVERLAY */}
          <Animated.View
            style={[
              styles.bubbleContainer,
              {
                position: "absolute",
                opacity: bubbleOpacity,
              },
            ]}
          >
            <View className="bg-white/95 rounded-2xl p-4 shadow-lg border border-white/40">
              {/* Header inside subtitle: Speaker + Live Equalizer */}
              <View className="flex-row items-center justify-between mb-1.5 pb-1 border-b border-neutral-border/50">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-violet-600" />
                  <Text className="text-[11px] font-poppins-bold text-violet-800 uppercase tracking-wide">
                    {isTeacherSpeaking ? "AI Teacher Speaking" : "AI Teacher Dialogue"}
                  </Text>
                </View>

                {/* Animated Equalizer Waveform */}
                {isTeacherSpeaking ? (
                  <View className="flex-row items-center gap-1 h-3.5 px-1.5">
                    <Animated.View
                      style={[
                        styles.equalizerBar,
                        { transform: [{ scaleY: soundWave1 }] },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.equalizerBar,
                        { transform: [{ scaleY: soundWave2 }] },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.equalizerBar,
                        { transform: [{ scaleY: soundWave3 }] },
                      ]}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handlePlayAudio}
                    className="p-1 rounded-full bg-violet-50"
                  >
                    <Feather name="volume-2" size={14} color="#6C4EF5" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Spoken message text */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-body-large font-poppins-bold text-neutral-text-primary leading-snug">
                    {teacherMessage}
                  </Text>
                  {Boolean(teacherTranslation) ? (
                    <Text className="text-body-small font-poppins-medium text-neutral-text-secondary mt-1">
                      {teacherTranslation}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Dynamic Status Banner */}
        <View className="items-center mt-3 px-6 h-8 justify-center">
          {streamState === "connecting" ? (
            <View className="flex-row items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <ActivityIndicator size="small" color="#FF8A00" />
              <Text className="text-caption font-poppins-semibold text-amber-800">
                Establishing Stream audio call...
              </Text>
            </View>
          ) : null}

          {streamState === "error" ? (
            <TouchableOpacity
              onPress={() => setRetryCounter((c) => c + 1)}
              className="flex-row items-center gap-1.5 bg-red-50 px-3 py-1 rounded-full border border-red-200"
            >
              <Feather name="refresh-cw" size={12} color="#EF4444" />
              <Text className="text-caption font-poppins-bold text-red-700">
                {errorMessage || "Connection failed. Tap to retry"}
              </Text>
            </TouchableOpacity>
          ) : null}

          {streamState === "joined" && isUserSpeaking ? (
            <View className="flex-row items-center bg-emerald-50 px-4 py-1 rounded-full gap-1.5 border border-emerald-200 shadow-xs">
              <View className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Text className="text-caption font-poppins-bold text-emerald-700">
                🎤 You are speaking • Transcribing in realtime
              </Text>
            </View>
          ) : streamState === "joined" && isTeacherSpeaking ? (
            <View className="flex-row items-center bg-violet-50 px-4 py-1 rounded-full gap-1.5 border border-violet-200 shadow-xs">
              <View className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <Text className="text-caption font-poppins-bold text-violet-700">
                🎙️ AI Teacher is speaking • Live captions active
              </Text>
            </View>
          ) : streamState === "joined" && isMicActive ? (
            <View className="flex-row items-center bg-green-50 px-4 py-1 rounded-full gap-1.5 border border-green-200 shadow-xs">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="text-caption font-poppins-bold text-green-700">
                🎙️ Mic Active • Teacher is listening to you
              </Text>
            </View>
          ) : streamState === "joined" && !isMicActive ? (
            <View className="flex-row items-center bg-amber-50 px-4 py-1 rounded-full gap-1.5 border border-amber-200 shadow-xs">
              <Ionicons name="mic-off" size={13} color="#D97706" />
              <Text className="text-caption font-poppins-semibold text-amber-800">
                Microphone Muted • Tap button to speak
              </Text>
            </View>
          ) : null}
        </View>

        {/* 4. REALTIME LIVE CAPTIONS FEED DRAWER */}
        <View className="mx-4 mt-3 mb-2 bg-white rounded-3xl border border-neutral-border shadow-xs overflow-hidden">
          {/* Captions Header */}
          <View className="flex-row items-center justify-between px-4 py-3 bg-slate-50 border-b border-neutral-border">
            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-xl bg-violet-100 items-center justify-center border border-violet-200">
                <MaterialCommunityIcons
                  name="closed-caption"
                  size={16}
                  color="#6C4EF5"
                />
              </View>
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-body-medium font-poppins-bold text-neutral-text-primary">
                    Realtime Live Captions
                  </Text>
                  <View className="bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Text className="text-[9px] font-poppins-bold text-emerald-700 uppercase tracking-wide">
                      LIVE
                    </Text>
                  </View>
                </View>
                <Text className="text-[11px] font-poppins-regular text-neutral-text-secondary">
                  Speech-to-text transcriptions for Teacher & Student
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-1.5">
              {captionHistory.length > 0 ? (
                <TouchableOpacity
                  onPress={handleClearCaptions}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="px-2 py-1 rounded-lg bg-slate-100 active:bg-slate-200"
                >
                  <Text className="text-[10px] font-poppins-bold text-neutral-text-secondary">
                    Clear
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {}
                  );
                  setIsCaptionsExpanded(!isCaptionsExpanded);
                }}
                className="p-1.5 rounded-lg bg-slate-100 active:bg-slate-200"
              >
                <Feather
                  name={isCaptionsExpanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Captions Content Body */}
          {isCaptionsExpanded ? (
            <View className="p-3 bg-white">
              {/* Active streaming caption highlight if currently speaking */}
              {isUserSpeaking && Boolean(activeUserCaption) ? (
                <View className="mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 shadow-xs">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2 h-2 rounded-full bg-emerald-500" />
                      <Text className="text-[11px] font-poppins-bold text-emerald-800">
                        {streamUser.name} (Speaking now...)
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-[10px] font-poppins-semibold text-emerald-600">
                        Listening
                      </Text>
                      <ActivityIndicator size="small" color="#059669" />
                    </View>
                  </View>
                  <Text className="text-body-medium font-poppins-semibold text-emerald-950">
                    {activeUserCaption}
                  </Text>
                </View>
              ) : null}

              {isTeacherSpeaking && Boolean(activeTeacherCaption) ? (
                <View className="mb-3 bg-violet-50 border border-violet-200 rounded-2xl p-3 shadow-xs">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2 h-2 rounded-full bg-violet-600" />
                      <Text className="text-[11px] font-poppins-bold text-violet-800">
                        AI Teacher (Speaking now...)
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-[10px] font-poppins-semibold text-violet-600">
                        Streaming
                      </Text>
                      <ActivityIndicator size="small" color="#7C3AED" />
                    </View>
                  </View>
                  <Text className="text-body-medium font-poppins-semibold text-violet-950">
                    {activeTeacherCaption}
                  </Text>
                </View>
              ) : null}

              {/* Scrollable Dialogue History */}
              <ScrollView
                ref={captionsScrollRef}
                style={{ maxHeight: 220 }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                className="gap-2.5"
              >
                {captionHistory.length === 0 && !isUserSpeaking && !isTeacherSpeaking ? (
                  <View className="items-center justify-center py-6 px-4">
                    <MaterialCommunityIcons
                      name="comment-text-outline"
                      size={28}
                      color="#94A3B8"
                    />
                    <Text className="text-body-small font-poppins-medium text-neutral-text-secondary mt-1.5 text-center">
                      Live speech transcriptions will appear here in real-time as you and your teacher talk.
                    </Text>
                  </View>
                ) : (
                  captionHistory.map((item) => {
                    const isTeacher = item.speaker === "teacher";
                    return (
                      <View
                        key={item.id}
                        className={`flex-row items-start gap-2 mb-2.5 ${
                          isTeacher ? "self-start" : "self-end flex-row-reverse"
                        }`}
                        style={{ maxWidth: "88%" }}
                      >
                        {/* Avatar */}
                        <View
                          className={`w-7 h-7 rounded-full items-center justify-center shadow-2xs mt-0.5 ${
                            isTeacher
                              ? "bg-violet-600 border border-violet-400"
                              : "bg-emerald-600 border border-emerald-400"
                          }`}
                        >
                          {isTeacher ? (
                            <Image
                              source={images.mascotLogo}
                              className="w-5 h-5"
                              resizeMode="contain"
                            />
                          ) : (
                            <Text className="text-[11px] font-poppins-bold text-white uppercase">
                              {item.speakerName?.charAt(0) || "U"}
                            </Text>
                          )}
                        </View>

                        {/* Caption Bubble */}
                        <View
                          className={`p-3 rounded-2xl ${
                            isTeacher
                              ? "bg-slate-100 rounded-tl-xs border border-slate-200"
                              : "bg-emerald-500 rounded-tr-xs border border-emerald-600 shadow-2xs"
                          }`}
                        >
                          <View className="flex-row items-center justify-between mb-0.5 gap-2">
                            <Text
                              className={`text-[10px] font-poppins-bold uppercase tracking-wider ${
                                isTeacher ? "text-violet-700" : "text-emerald-100"
                              }`}
                            >
                              {item.speakerName}
                            </Text>
                            <Text
                              className={`text-[9px] font-poppins-medium ${
                                isTeacher ? "text-neutral-text-secondary" : "text-emerald-200"
                              }`}
                            >
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </Text>
                          </View>

                          <Text
                            className={`text-body-medium font-poppins-medium ${
                              isTeacher ? "text-neutral-text-primary" : "text-white"
                            }`}
                          >
                            {item.text}
                          </Text>

                          {Boolean(item.translation) ? (
                            <Text
                              className={`text-caption font-poppins-regular mt-1 italic ${
                                isTeacher
                                  ? "text-neutral-text-secondary"
                                  : "text-emerald-100"
                              }`}
                            >
                              {item.translation}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {/* 5. CENTRAL LIVE MICROPHONE CONTROL */}
        <View className="items-center justify-center px-6 py-4">
          <View
            className="items-center justify-center relative my-1"
            style={{ width: 120, height: 120 }}
          >
            {/* Glowing ripple ring when mic is live */}
            {isMicActive ? (
              <View
                style={styles.holdingGlow}
                className="absolute w-28 h-28 rounded-full bg-violet-400/25"
              />
            ) : null}

            {/* Central Live Mic Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleToggleMic}
              disabled={streamState === "connecting" || streamState === "error"}
              style={[
                styles.pushToTalkButton,
                isMicActive ? styles.pushToTalkActive : styles.pushToTalkIdle,
              ]}
            >
              <Ionicons
                name={isMicActive ? "mic" : "mic-off"}
                size={38}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* Helper instructions */}
          <View className="items-center mt-2">
            <Text
              className={`text-body-medium font-poppins-bold ${
                isMicActive ? "text-primary-purple" : "text-neutral-text-primary"
              }`}
            >
              {isMicActive ? "Mic is Live • Speak Anytime" : "Mic Muted • Tap to Unmute"}
            </Text>
            <Text className="text-caption font-poppins-regular text-neutral-text-secondary mt-0.5 text-center">
              {isMicActive
                ? `Say "${lesson?.phrases?.[0]?.phrase || greeting}" — AI Teacher will reply with live captions`
                : "Tap the purple button whenever you are ready to talk"}
            </Text>
          </View>
        </View>

        {/* User spoken bubble (if not in captions list) */}
        {Boolean(userSpeech) && captionHistory.every((c) => c.text !== userSpeech) ? (
          <View className="mx-6 mb-4 self-end bg-emerald-50 rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] border border-emerald-200 shadow-sm">
            <View className="flex-row items-center justify-between mb-0.5">
              <Text className="text-caption font-poppins-bold text-emerald-800">
                {streamUser.name}
              </Text>
              <Text className="text-[10px] font-poppins-medium text-emerald-600 ml-2">
                Live Speech
              </Text>
            </View>
            <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary">
              {userSpeech}
            </Text>
          </View>
        ) : null}

        {/* 6. PERFORMANCE FEEDBACK CARD */}
        <View className="mx-4 mt-1 mb-4 bg-white rounded-2xl p-4 shadow-xs border border-neutral-border">
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

        {/* 7. COLLAPSIBLE LESSON OBJECTIVES DRAWERS */}
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
          <StreamCall call={streamCall}>
            {content}
          </StreamCall>
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
  equalizerBar: {
    width: 2.5,
    height: 12,
    borderRadius: 1.5,
    backgroundColor: "#7C3AED",
  },
  pushToTalkButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  pushToTalkIdle: {
    backgroundColor: "#6C4EF5",
    borderWidth: 4,
    borderColor: "#8B5CF6",
  },
  pushToTalkActive: {
    backgroundColor: "#7C3AED",
    borderWidth: 4,
    borderColor: "#C4B5FD",
    transform: [{ scale: 1.06 }],
  },
  holdingGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});
