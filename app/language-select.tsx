import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { languages } from "../data/languages";
import { images } from "../constants/images";
import { useAppStore } from "../store/useAppStore";

export default function LanguageSelect() {
  const router = useRouter();
  const { selectedLanguageCode, setSelectedLanguageCode } = useAppStore();
  const [selectedCode, setSelectedCode] = useState<string | null>(selectedLanguageCode);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (code: string) => {
    setSelectedCode(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleConfirm = () => {
    if (selectedCode) {
      setSelectedLanguageCode(selectedCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.back();
    }
  };

  // Filter languages based on search query
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLanguageStats = (code: string) => {
    switch (code) {
      case "es":
        return "28.4M learners";
      case "fr":
        return "14.2M learners";
      case "ja":
        return "8.5M learners";
      case "de":
        return "7.1M learners";
      case "ko":
        return "5.4M learners";
      case "zh":
        return "6.8M learners";
      default:
        return "1.2M learners";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View className="flex-1 bg-neutral-background relative">
        
        {/* Sticky Header */}
        <View className="flex-row items-center justify-center px-6 py-4 border-b border-neutral-border relative bg-neutral-background">
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="chevron-left" size={28} color="#0D132B" />
          </TouchableOpacity>
          <Text className="text-h3 font-poppins-bold text-neutral-text-primary">
            Choose a language
          </Text>
        </View>

        {/* Sticky Search Bar */}
        <View className="px-6 pt-4 pb-2 bg-neutral-background">
          <View className="flex-row items-center bg-neutral-surface px-4 py-3 rounded-full border border-neutral-border">
            <Feather name="search" size={20} color="#6B7280" style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search languages"
              placeholderTextColor="#6B7280"
              className="flex-1 font-poppins-medium text-body-medium text-neutral-text-primary"
              style={styles.textInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section Heading */}
        <Text className="text-h4 font-poppins-bold text-neutral-text-primary mb-3 px-6 pt-2">
          Popular
        </Text>

        {/* Scrollable Language List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map((lang) => {
              const isSelected = selectedCode === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.9}
                  onPress={() => handleSelect(lang.code)}
                  className={`flex-row items-center justify-between p-4 mb-3 bg-neutral-background rounded-2xl border-2 ${
                    isSelected ? "border-primary-purple" : "border-neutral-border"
                  }`}
                  style={isSelected ? styles.selectedCard : {}}
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    {/* Circular Flag */}
                    <Image
                      source={{ uri: lang.flag }}
                      style={styles.flagImage}
                      resizeMode="cover"
                    />
                    
                    {/* Text info */}
                    <View className="flex-1">
                      <Text className="text-body-large font-poppins-bold text-neutral-text-primary leading-tight">
                        {lang.name}
                      </Text>
                      <Text className="text-body-small font-poppins-medium text-neutral-text-secondary mt-0.5">
                        {lang.nativeName} • {getLanguageStats(lang.code)}
                      </Text>
                    </View>
                  </View>

                  {/* Indicator Icon */}
                  {isSelected ? (
                    <View className="w-6 h-6 rounded-full bg-primary-purple items-center justify-center">
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <Feather name="chevron-right" size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center justify-center py-12">
              <Feather name="globe" size={48} color="#9CA3AF" />
              <Text className="text-body-large font-poppins-bold text-neutral-text-secondary mt-4 text-center">
                No languages found
              </Text>
              <Text className="text-body-small text-neutral-text-secondary mt-1 text-center">
                Try searching for something else.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Section: Earth Image & Sticky Green 3D Button */}
        <View style={styles.bottomSection}>
          {/* Earth Illustration */}
          <Image
            source={images.earth}
            style={styles.earthImage}
            resizeMode="cover"
          />
          
          {/* Action Button Container */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!selectedCode}
              onPress={handleConfirm}
              className={`btn-3d ${
                selectedCode ? "btn-3d-green" : "bg-neutral-border border-b-0"
              } h-14 w-full items-center justify-center`}
              style={!selectedCode ? { opacity: 0.5 } : {}}
            >
              <Text
                className={`text-body-large font-poppins-bold ${
                  selectedCode ? "text-neutral-background" : "text-neutral-text-secondary"
                }`}
              >
                CONFIRM
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    position: "absolute",
    left: 20,
  },
  textInput: {
    paddingVertical: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 260, // Ensure content is scrollable above earth/button
  },
  flagImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  selectedCard: {
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
    justifyContent: "flex-end",
  },
  earthImage: {
    width: "100%",
    height: 180,
    position: "absolute",
    bottom: 0,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.85)", // semi-transparent background for readability
  },
});
