import Constants from "expo-constants";
import PostHog from "posthog-react-native";

const extra = Constants.expoConfig?.extra as
  | {
      posthogProjectToken?: string;
      posthogHost?: string;
    }
  | undefined;

const projectToken = extra?.posthogProjectToken;
const host = extra?.posthogHost;
const isConfigured = Boolean(projectToken && host);

if (!isConfigured && __DEV__) {
  const missingVariable = projectToken
    ? "EXPO_PUBLIC_POSTHOG_HOST"
    : "EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN";

  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

export const posthog =
  projectToken && host
    ? new PostHog(projectToken, {
        host,
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            console: false,
          },
        },
      })
    : undefined;
