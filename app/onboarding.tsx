import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { images } from "../constants/images";

export default function Onboarding() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top Section: Header & Headline */}
        <View style={styles.topSection}>
          {/* Top Logo & App Name Header */}
          <View style={styles.header}>
            <Image 
              source={images.mascotLogo} 
              style={{ width: 36, height: 36 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-poppins-bold text-neutral-text-primary tracking-tight">
              lingua
            </Text>
          </View>

          {/* Headline and Description */}
          <View style={styles.textContainer}>
            <Text className="text-h1 font-poppins-bold text-neutral-text-primary leading-tight">
              {"Your AI language\n"}
              <Text className="text-primary-purple">teacher.</Text>
            </Text>
            <Text className="text-body-large text-neutral-text-secondary leading-relaxed mt-1">
              {"Real conversations, personalized\nlessons, anytime, anywhere."}
            </Text>
          </View>
        </View>

        {/* Middle Section: Mascot & Absolute Positioned Speech Bubbles */}
        <View style={styles.mascotContainer}>
          {/* Mascot Image */}
          <Image 
            source={images.mascotWelcome}
            style={{ width: 256, height: 256, marginTop: 24 }}
            resizeMode="contain"
          />

          {/* Bubble 1: "Hello!" (Left Side) */}
          <View style={[styles.bubbleWrapper, { left: "2%", top: "16%" }]}>
            <View style={[styles.bubble, { backgroundColor: "#EBF3FF" }]}>
              <Text className="text-body-large font-poppins-semibold text-[#0D132B]">
                Hello!
              </Text>
            </View>
            {/* Custom triangle tail pointing down-right towards the mascot */}
            <View style={[styles.tail, { right: 16, bottom: -7, borderTopColor: "#EBF3FF" }]} />
          </View>

          {/* Bubble 2: "¡Hola!" (Top Right Side) */}
          <View style={[styles.bubbleWrapper, { right: "8%", top: "6%" }]}>
            <View style={[styles.bubble, { backgroundColor: "#F3F0FF" }]}>
              <Text className="text-body-large font-poppins-semibold text-primary-purple">
                ¡Hola!
              </Text>
            </View>
            {/* Custom triangle tail pointing down-left towards the mascot */}
            <View style={[styles.tail, { left: 16, bottom: -7, borderTopColor: "#F3F0FF" }]} />
          </View>

          {/* Bubble 3: "你好!" (Middle Right Side) */}
          <View style={[styles.bubbleWrapper, { right: "2%", top: "26%" }]}>
            <View style={[styles.bubble, { backgroundColor: "#FFF1EE" }]}>
              <Text className="text-body-large font-poppins-semibold text-[#FF4D4F]">
                你好!
              </Text>
            </View>
            {/* Custom triangle tail pointing down-left towards the mascot */}
            <View style={[styles.tail, { left: 16, bottom: -7, borderTopColor: "#FFF1EE" }]} />
          </View>
        </View>

        {/* Bottom Section: Playful 3D Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPressIn={() => setPressedBtn("get-started")}
            onPressOut={() => setPressedBtn(null)}
            onPress={() => router.push("/sign-up")}
            style={[
              styles.button3d,
              pressedBtn === "get-started" && styles.button3dPressed
            ]}
          >
            <Text className="text-body-large font-poppins-bold text-neutral-background text-center">
              Get Started
            </Text>
            <View style={styles.chevronContainer}>
              <Feather name="chevron-right" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
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
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  topSection: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    marginBottom: 40,
  },
  textContainer: {
    gap: 12,
  },
  mascotContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
    marginVertical: 24,
    minHeight: 300,
  },
  bubbleWrapper: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.2)",
  },
  tail: {
    position: "absolute",
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  bottomSection: {
    width: "100%",
    paddingTop: 16,
  },
  button3d: {
    backgroundColor: "#6C4EF5",
    borderColor: "#5B3BF6",
    borderBottomWidth: 4,
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  button3dPressed: {
    transform: [{ translateY: 4 }],
    borderBottomWidth: 0,
  },
  chevronContainer: {
    position: "absolute",
    right: 24,
  },
});
