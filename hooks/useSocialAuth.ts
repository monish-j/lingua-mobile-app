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

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      // Swallow user cancellation errors
      if (err.errors?.[0]?.code !== "auth_session_cancelled") {
        Alert.alert("Social Auth Error", err.message || "Failed to authenticate.");
      }
    }
  };

  return { handleSocialAuth };
}
