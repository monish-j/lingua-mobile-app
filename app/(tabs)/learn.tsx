import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAppStore } from "../../store/useAppStore";
import { languages } from "../../data/languages";
import { units } from "../../data/units";
import { lessons } from "../../data/lessons";
import { images } from "../../constants/images";

export default function LearnScreen() {
  const router = useRouter();
  const { selectedLanguageCode, completedLessonIds, hasHydrated } = useAppStore();
  const [activeTab, setActiveTab] = useState<"lessons" | "practice">("lessons");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Get active language details
  const activeLanguage = languages.find((l) => l.code === selectedLanguageCode) || languages[0];
  const activeUnits = units.filter((u) => u.languageCode === activeLanguage.code);

  // Sync selectedUnitId when active units change or on mount
  useEffect(() => {
    if (activeUnits.length > 0) {
      // Find the first unit that has incomplete lessons, or default to the first unit
      const firstIncompleteUnit = activeUnits.find((u) => {
        const unitLessons = lessons.filter((l) => l.unitId === u.id);
        return unitLessons.some((l) => !completedLessonIds.includes(l.id));
      });
      setSelectedUnitId(firstIncompleteUnit ? firstIncompleteUnit.id : activeUnits[0].id);
    } else {
      setSelectedUnitId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguageCode, completedLessonIds]);

  if (!hasHydrated) {
    return null;
  }

  // Get currently selected unit's details
  const activeUnit = activeUnits.find((u) => u.id === selectedUnitId) || activeUnits[0] || units[0];

  // Filter lessons for the active unit
  const activeLessons = lessons.filter((l) => l.unitId === activeUnit.id);

  // Find the index of the first incomplete lesson to set it as "in_progress"
  const firstIncompleteIdx = activeLessons.findIndex((l) => !completedLessonIds.includes(l.id));

  // Count lessons status in the current unit
  const completedLessonsInUnitCount = activeLessons.filter((l) => completedLessonIds.includes(l.id)).length;

  // Custom banner image mapping for each unit
  const getUnitBannerImage = (unitId: string) => {
    const banners: Record<string, string> = {
      "es-unit-1": "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80", // greetings
      "es-unit-2": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80", // cafe
      "fr-unit-1": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80", // Paris
      "ja-unit-1": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80", // Japan
      "de-unit-1": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&auto=format&fit=crop&q=80", // Germany
    };
    return banners[unitId] || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80";
  };

  // Custom lesson image mapping (respective images from assets/images or unsplash placeholders)
  const getLessonImage = (lessonId: string, title: string): any => {
    // Map specific lesson content to matching local assets
    if (lessonId.includes("l1")) return images.teacherAvatar;
    if (lessonId.includes("l2")) return images.mascotWelcome;
    if (lessonId.includes("l6") || title.toLowerCase().includes("family") || title.toLowerCase().includes("items")) return images.mascotAuth;
    if (title.toLowerCase().includes("café") || title.toLowerCase().includes("restaurant")) return images.treasure;
    if (title.toLowerCase().includes("direction") || title.toLowerCase().includes("where")) return images.earth;
    if (title.toLowerCase().includes("number") || title.toLowerCase().includes("count")) return images.palace;
    
    // Curated Unsplash images based on topics
    const placeholderMap: Record<string, string> = {
      cafe: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=120&auto=format&fit=crop&q=80",
      numbers: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
      directions: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=120&auto=format&fit=crop&q=80",
      default: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&auto=format&fit=crop&q=80",
    };
    if (title.toLowerCase().includes("café") || title.toLowerCase().includes("restaurant")) return { uri: placeholderMap.cafe };
    if (title.toLowerCase().includes("number")) return { uri: placeholderMap.numbers };
    return { uri: placeholderMap.default };
  };

  const handleStartLesson = (lessonId: string) => {
    // Route to the AI Teacher Audio Lesson screen
    router.push({ pathname: "/lesson/audio/[id]", params: { id: lessonId } });
  };

  const handleStartPractice = (type: string) => {
    Alert.alert("Coming Soon", `The ${type} challenge is being prepared! In the meantime, continue with your core lessons.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header conforming to 06-lesson-screen.png */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-border bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-1"
        >
          <Feather name="chevron-left" size={24} color="#0D132B" />
        </TouchableOpacity>
        <View className="items-center flex-1 mx-4">
          <Text className="text-h3 font-poppins-bold text-neutral-text-primary leading-tight text-center" numberOfLines={1}>
            {activeUnit.title}
          </Text>
          <Text className="text-caption font-poppins-semibold text-neutral-text-secondary mt-0.5">
            Unit {activeUnit.order} • {completedLessonsInUnitCount} / {activeLessons.length} lessons
          </Text>
        </View>
        <TouchableOpacity 
          className="p-1"
          activeOpacity={0.8}
        >
          <Feather name="bookmark" size={24} color="#FF8A00" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Unit Selector for multi-unit languages */}
      {activeUnits.length > 1 && (
        <View className="border-b border-neutral-border py-3 bg-white">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.unitSelectorContainer}
          >
            {activeUnits.map((u) => {
              const isSelected = u.id === selectedUnitId;
              const isUnitCompleted = lessons
                .filter((l) => l.unitId === u.id)
                .every((l) => completedLessonIds.includes(l.id));

              return (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => setSelectedUnitId(u.id)}
                  activeOpacity={0.8}
                  className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full mr-2.5 border ${
                    isSelected
                      ? "bg-primary-purple border-primary-purple"
                      : "bg-white border-neutral-border"
                  }`}
                >
                  <Text
                    className={`text-body-small font-poppins-bold ${
                      isSelected ? "text-white" : "text-neutral-text-secondary"
                    }`}
                  >
                    Unit {u.order}
                  </Text>
                  {isUnitCompleted && (
                    <Feather
                      name="check-circle"
                      size={12}
                      color={isSelected ? "#FFFFFF" : "#21C16B"}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        className="bg-white flex-1"
      >
        {/* Unit Hero Banner */}
        <View className="relative h-44 rounded-3xl overflow-hidden mt-6 mb-6 mx-6 bg-neutral-surface">
          <Image
            source={{ uri: getUnitBannerImage(activeUnit.id) }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Elegant overlay to guarantee text legibility */}
          <View className="absolute inset-0 bg-black/35 justify-end p-5">
            <Text className="text-caption font-poppins-bold text-white/95 uppercase tracking-widest mb-1">
              {activeLanguage.name} • Unit {activeUnit.order}
            </Text>
            <Text className="text-h2 font-poppins-bold text-white leading-tight">
              {activeUnit.title}
            </Text>
            <Text className="text-body-small font-poppins-medium text-white/90 mt-1" numberOfLines={1}>
              {activeUnit.description}
            </Text>
          </View>
        </View>

        {/* Capsule Segmented Tab Control conforming to spec */}
        <View className="flex-row bg-neutral-surface p-1 rounded-full mb-6 mx-6 border border-neutral-border">
          <TouchableOpacity
            onPress={() => setActiveTab("lessons")}
            className={`flex-1 py-2.5 rounded-full items-center justify-center ${
              activeTab === "lessons" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-body-medium font-poppins-bold ${
                activeTab === "lessons" ? "text-primary-purple" : "text-neutral-text-secondary"
              }`}
            >
              Lessons
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("practice")}
            className={`flex-1 py-2.5 rounded-full items-center justify-center ${
              activeTab === "practice" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-body-medium font-poppins-bold ${
                activeTab === "practice" ? "text-primary-purple" : "text-neutral-text-secondary"
              }`}
            >
              Practice
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "lessons" ? (
          /* Dynamic Lessons List */
          <View className="px-6 gap-4">
            {activeLessons.map((lesson, idx) => {
              // Calculate status
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isCurrent = !isCompleted && idx === firstIncompleteIdx;

              if (isCompleted) {
                /* Completed State Card */
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() => handleStartLesson(lesson.id)}
                    activeOpacity={0.85}
                    className="flex-row items-center justify-between p-5 bg-white rounded-3xl border border-neutral-border active:bg-neutral-surface"
                  >
                    <View className="flex-1 mr-4">
                      <Text className="text-caption font-poppins-semibold text-neutral-text-secondary uppercase tracking-wider mb-0.5">
                        Lesson {idx + 1}
                      </Text>
                      <Text className="text-h3 font-poppins-bold text-neutral-text-primary mb-1">
                        {lesson.title}
                      </Text>
                      <Text className="text-body-small text-neutral-text-secondary" numberOfLines={1}>
                        {lesson.description}
                      </Text>
                    </View>
                    <View className="w-8 h-8 rounded-full bg-primary-green items-center justify-center">
                      <Feather name="check" size={16} color="white" />
                    </View>
                  </TouchableOpacity>
                );
              } else if (isCurrent) {
                /* In Progress State Card - Soft lavender, thick purple border */
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() => handleStartLesson(lesson.id)}
                    activeOpacity={0.9}
                    className="flex-row items-center justify-between p-5 bg-[#EEF2FF] rounded-3xl border-2 border-primary-purple relative overflow-hidden"
                    style={styles.shadowCard}
                  >
                    <View className="flex-1 mr-4 z-10">
                      <Text className="text-caption font-poppins-bold text-primary-purple uppercase tracking-wider mb-0.5">
                        Lesson {idx + 1} • In Progress
                      </Text>
                      <Text className="text-h3 font-poppins-bold text-neutral-text-primary mb-1">
                        {lesson.title}
                      </Text>
                      <Text className="text-body-small text-neutral-text-secondary mb-3" numberOfLines={2}>
                        {lesson.description}
                      </Text>
                      <View className="flex-row items-center gap-1 bg-primary-purple/15 self-start px-3 py-1.5 rounded-full">
                        <Feather name="zap" size={12} color="#6C4EF5" />
                        <Text className="text-caption font-poppins-bold text-primary-purple">
                          +{lesson.xp} XP Reward
                        </Text>
                      </View>
                    </View>
                    {/* Badge Image mapping with fallback */}
                    <View className="w-16 h-16 z-10 items-center justify-center">
                      <Image
                        source={getLessonImage(lesson.id, lesson.title)}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>
                );
              } else {
                /* Locked State Card (still clickable but styled visually as locked) */
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() => handleStartLesson(lesson.id)}
                    activeOpacity={0.85}
                    className="flex-row items-center justify-between p-5 bg-white rounded-3xl border border-neutral-border active:bg-neutral-surface"
                  >
                    <View className="flex-1 mr-4">
                      <Text className="text-caption font-poppins-semibold text-neutral-text-secondary uppercase tracking-wider mb-0.5">
                        Lesson {idx + 1}
                      </Text>
                      <Text className="text-h3 font-poppins-bold text-neutral-text-secondary/70 mb-1">
                        {lesson.title}
                      </Text>
                      <Text className="text-body-small text-neutral-text-secondary/60" numberOfLines={1}>
                        {lesson.description}
                      </Text>
                    </View>
                    <View className="w-8 h-8 rounded-full border border-neutral-border items-center justify-center bg-neutral-surface">
                      <Feather name="lock" size={14} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        ) : (
          /* Premium Practice list */
          <View className="px-6 gap-4">
            <TouchableOpacity
              onPress={() => handleStartPractice("Pronunciation")}
              activeOpacity={0.85}
              className="flex-row items-center justify-between p-5 bg-white rounded-3xl border border-neutral-border active:bg-neutral-surface"
            >
              <View className="flex-row items-center gap-4 flex-1 mr-4">
                <View className="w-12 h-12 rounded-2xl bg-primary-blue/10 items-center justify-center">
                  <Feather name="mic" size={20} color="#4D8BFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-h3 font-poppins-bold text-neutral-text-primary mb-0.5">
                    Pronunciation Drill
                  </Text>
                  <Text className="text-body-small text-neutral-text-secondary">
                    Practice speaking target vocabulary aloud.
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStartPractice("Vocabulary Matcher")}
              activeOpacity={0.85}
              className="flex-row items-center justify-between p-5 bg-white rounded-3xl border border-neutral-border active:bg-neutral-surface"
            >
              <View className="flex-row items-center gap-4 flex-1 mr-4">
                <View className="w-12 h-12 rounded-2xl bg-semantic-warning/10 items-center justify-center">
                  <Feather name="grid" size={20} color="#FFC800" />
                </View>
                <View className="flex-1">
                  <Text className="text-h3 font-poppins-bold text-neutral-text-primary mb-0.5">
                    Vocabulary Matcher
                  </Text>
                  <Text className="text-body-small text-neutral-text-secondary">
                    Speed review of unit target translations.
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStartPractice("Listening Challenge")}
              activeOpacity={0.85}
              className="flex-row items-center justify-between p-5 bg-white rounded-3xl border border-neutral-border active:bg-neutral-surface"
            >
              <View className="flex-row items-center gap-4 flex-1 mr-4">
                <View className="w-12 h-12 rounded-2xl bg-semantic-streak/10 items-center justify-center">
                  <Feather name="volume-2" size={20} color="#FF8A00" />
                </View>
                <View className="flex-1">
                  <Text className="text-h3 font-poppins-bold text-neutral-text-primary mb-0.5">
                    Listening Challenge
                  </Text>
                  <Text className="text-body-small text-neutral-text-secondary">
                    Listen closely and test your understanding.
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStartPractice("Flashcard Review")}
              activeOpacity={0.85}
              className="flex-row items-center justify-between p-5 bg-white rounded-3xl border border-neutral-border active:bg-neutral-surface"
            >
              <View className="flex-row items-center gap-4 flex-1 mr-4">
                <View className="w-12 h-12 rounded-2xl bg-primary-purple/10 items-center justify-center">
                  <Feather name="layers" size={20} color="#6C4EF5" />
                </View>
                <View className="flex-1">
                  <Text className="text-h3 font-poppins-bold text-neutral-text-primary mb-0.5">
                    Flashcard Review
                  </Text>
                  <Text className="text-body-small text-neutral-text-secondary">
                    Review and memorize recently introduced words.
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
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
  unitSelectorContainer: {
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  shadowCard: {
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});
