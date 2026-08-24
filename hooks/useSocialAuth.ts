import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

// WebBrowser redirect setup for web-based flows in mobile browsers
WebBrowser.maybeCompleteAuthSession();

export function useSocialAuth() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleSocialAuth = async (strategy: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        path: 'sso-callback',
      });

      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
        return { success: true };
      }

      // Handle pending signIn continuation requirements (like MFA)
      if (signIn) {
        if (signIn.status === 'needs_second_factor') {
          Alert.alert(
            "MFA Required",
            "Multi-factor authentication is required. Please sign in with your email to complete verification."
          );
          router.replace("/sign-in");
          return { success: false, status: 'needs_second_factor', signIn };
        }
        if (signIn.status && signIn.status !== 'complete') {
          Alert.alert("Authentication Pending", `Sign-in requires additional steps (${signIn.status}). Please sign in with your email.`);
          router.replace("/sign-in");
          return { success: false, status: signIn.status, signIn };
        }
      }

      // Handle pending signUp continuation requirements (like missing fields)
      if (signUp) {
        if (signUp.status === 'missing_requirements') {
          Alert.alert(
            "Registration Incomplete",
            "Additional information is required to complete your registration. Please sign up with your email."
          );
          router.replace("/sign-up");
          return { success: false, status: 'missing_requirements', signUp };
        }
      }

      // Cancellation case: neither a session nor a pending resource was returned
      if (!signIn && !signUp) {
        console.log("SSO flow cancelled by user.");
      }

      return { success: false };
    } catch (err: any) {
      // Swallow user cancellation errors
      if (err.errors?.[0]?.code !== "auth_session_cancelled") {
        Alert.alert("Social Auth Error", err.message || "Failed to authenticate.");
      }
      return { success: false, error: err };
    }
  };

  return { handleSocialAuth };
}
