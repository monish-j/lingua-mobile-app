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
      aiTeacherPrompt,
      vocabulary,
      phrases,
      goals,
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

    // Create/reserve the call on Stream with rich custom lesson metadata
    await call.getOrCreate({
      data: {
        created_by_id: userId,
        members: [{ user_id: userId, role: "admin" }],
        custom: {
          lessonId: lessonId || "",
          lessonTitle: lessonTitle || "",
          languageCode: languageCode || "",
          languageName: languageName || "",
          welcomeMessage: aiTeacherPrompt?.welcomeMessage || "",
          systemPrompt: aiTeacherPrompt?.systemPrompt || "",
          suggestedTopics: JSON.stringify(aiTeacherPrompt?.suggestedTopics || []),
          vocabulary: JSON.stringify(vocabulary || aiTeacherPrompt?.keyVocabulary || []),
          phrases: JSON.stringify(phrases || aiTeacherPrompt?.keyPhrases || []),
          goals: JSON.stringify(goals || []),
          mode: "audio_lesson",
        },
      },
    });

    // Notify Vision Agent server to join this call
    let agentSessionId: string | null = null;
    const visionAgentUrl = process.env.VISION_AGENT_URL || "http://127.0.0.1:8000";
    try {
      const agentRes = await fetch(`${visionAgentUrl}/calls/${encodeURIComponent(callId)}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_type: callType }),
      });
      if (agentRes.ok) {
        const agentData = await agentRes.json().catch(() => ({}));
        agentSessionId = agentData?.session_id || agentData?.id || null;
      }
    } catch (agentErr) {
      console.warn("[Stream Call API] Vision Agent server not reachable:", agentErr);
    }

    return Response.json({
      success: true,
      callId,
      callType,
      agentSessionId,
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const callId = url.searchParams.get("callId");
    const sessionId = url.searchParams.get("sessionId");

    if (callId && sessionId) {
      const visionAgentUrl = process.env.VISION_AGENT_URL || "http://127.0.0.1:8000";
      await fetch(
        `${visionAgentUrl}/calls/${encodeURIComponent(callId)}/sessions/${encodeURIComponent(sessionId)}`,
        { method: "DELETE" }
      ).catch(() => {});
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error?.message || "Failed to close session" }, { status: 500 });
  }
}
