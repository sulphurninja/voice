import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.ELEVENLABS_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Very minimal config to test what ElevenLabs actually expects
    const minimalConfig = {
      name: "Test Agent",
      conversationConfig: {
        agent: {
          prompt: {
            prompt: "You are a helpful assistant."
          },
          firstMessage: "Hello!",
          llm: {
            model: "gpt-4o-mini",
            temperature: 0.3
          }
        },
        tts: {
          model: "eleven_multilingual_v1",
          voiceId: "DpnM70iDHNHZ0Mguv6GJ" // Use the same voice ID from your request
        }
      }
    };

    console.log("Testing minimal config:", JSON.stringify(minimalConfig, null, 2));

    const agentRes = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
      method: "POST",
      headers: {
        "xi-api-key": KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(minimalConfig)
    });

    const responseText = await agentRes.text();
    console.log("Response status:", agentRes.status);
    console.log("Response text:", responseText);

    if (!agentRes.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.log("Detailed error:", JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log("Could not parse as JSON");
      }
    }

    return NextResponse.json({
      success: agentRes.ok,
      status: agentRes.status,
      response: responseText
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
