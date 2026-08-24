import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Redirect } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useSignIn, useAuth, useSSO } from "@clerk/expo";
import { images } from "../../constants/images";
import VerificationModal from "../../components/VerificationModal";

export default function SignIn() {
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  
  // Input field state
  const [email, setEmail] = useState("");
  
  // Focus state for custom border highlight
  const [emailFocused, setEmailFocused] = useState(false);
  
  // 3D Button pressed states
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);
  
  // Verification Modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  if (!authLoaded || !signIn) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  const navigateAfterAuth = () => {
    router.replace("/");
  };

  const handleSignIn = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      // Start the sign in and send the email code
      const { error } = await signIn.emailCode.sendCode({
        emailAddress: email,
      });

      if (error) {
        Alert.alert("Sign In Error", error.message || "Failed to send code.");
        return;
      }

      setModalVisible(true);
    } catch (err: any) {
      Alert.alert("Sign In Error", err.message || "Failed to sign in.");
    }
  };

  const handleVerifyCode = async (code: string) => {
    const { error } = await signIn.emailCode.verifyCode({
      code,
    });

    if (error) {
      throw new Error(error.message || "Invalid verification code.");
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize({ navigate: navigateAfterAuth });
      if (finalizeError) {
        throw new Error(finalizeError.message || "Failed to finalize session.");
      }
    } else {
      throw new Error("Sign in incomplete. Status: " + signIn.status);
    }
  };

  const handleResendCode = async () => {
    const { error } = await signIn.emailCode.sendCode();
    if (error) {
      throw new Error(error.message || "Failed to resend code.");
    }
  };

  const handleVerificationSuccess = () => {
    setModalVisible(false);
    // Automatically navigate to the home route
    router.replace("/");
  };

  const handleSocialAuth = async (strategy: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') => {
    try {
      const { createdSessionId, setActive: setSSOActive } = await startSSOFlow({
        strategy,
      });
      if (createdSessionId && setSSOActive) {
        await setSSOActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      // Do not show error on user cancellation
      if (err.errors?.[0]?.code !== "auth_session_cancelled") {
        Alert.alert("Social Auth Error", err.errors?.[0]?.message || err.message || "Failed to authenticate.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.push("/onboarding")}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={28} color="#0D132B" />
          </TouchableOpacity>

          {/* Heading Section */}
          <View style={styles.headerTextContainer}>
            <Text className="text-h2 font-poppins-bold text-neutral-text-primary leading-tight">
              Welcome back
            </Text>
            <Text className="text-body-medium text-neutral-text-secondary mt-1">
              {"Continue your language journey today\u00A0✨"}
            </Text>
          </View>

          {/* Mascot Section */}
          <View style={styles.mascotContainer}>
            <Image
              source={images.mascotAuth}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          {/* Input Form Section (Email only, no Password!) */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View 
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused
              ]}
            >
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="alex@gmail.com"
                placeholderTextColor="#A1A8B0"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Action Sign In Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => setPressedBtn("signin")}
            onPressOut={() => setPressedBtn(null)}
            onPress={handleSignIn}
            style={[
              styles.button3d,
              pressedBtn === "signin" && styles.button3dPressed
            ]}
          >
            <Text className="text-body-large font-poppins-bold text-neutral-background">
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Auth Buttons */}
          <View style={styles.socialContainer}>
            {/* Google Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={() => setPressedBtn("google")}
              onPressOut={() => setPressedBtn(null)}
              onPress={() => handleSocialAuth("oauth_google")}
              style={[
                styles.socialButton,
                pressedBtn === "google" && styles.socialButtonPressed
              ]}
            >
              <View style={styles.socialIconLeft}>
                <FontAwesome name="google" size={20} color="#EA4335" />
              </View>
              <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary">
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Facebook Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={() => setPressedBtn("facebook")}
              onPressOut={() => setPressedBtn(null)}
              onPress={() => handleSocialAuth("oauth_facebook")}
              style={[
                styles.socialButton,
                pressedBtn === "facebook" && styles.socialButtonPressed
              ]}
            >
              <View style={styles.socialIconLeft}>
                <FontAwesome name="facebook" size={20} color="#1877F2" />
              </View>
              <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary">
                Continue with Facebook
              </Text>
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={() => setPressedBtn("apple")}
              onPressOut={() => setPressedBtn(null)}
              onPress={() => handleSocialAuth("oauth_apple")}
              style={[
                styles.socialButton,
                pressedBtn === "apple" && styles.socialButtonPressed
              ]}
            >
              <View style={styles.socialIconLeft}>
                <FontAwesome name="apple" size={20} color="#000000" />
              </View>
              <Text className="text-body-medium font-poppins-semibold text-neutral-text-primary">
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text className="text-body-medium font-poppins-regular text-neutral-text-secondary">
              {"Don't have an account? "}
              <Text 
                onPress={() => router.push("/sign-up")}
                className="font-poppins-bold text-primary-purple"
              >
                Sign up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Verification Modal overlay */}
      <VerificationModal
        visible={modalVisible}
        email={email}
        onClose={() => setModalVisible(false)}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
        onSuccess={handleVerificationSuccess}
      />
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
    paddingBottom: 40,
    paddingTop: 8,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 4,
    marginLeft: -8,
    marginBottom: 16,
  },
  headerTextContainer: {
    marginBottom: 12,
  },
  mascotContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  mascotImage: {
    width: 140,
    height: 140,
  },
  formContainer: {
    gap: 14,
    marginBottom: 20,
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 68,
    justifyContent: "center",
  },
  inputWrapperFocused: {
    borderColor: "#6C4EF5",
  },
  inputLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  textInput: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    color: "#0D132B",
    padding: 0,
    margin: 0,
    height: 22,
  },
  button3d: {
    backgroundColor: "#6C4EF5",
    borderColor: "#5B3BF6",
    borderBottomWidth: 4,
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  button3dPressed: {
    transform: [{ translateY: 4 }],
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#6B7280",
    paddingHorizontal: 12,
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  socialButtonPressed: {
    transform: [{ translateY: 4 }],
    borderBottomWidth: 2, // slightly flatter
    marginBottom: 0,
  },
  socialIconLeft: {
    position: "absolute",
    left: 20,
  },
  footer: {
    alignItems: "center",
    marginTop: 28,
  },
});
