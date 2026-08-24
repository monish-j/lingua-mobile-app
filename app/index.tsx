import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { images } from "../constants/images";

export default function Index() {
  const router = useRouter();
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);

  const colorsList = {
    primary: [
      { name: "Lingua Purple", hex: "#6C4EF5", class: "bg-primary-purple" },
      { name: "Lingua Deep Purple", hex: "#5B3BF6", class: "bg-primary-deep-purple" },
      { name: "Lingua Blue", hex: "#4D8BFF", class: "bg-primary-blue" },
      { name: "Lingua Green", hex: "#21C16B", class: "bg-primary-green" },
    ],
    semantic: [
      { name: "Success", hex: "#21C16B", class: "bg-semantic-success" },
      { name: "Warning", hex: "#FFC800", class: "bg-semantic-warning" },
      { name: "Streak", hex: "#FF8A00", class: "bg-semantic-streak" },
      { name: "Error", hex: "#FF4D4F", class: "bg-semantic-error" },
      { name: "Info", hex: "#4D8BFF", class: "bg-semantic-info" },
    ],
    neutrals: [
      { name: "Text Primary", hex: "#0D132B", class: "bg-neutral-text-primary" },
      { name: "Text Secondary", hex: "#6B7280", class: "bg-neutral-text-secondary" },
      { name: "Border", hex: "#E5E7EB", class: "bg-neutral-border" },
      { name: "Surface", hex: "#F6F7FB", class: "bg-neutral-surface" },
      { name: "Background", hex: "#FFFFFF", class: "bg-neutral-background" },
    ],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Brand Header */}
        <View className="items-center mb-8 p-6 bg-neutral-surface rounded-3xl border border-neutral-border">
          <Image 
            source={images.mascotLogo} 
            style={{ width: 192, height: 80 }}
            resizeMode="contain"
          />
          <Text className="text-body-small mt-2 font-poppins-semibold tracking-widest uppercase text-neutral-text-secondary">
            Design System Spec
          </Text>
        </View>

        {/* Preview Onboarding Screen Button */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push("/onboarding")}
          className="btn-3d btn-3d-purple h-14 mb-8 items-center justify-center"
        >
          <Text className="text-body-large font-poppins-bold text-neutral-background">
            GO TO ONBOARDING SCREEN
          </Text>
        </TouchableOpacity>

        {/* Colors Section */}
        <View className="mb-8">
          <Text className="text-h2 mb-4 text-neutral-text-primary">Colors</Text>
          
          {/* Primary Colors */}
          <Text className="text-h4 mb-2 text-neutral-text-secondary">Primary</Text>
          <View className="flex-row flex-wrap gap-4 mb-4">
            {colorsList.primary.map((c) => (
              <View key={c.name} className="w-[45%] bg-neutral-surface p-3 rounded-2xl border border-neutral-border items-center">
                <View className={`w-12 h-12 rounded-xl mb-2 ${c.class}`} />
                <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary text-center">{c.name}</Text>
                <Text className="text-caption text-neutral-text-secondary font-mono mt-0.5">{c.hex}</Text>
              </View>
            ))}
          </View>

          {/* Semantic Colors */}
          <Text className="text-h4 mb-2 text-neutral-text-secondary">Semantic</Text>
          <View className="flex-row flex-wrap gap-4 mb-4">
            {colorsList.semantic.map((c) => (
              <View key={c.name} className="w-[29%] bg-neutral-surface p-2 rounded-xl border border-neutral-border items-center">
                <View className={`w-8 h-8 rounded-lg mb-1.5 ${c.class}`} />
                <Text className="text-caption font-poppins-semibold text-neutral-text-primary text-center leading-none" numberOfLines={1}>{c.name}</Text>
                <Text className="text-[10px] text-neutral-text-secondary font-mono mt-0.5">{c.hex}</Text>
              </View>
            ))}
          </View>

          {/* Neutrals Colors */}
          <Text className="text-h4 mb-2 text-neutral-text-secondary">Neutrals</Text>
          <View className="flex-row flex-wrap gap-4">
            {colorsList.neutrals.map((c) => (
              <View key={c.name} className="w-[29%] bg-neutral-surface p-2 rounded-xl border border-neutral-border items-center">
                <View className={`w-8 h-8 rounded-lg mb-1.5 border border-neutral-border/20 ${c.class}`} />
                <Text className="text-caption font-poppins-semibold text-neutral-text-primary text-center leading-none" numberOfLines={1}>{c.name}</Text>
                <Text className="text-[10px] text-neutral-text-secondary font-mono mt-0.5">{c.hex}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Typography Section */}
        <View className="mb-8">
          <Text className="text-h2 mb-4 text-neutral-text-primary">Typography</Text>
          
          <View className="gap-6 bg-neutral-surface p-5 rounded-3xl border border-neutral-border">
            <View className="border-b border-neutral-border pb-3">
              <Text className="text-h1">H1 Title</Text>
              <Text className="text-caption text-neutral-text-secondary mt-1">Poppins Bold • 32px • Line-height 1.2</Text>
            </View>

            <View className="border-b border-neutral-border pb-3">
              <Text className="text-h2">H2 Section Title</Text>
              <Text className="text-caption text-neutral-text-secondary mt-1">Poppins SemiBold • 24px • Line-height 1.3</Text>
            </View>

            <View className="border-b border-neutral-border pb-3">
              <Text className="text-h3">H3 Card Module Title</Text>
              <Text className="text-caption text-neutral-text-secondary mt-1">Poppins SemiBold • 20px • Line-height 1.3</Text>
            </View>

            <View className="border-b border-neutral-border pb-3">
              <Text className="text-h4">H4 Subheading</Text>
              <Text className="text-caption text-neutral-text-secondary mt-1">Poppins Medium • 16px • Line-height 1.4</Text>
            </View>

            <View className="border-b border-neutral-border pb-3">
              <Text className="text-body-large">Body Large: Important Content</Text>
              <Text className="text-caption text-neutral-text-secondary mt-1">Poppins Regular • 16px • Line-height 1.6</Text>
            </View>

            <View className="border-b border-neutral-border pb-3">
              <Text className="text-body-medium">Body Medium: General body text description for lessons and UI details.</Text>
              <Text className="text-caption text-neutral-text-secondary mt-1">Poppins Regular • 14px • Line-height 1.6</Text>
            </View>

            <View className="border-b border-neutral-border pb-3">
              <Text className="text-body-small">Body Small: Supporting info text, metadata label descriptions.</Text>
              <Text className="text-caption text-neutral-text-secondary mt-1">Poppins Regular • 13px • Line-height 1.6</Text>
            </View>

            <View>
              <Text className="text-caption">Caption: LABELS, META TEXT AND OTHER SUBTEXTS.</Text>
              <Text className="text-[10px] text-neutral-text-secondary mt-1">Poppins Regular • 11px • Line-height 1.4</Text>
            </View>
          </View>
        </View>

        {/* Buttons Section */}
        <View className="mb-8">
          <Text className="text-h2 mb-4 text-neutral-text-primary">Playful 3D Buttons</Text>
          <View className="gap-5">
            
            {/* Purple Button */}
            <TouchableOpacity 
              activeOpacity={0.9}
              onPressIn={() => setPressedBtn("purple")}
              onPressOut={() => setPressedBtn(null)}
              className={`btn-3d btn-3d-purple h-14 ${pressedBtn === "purple" ? "translate-y-[4px] border-b-0" : ""}`}
            >
              <Text className="text-body-large font-poppins-bold text-neutral-background">
                PURPLE BUTTON
              </Text>
            </TouchableOpacity>

            {/* Blue Button */}
            <TouchableOpacity 
              activeOpacity={0.9}
              onPressIn={() => setPressedBtn("blue")}
              onPressOut={() => setPressedBtn(null)}
              className={`btn-3d btn-3d-blue h-14 ${pressedBtn === "blue" ? "translate-y-[4px] border-b-0" : ""}`}
            >
              <Text className="text-body-large font-poppins-bold text-neutral-background">
                BLUE BUTTON
              </Text>
            </TouchableOpacity>

            {/* Green Button */}
            <TouchableOpacity 
              activeOpacity={0.9}
              onPressIn={() => setPressedBtn("green")}
              onPressOut={() => setPressedBtn(null)}
              className={`btn-3d btn-3d-green h-14 ${pressedBtn === "green" ? "translate-y-[4px] border-b-0" : ""}`}
            >
              <Text className="text-body-large font-poppins-bold text-neutral-background">
                START LESSON
              </Text>
            </TouchableOpacity>

            {/* Neutral/White Button */}
            <TouchableOpacity 
              activeOpacity={0.9}
              onPressIn={() => setPressedBtn("neutral")}
              onPressOut={() => setPressedBtn(null)}
              className={`btn-3d btn-3d-neutral h-14 ${pressedBtn === "neutral" ? "translate-y-[4px] border-b-0" : ""}`}
            >
              <Text className="text-body-large font-poppins-bold text-neutral-text-primary">
                LATER
              </Text>
            </TouchableOpacity>

            {/* Disabled Button Spec */}
            <View 
              style={{ opacity: 0.5 }}
              className="btn-3d btn-3d-purple border-b-0 h-14 bg-neutral-border items-center justify-center"
            >
              <Text className="text-body-large font-poppins-bold text-neutral-text-secondary">
                DISABLED BUTTON
              </Text>
            </View>

          </View>
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
});

