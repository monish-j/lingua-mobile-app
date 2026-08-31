import { StreamClient } from "@stream-io/node-sdk";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      callId,
      callType = "default",
      userId,
      lessonId,
      lessonTitle,
      languageCode,
      languageName,
    } = body;

    if (!callId || !userId) {
      return Response.json(
        { error: "callId and userId are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.STREAM_API_KEY || process.env.EXPO_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      return Response.json(
        { error: "Stream API credentials are missing on the server" },
        { status: 500 }
      );
    }

    const serverClient = new StreamClient(apiKey, apiSecret);
    const call = serverClient.video.call(callType, callId);

    // Create/reserve the call on Stream with custom lesson metadata
    await call.getOrCreate({
      data: {
        created_by_id: userId,
        members: [{ user_id: userId, role: "admin" }],
        custom: {
          lessonId: lessonId || "",
          lessonTitle: lessonTitle || "",
          languageCode: languageCode || "",
          languageName: languageName || "",
          mode: "audio_lesson",
        },
      },
    });

    return Response.json({
      success: true,
      callId,
      callType,
      custom: {
        lessonId,
        lessonTitle,
        languageCode,
        languageName,
      },
    });
  } catch (error: any) {
    console.error("[Stream Call API] Error creating call:", error);
    return Response.json(
      { error: error?.message || "Failed to create Stream call session" },
      { status: 500 }
    );
  }
}
