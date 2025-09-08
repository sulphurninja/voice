// lib/elevenlabs.ts
import mongoose from "mongoose";
import connectDB from "./db";
import Agent from "@/models/agentModel";
import callModel from "@/models/callModel";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_PHONE_ID = process.env.ELEVENLABS_PHONE_ID!;

// ----------------- Create Agent -----------------
export async function createAgent(data: {
  userId: string;
  name: string;
  description?: string;
  voice_id: string;
  first_message?: string;
  system_prompt?: string;
}) {
  try {
    const {
      userId,
      name,
      description = "",
      voice_id,
      first_message = "",
      system_prompt = "",
    } = data;

    // Fetch voice to store name locally (optional but nice)
    const voiceRes = await fetch(`https://api.elevenlabs.io/v1/voices/${voice_id}`, {
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
    });
    const voiceData = await voiceRes.json();
    const voiceName = voiceData?.name || "Unknown";

    // Create agent
    const res = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        name,
        description,
        conversation_config: {
          tts: { voice_id },
          agent: {
            first_message,
            prompt: { prompt: system_prompt },
          },
          enable_summary: true,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ElevenLabs API error: ${text}`);
    }

    const { agent_id } = await res.json();

    // Save locally
    await connectDB();
    const agent = await Agent.create({
      userId,
      name,
      description,
      agentId: agent_id,
      voiceId: voice_id,
      voiceName,
      firstMessage: first_message,
      systemPrompt: system_prompt,
      usageMinutes: 0,
    });

    return agent;
  } catch (err) {
    console.error("Error creating agent:", err);
    throw err;
  }
}

// ----------------- Get Agent -----------------
export async function getAgent(agentId: string) {
  try {
    await connectDB();
    const agent = await Agent.findOne({ agentId });
    if (!agent) throw new Error("Agent not found");

    // Best-effort fetch of remote details
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        headers: { "xi-api-key": ELEVENLABS_API_KEY },
      });

      if (response.ok) {
        const eleven = await response.json();
        return {
          ...agent.toObject(),
          usage_minutes: agent.usageMinutes,
          disabled: eleven.disabled ?? agent.disabled,
          conversation_config: {
            first_message: agent.firstMessage,
            system_prompt: agent.systemPrompt,
          },
        };
      }
    } catch (e) {
      console.error("ElevenLabs get agent failed:", e);
    }

    return agent;
  } catch (error) {
    console.error("Error getting agent:", error);
    throw error;
  }
}

// ----------------- Update Agent -----------------
export async function updateAgent(agentId: string, updates: any) {
  try {
    const patch: any = {};
    if (updates.name) patch.name = updates.name;
    if (updates.first_message) patch.first_message = updates.first_message;
    if (updates.system_prompt) patch.system_prompt = updates.system_prompt;
    if (updates.voice_id) patch.voice_id = updates.voice_id;
    if (typeof updates.disabled === "boolean") patch.disabled = updates.disabled;

    if (Object.keys(patch).length) {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`ElevenLabs API error: ${text}`);
      }
    }

    await connectDB();
    const agent = await Agent.findOne({ agentId });
    if (!agent) throw new Error("Agent not found");

    if (updates.name) agent.name = updates.name;
    if (updates.description) agent.description = updates.description;
    if (updates.first_message) agent.firstMessage = updates.first_message;
    if (updates.system_prompt) agent.systemPrompt = updates.system_prompt;
    if (updates.voice_id) agent.voiceId = updates.voice_id;
    if (typeof updates.disabled === "boolean") agent.disabled = updates.disabled;

    await agent.save();
    return agent;
  } catch (error) {
    console.error("Error updating agent:", error);
    throw error;
  }
}

// ----------------- Delete Agent -----------------
export async function deleteAgent(agentId: string) {
  try {
    await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: "DELETE",
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
    });

    await connectDB();
    await Agent.deleteOne({ agentId });
    return { success: true };
  } catch (error) {
    console.error("Error deleting agent:", error);
    throw error;
  }
}

// ----------------- Initiate Outbound Call -----------------
export async function initiateCall(
  userId: string,
  agentId: string,
  phoneNumber: string,
  contactName: string,
  customMessage?: string,
  campaignId?: string
) {
  try {
    console.log("Initiating call", { userId, agentId, phoneNumber, contactName, hasCampaignId: !!campaignId });
    await connectDB();

    // Find agent: try by agentId, else try by _id if it looks like ObjectId
    let agent = await Agent.findOne({ agentId, userId });
    if (!agent && /^[0-9a-fA-F]{24}$/.test(agentId)) {
      try {
        agent = await Agent.findOne({ _id: agentId, userId });
      } catch (e) {
        console.warn("Agent lookup by _id failed:", e);
      }
    }
    if (!agent) throw new Error(`Agent not found with ID: ${agentId}`);

    // Normalize number (default India)
    let formatted = phoneNumber.trim().replace(/[\s\-\(\)]/g, "");
    if (!formatted.startsWith("+")) {
      formatted = formatted.startsWith("91") ? `+${formatted}` : `+91${formatted}`;
    }

    // Campaign id (optional)
    let campaignObjectId;
    if (campaignId && /^[0-9a-fA-F]{24}$/.test(campaignId)) {
      campaignObjectId = new mongoose.Types.ObjectId(campaignId);
    }

    // Create DB row (queued)
    const call = await callModel.create({
      userId,
      agentId: agent._id,
      phoneNumber: formatted,
      direction: "outbound",
      status: "queued",
      contactName,
      customMessage,
      campaignId: campaignObjectId,
      startTime: new Date(),
    });

    // Hit ElevenLabs
    const resp = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound_call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        agent_id: agent.agentId,
        agent_phone_number_id: ELEVENLABS_PHONE_ID,
        to_number: formatted,
        agent_start_message: customMessage || undefined,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      call.status = "failed";
      call.notes = `ElevenLabs error: ${errText}`;
      await call.save();
      throw new Error(`ElevenLabs API error (${resp.status}): ${errText}`);
    }

    const data = await resp.json();

    // The API returns both conversation_id and callSid (naming can vary)
    const conversationId =
      data.conversation_id || data.conversationId || data.conversationID || null;
    const callSid = data.callSid || data.call_sid || data.call_id || null;

    call.status = "initiated";
    if (conversationId) call.conversationId = conversationId; // <-- IMPORTANT
    if (callSid) call.elevenLabsCallSid = callSid;
    await call.save();

    agent.lastCalledAt = new Date();
    await agent.save();

    return {
      id: call._id,
      status: "initiated",
      callSid,
      conversationId,
      contactName,
      phoneNumber: formatted,
    };
  } catch (error) {
    console.error("Error in initiateCall:", error);
    throw error;
  }
}

// ----------------- Get Conversation (by conversationId) -----------------
export async function getConversation(conversationId: string) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
    { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
  );

  if (!res.ok) {
    throw new Error(
      `ElevenLabs conversation fetch failed – ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<{
    conversation_id: string;
    agent_id: string;
    summary?: string;
    messages?: { role: "agent" | "user"; text: string }[];
  }>;
}
