import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Agent from "@/models/agentModel";
import { getUserFromRequest } from "@/lib/jwt";
import { createAgent } from "@/lib/elevenLabs";
import { checkAgentCreationLimit } from "@/lib/plan-limits";

/* ───────────────────────── GET ───────────────────────── */

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const agents = await Agent.find({
      userId: typeof userData === "object" ? userData.userId : userData,
    });

    /** What the dashboard needs */
    const formatted = agents.map((a) => ({
      _id: a._id,
      agent_id: a.agentId,
      name: a.name,
      description: a.description,
      disabled: a.disabled,
      voice_id: a.voiceId,
      voiceName: a.voiceName,
      usage_minutes: a.usageMinutes,
      last_called_at: a.lastCalledAt,
      conversation_config: {
        // keep the *flat* shape for the frontend;
        // the helper will nest them correctly when it
        // hits ElevenLabs later.
        first_message: a.firstMessage,
        system_prompt: a.systemPrompt,
        enable_summary: true,
      },
    }));

    return NextResponse.json({ agents: formatted });
  } catch (err: any) {
    console.error("Error fetching agents:", err);
    return NextResponse.json(
      { message: "Failed to fetch agents", error: err.message },
      { status: 500 },
    );
  }
}

/* ───────────────────────── POST ───────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Check if user has reached agent limit
    const limitCheck = await checkAgentCreationLimit(request);
    if (limitCheck) {
      return limitCheck; // Returns a 403 response if limit reached
    }

    /* what the UI sent */
    const body = await request.json();

    /* map into the flavour that `createAgent()` expects                *
     * NOTE:  we send `first_message` & `system_prompt` at the top      *
     *        level (or inside `conversation_config`) – the helper      *
     *        will transform them into the deeper                       *
     *        conversation_config.agent.prompt structure when it calls  *
     *        the ElevenLabs endpoint.                                  */
    const agentData = {
      userId: typeof userData === "object" ? userData.userId : userData,
      name: body.name,
      description: body.description ?? "",
      voice_id: body.voice_id ?? "", // Check in conversation_config.tts if not at top level
      first_message: body.first_message ?? body.conversation_config?.first_message ?? "",
      system_prompt: body.system_prompt ?? body.conversation_config?.system_prompt ?? "",
    };

    const agent = await createAgent(agentData);

    return NextResponse.json(agent);
  } catch (err: any) {
    console.error("Error creating agent:", err);
    return NextResponse.json(
      { message: "Failed to create agent", error: err.message },
      { status: 500 },
    );
  }
}
