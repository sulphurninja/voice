import mongoose from 'mongoose';
import connectDB from './db';
import Agent from '@/models/agentModel';
import callModel from '@/models/callModel';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_PHONE_ID = process.env.ELEVENLABS_PHONE_ID!;

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
      description = '',
      voice_id,
      first_message = '',
      system_prompt = '',
    } = data;
    // Get voice details first
    const voiceRes = await fetch(
      `https://api.elevenlabs.io/v1/voices/${voice_id}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
      }
    );
    const voiceData = await voiceRes.json();
    const voiceName = voiceData.name; // Get the voice name

    /* ───────── call ElevenLabs ───────── */
    const res = await fetch(
      'https://api.elevenlabs.io/v1/convai/agents/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          name,
          description,
          conversation_config: {
            tts: {
              voice_id: voice_id,  // <-- voice_id should be here
            },
            agent: {
              first_message,
              prompt: { prompt: system_prompt },
            },
            enable_summary: true,
          },
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ElevenLabs API error: ${text}`);
    }

    const { agent_id } = await res.json();

    /* ───────── save locally ───────── */
    await connectDB();
    const agent = await Agent.create({
      userId,
      name,
      description,
      agentId: agent_id,
      voiceId: voice_id,
      voiceName: voiceName, // Save the voice name
      firstMessage: first_message,
      systemPrompt: system_prompt,
      usageMinutes: 0,
    });

    return agent;
  } catch (err) {
    console.error('Error creating agent:', err);
    throw err;
  }
}


export async function getAgent(agentId: string) {
  try {
    await connectDB();
    const agent = await Agent.findOne({ agentId });
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Get additional details from ElevenLabs if needed
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${errorText}`);
      // Return local data if API fails
      return agent;
    }

    const elevenlabsData = await response.json();

    // Merge data
    return {
      ...agent.toObject(),
      usage_minutes: agent.usageMinutes,
      disabled: elevenlabsData.disabled || agent.disabled,
      conversation_config: {
        first_message: agent.firstMessage,
        system_prompt: agent.systemPrompt,
      }
    };
  } catch (error) {
    console.error("Error getting agent:", error);
    throw error;
  }
}

export async function updateAgent(agentId: string, updates: any) {
  try {
    // First, update in ElevenLabs
    const elevenlabsUpdates: any = {};

    if (updates.name) elevenlabsUpdates.name = updates.name;
    if (updates.first_message) elevenlabsUpdates.first_message = updates.first_message;
    if (updates.system_prompt) elevenlabsUpdates.system_prompt = updates.system_prompt;
    if (updates.voice_id) elevenlabsUpdates.voice_id = updates.voice_id;
    if (updates.disabled !== undefined) elevenlabsUpdates.disabled = updates.disabled;

    if (Object.keys(elevenlabsUpdates).length > 0) {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify(elevenlabsUpdates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${errorText}`);
      }
    }

    // Then, update in our database
    await connectDB();
    const agent = await Agent.findOne({ agentId });
    if (!agent) {
      throw new Error("Agent not found");
    }

    if (updates.name) agent.name = updates.name;
    if (updates.description) agent.description = updates.description;
    if (updates.first_message) agent.firstMessage = updates.first_message;
    if (updates.system_prompt) agent.systemPrompt = updates.system_prompt;
    if (updates.voice_id) agent.voiceId = updates.voice_id;
    if (updates.disabled !== undefined) agent.disabled = updates.disabled;

    await agent.save();
    return agent;
  } catch (error) {
    console.error("Error updating agent:", error);
    throw error;
  }
}

export async function deleteAgent(agentId: string) {
  try {
    // First, delete from ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: "DELETE",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    // Then, delete from our database
    await connectDB();
    await Agent.deleteOne({ agentId });

    return { success: true };
  } catch (error) {
    console.error("Error deleting agent:", error);
    throw error;
  }
}

export async function initiateCall(
  userId: string,
  agentId: string,
  phoneNumber: string,
  contactName: string,
  customMessage?: string,
  campaignId?: string
) {
  try {
    console.log(`Initiating call with:`, {
      userId,
      agentId,
      phoneNumber,
      contactName,
      hasCampaignId: !!campaignId
    });

    await connectDB();

    // ——— fetch agent ———
    console.log(`Looking up agent with agentId: ${agentId}`);

    // Fix: Don't try to use agentId as ObjectId if it's not in ObjectId format
    // Use separate queries instead of $or with ObjectId
    let agent = await Agent.findOne({ agentId, userId });

    // If not found by agentId field, and agentId looks like a MongoDB ObjectId, try by _id
    if (!agent && /^[0-9a-fA-F]{24}$/.test(agentId)) {
      try {
        agent = await Agent.findOne({ _id: agentId, userId });
      } catch (error) {
        console.log("Error when looking up agent by _id:", error);
      }
    }

    if (!agent) {
      console.error(`Agent not found with agentId: ${agentId}`);
      throw new Error(`Agent not found with ID: ${agentId}`);
    }

    console.log(`Found agent: ${agent.name} (${agent.agentId})`);

    // ——— normalise the number (India by default) ———
    let formatted = phoneNumber.trim().replace(/[\s\-\(\)]/g, "");
    if (!formatted.startsWith("+"))
      formatted = formatted.startsWith("91") ? `+${formatted}` : `+91${formatted}`;

    console.log(`Formatted phone number: ${formatted}`);

    // Set up the campaign ID if provided
    let campaignObjectId;
    if (campaignId) {
      try {
        campaignObjectId = new mongoose.Types.ObjectId(campaignId);
        console.log(`Campaign ID converted to ObjectId: ${campaignObjectId}`);
      } catch (error) {
        console.error(`Invalid campaign ID format: ${campaignId}`, error);
      }
    }

    // ——— create DB row (status=queued) ———
    console.log('Creating call record in database...');
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

    console.log(`Call record created with ID: ${call._id}`);

    // ——— hit ElevenLabs ———
    console.log('Making API request to ElevenLabs...');
    console.log('Request payload:', {
      agent_id: agent.agentId,
      agent_phone_number_id: process.env.ELEVENLABS_PHONE_ID,
      to_number: formatted,
      agent_start_message: customMessage || undefined,
    });

    const resp = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound_call",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          agent_id: agent.agentId,
          agent_phone_number_id: process.env.ELEVENLABS_PHONE_ID!,
          to_number: formatted,
          agent_start_message: customMessage || undefined,
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`ElevenLabs API error: Status ${resp.status}`, errText);
      call.status = "failed";
      call.notes = `ElevenLabs error: ${errText}`;
      await call.save();

      throw new Error(`ElevenLabs API error (${resp.status}): ${errText}`);
    }

    const data = await resp.json();
    console.log('ElevenLabs API response:', data);

    const callSid = data.callSid || data.call_sid || data.call_id; // ← ALL cases
    if (!callSid) {
      console.warn('No callSid returned from ElevenLabs API');
    }

    call.elevenLabsCallSid = callSid;
    call.status = 'initiated';
    await call.save();
    console.log(`Call record updated with SID: ${callSid}`);

    agent.lastCalledAt = new Date();
    await agent.save();
    console.log(`Agent lastCalledAt updated to: ${agent.lastCalledAt}`);

    return {
      id: call._id,
      status: 'initiated',
      callSid,
      contactName,
      phoneNumber: formatted
    };
  } catch (error) {
    console.error('Error in initiateCall:', error);
    throw error;
  }
}


/* NEW ──────────────────────────────────────────────────────────────── */
export async function getConversation(callSid: string) {
  // GET /v1/conversations/{conversation_id}
  const res = await fetch(
    `https://api.elevenlabs.io/v1/conversations/${callSid}`,
    { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
  );

  if (!res.ok) {
    throw new Error(
      `ElevenLabs conversation fetch failed – ${res.status} ${res.statusText}`
    );
  }
  /* shape per docs: https://elevenlabs.io/docs/api-reference/conversations/get-conversation#response
     {
       conversation_id: "...",
       agent_id: "...",
       summary: "...",
       messages: [...],
       ...
     }
  */
  return res.json() as Promise<{
    summary?: string;
    messages?: { role: "agent" | "user"; text: string }[];
  }>;
}
