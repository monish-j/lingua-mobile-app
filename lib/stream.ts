import Constants from "expo-constants";
import {
  StreamVideoClient,
  User,
} from "@stream-io/video-react-native-sdk";

export interface AppStreamUser {
  id: string;
  name?: string;
  image?: string;
}

/**
 * Resolves the base URL for API routes in Expo (Web vs Native Dev vs Production).
 */
export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Web environment uses relative URL
  if (typeof window !== "undefined" && window.location) {
    return "";
  }

  // In native development, connect to Metro / local server IP
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any)?.manifest?.debuggerHost;

  if (hostUri) {
    if (hostUri.includes(":")) {
      return `http://${hostUri}`;
    }
    return `http://${hostUri}:8081`;
  }

  return "http://localhost:8081";
}

/**
 * Fetch Stream user token from the secure Expo backend API route.
 */
export async function fetchStreamToken(user: AppStreamUser): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/stream/token`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: user.id,
      name: user.name || user.id,
      image: user.image,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to fetch Stream token (Status ${response.status})`
    );
  }

  const data = await response.json();
  return data.token as string;
}

export async function createStreamCallSession(params: {
  callId: string;
  callType?: string;
  userId: string;
  lessonId: string;
  lessonTitle: string;
  languageCode: string;
  languageName: string;
  aiTeacherPrompt?: any;
  vocabulary?: any[];
  phrases?: any[];
  goals?: string[];
}): Promise<{ agentSessionId?: string | null }> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/stream/call`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to create call session (Status ${response.status})`
    );
  }

  const data = await response.json().catch(() => ({}));
  return { agentSessionId: data?.agentSessionId || null };
}

/**
 * Get or create the StreamVideoClient singleton instance for a given user.
 */
export function getOrCreateStreamVideoClient(
  user: AppStreamUser
): StreamVideoClient {
  const apiKey =
    process.env.EXPO_PUBLIC_STREAM_API_KEY ||
    process.env.STREAM_API_KEY ||
    "na44chz4cw77";

  const clientUser: User = {
    id: user.id,
    name: user.name || user.id,
    image: user.image,
    type: "authenticated",
  };

  return StreamVideoClient.getOrCreateInstance({
    apiKey,
    user: clientUser,
    tokenProvider: () =>
      fetchStreamToken({
        id: user.id,
        name: user.name || user.id,
        image: user.image,
      }),
    options: {
      logLevel: "warn",
    },
  });
}
