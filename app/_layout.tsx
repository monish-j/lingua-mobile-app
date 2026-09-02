import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import {
  PostHogErrorBoundary,
  PostHogProvider,
  usePostHog,
} from "posthog-react-native";
import { posthog } from "../config/posthog";
import { useAppStore } from "../store/useAppStore";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function PostHogUserIdentifier() {
  const { user, isLoaded } = useUser();
  const posthogClient = usePostHog();
  const { selectedLanguageCode } = useAppStore();
  const identifiedUserId = useRef<string | null>(null);
  const lastIdentifiedLanguage = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (user?.id) {
      if (identifiedUserId.current !== user.id) {
        const personProperties: Record<string, string | null> = {
          preferred_language: selectedLanguageCode ?? null,
        };

        if (user.primaryEmailAddress?.emailAddress) {
          personProperties.email = user.primaryEmailAddress.emailAddress;
        }
        if (user.fullName) {
          personProperties.name = user.fullName;
        }

        const signupDate = user.createdAt
          ? new Date(user.createdAt).toISOString()
          : new Date().toISOString();

        posthogClient.identify(user.id, {
          $set: personProperties,
          $set_once: {
            signup_date: signupDate,
          },
        });
        identifiedUserId.current = user.id;
        lastIdentifiedLanguage.current = selectedLanguageCode;
      } else if (lastIdentifiedLanguage.current !== selectedLanguageCode) {
        posthogClient.identify(user.id, {
          $set: {
            preferred_language: selectedLanguageCode ?? null,
          },
        });
        lastIdentifiedLanguage.current = selectedLanguageCode;
      }
      return;
    }

    if (identifiedUserId.current) {
      posthogClient.reset();
      identifiedUserId.current = null;
      lastIdentifiedLanguage.current = null;
    }
  }, [
    isLoaded,
    posthogClient,
    user?.createdAt,
    user?.fullName,
    user?.id,
    user?.primaryEmailAddress?.emailAddress,
    selectedLanguageCode,
  ]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const app = (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        {posthog ? <PostHogUserIdentifier /> : null}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FFFFFF" },
          }}
        />
      </ClerkLoaded>
    </ClerkProvider>
  );

  return posthog ? (
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary fallback={null}>{app}</PostHogErrorBoundary>
    </PostHogProvider>
  ) : (
    app
  );
}

