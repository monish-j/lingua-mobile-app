import { StreamClient } from "@stream-io/node-sdk";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, image } = body;

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
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

    // Upsert the user into Stream
    await serverClient.upsertUsers([
      {
        id: userId,
        name: name || userId,
        image: image || undefined,
        role: "user",
      },
    ]);

    // Generate ~4-hour user token
    const validitySeconds = 4 * 60 * 60;
    const token = serverClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: validitySeconds,
    });

    return Response.json({
      token,
      apiKey,
      userId,
      userName: name || userId,
    });
  } catch (error: any) {
    console.error("[Stream Token API] Error generating token:", error);
    return Response.json(
      { error: error?.message || "Failed to generate Stream token" },
      { status: 500 }
    );
  }
}
