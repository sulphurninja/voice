// lib/elevenlabs.ts
import mongoose from "mongoose";
import connectDB from "./db";
import Agent from "@/models/agentModel";
import callModel from "@/models/callModel";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_PHONE_ID = process.env.ELEVENLABS_PHONE_ID!;

// ----------------- Create Agent -----------------
interface CreateAgentData {
  userId: string;
  name: string;
  description?: string;
  voice_id: string;
  first_message: string;
  system_prompt: string;
  template_id?: string;
  template_name?: string;
  llm_model?: string;
  temperature?: number;
  language?: string;
  max_duration_seconds?: number;
  knowledge_documents?: Array<{
    document_id: string;
    name: string;
    type: 'file' | 'url' | 'text';
    content?: string;
    url?: string;
    file_name?: string;
    created_at: Date;
  }>;
  tools?: string[];
}

type AnyObj = Record<string, any>;

function buildBuiltInTools(agentData: AnyObj) {
  const bi: AnyObj = {};

  if (agentData.enableEndCall !== false) {
    bi.end_call = {
      type: "system",
      name: "end_call",
      params: { system_tool_type: "end_call" },
    };
  }
  if (agentData.enableLanguageDetection) {
    bi.language_detection = {
      type: "system",
      name: "language_detection",
      params: { system_tool_type: "language_detection" },
    };
  }
  if (agentData.enableTransferToAgent) {
    bi.transfer_to_agent = {
      type: "system",
      name: "transfer_to_agent",
      params: {
        system_tool_type: "transfer_to_agent",
        transfers: agentData.transferToAgentTransfers || [],
      },
    };
  }
  if (agentData.enableTransferToNumber) {
    bi.transfer_to_number = {
      type: "system",
      name: "transfer_to_number",
      params: {
        system_tool_type: "transfer_to_number",
        transfers: agentData.transferToNumberTransfers || [],
      },
    };
  }
  if (agentData.enableSkipTurn) {
    bi.skip_turn = {
      type: "system",
      name: "skip_turn",
      params: { system_tool_type: "skip_turn" },
    };
  }
  if (agentData.enableKeypadTouchTone) {
    bi.play_keypad_touch_tone = {
      type: "system",
      name: "play_keypad_touch_tone",
      params: { system_tool_type: "play_keypad_touch_tone" },
    };
  }
  if (agentData.enableVoicemailDetection) {
    bi.voicemail_detection = {
      type: "system",
      name: "voicemail_detection",
      params: {
        system_tool_type: "voicemail_detection",
        voicemail_message: agentData.voicemailMessage ?? null,
      },
    };
  }
  return bi;
}

function sanitizeAgentConfigForEL(cfg: AnyObj) {
  const prompt = cfg?.conversation_config?.agent?.prompt;

  // 1) knowledge_base mapping: only { id, name, type, usage_mode }
  if (prompt?.knowledge_base) {
    prompt.knowledge_base = (prompt.knowledge_base as AnyObj[]).map((d) => ({
      id: d.id ?? d.document_id,
      name: d.name,
      type: d.type,
      usage_mode: d.usage_mode ?? "auto",
    }));
  }

  // 2) omit max_tokens when <= 0
  if (prompt && typeof prompt.max_tokens !== "undefined" && prompt.max_tokens <= 0) {
    delete prompt.max_tokens;
  }

  // 3) do not pass system tools in prompt.tools (keep them only in built_in_tools)
  if (prompt?.tools?.length) {
    prompt.tools = (prompt.tools as AnyObj[]).filter((t) => t?.type !== "system");
  }

  // 4) coerce TTS optimize_streaming_latency to string
  const tts = cfg?.conversation_config?.tts;
  if (tts) {
    tts.optimize_streaming_latency = String(
      tts.optimize_streaming_latency ?? "3"
    );
  }

  return cfg;
}

export async function createAgent(agentData: AnyObj) {
  try {
    console.log(
      "Creating professional agent with data:",
      JSON.stringify(agentData, null, 2)
    );

    const { getDefaultSystemTools, combineTools } = await import("./systemTools");

    // Combine user tools + (if you want) keep system tools only as built-ins
    const allTools = combineTools(agentData.tools || []);

    // Build built-in tools in required schema
    const builtInTools = buildBuiltInTools(agentData);

    // Choose TTS model (override if the caller passed one)
    const ttsModel = agentData.ttsModel || "eleven_turbo_v2_5";

    // Build agent config (raw)
    const agentConfig: AnyObj = {
      name: agentData.name,
      conversation_config: {
        agent: {
          first_message: agentData.first_message,
          language: agentData.language || "en",
          disable_first_message_interruptions:
            agentData.disableFirstMessageInterruptions || false,
          dynamic_variables: {
            dynamic_variable_placeholders: agentData.dynamicVariables || {},
          },
          prompt: {
            prompt: agentData.system_prompt,
            llm: agentData.llm_model || "gpt-4o-mini",
            temperature:
              typeof agentData.temperature === "number"
                ? agentData.temperature
                : 0.3,
            // omit later if <= 0
            max_tokens:
              typeof agentData.maxTokens === "number"
                ? agentData.maxTokens
                : -1,
            reasoning_effort: agentData.reasoningEffort || null,

            knowledge_base:
              (agentData.knowledge_documents || [])
                .filter((doc: AnyObj) => !!doc.document_id)
                .map((doc: AnyObj) => ({
                  id: doc.document_id,
                  name: doc.name,
                  type: doc.type,
                  usage_mode: "auto",
                })) || [],

            rag: {
              enabled: !!agentData.ragEnabled,
              embedding_model:
                agentData.embeddingModel || "e5_mistral_7b_instruct",
              max_vector_distance:
                typeof agentData.maxVectorDistance === "number"
                  ? agentData.maxVectorDistance
                  : 0.6,
              max_documents_length:
                typeof agentData.maxDocumentsLength === "number"
                  ? agentData.maxDocumentsLength
                  : 50000,
              max_retrieved_rag_chunks_count:
                typeof agentData.maxRetrievedRagChunksCount === "number"
                  ? agentData.maxRetrievedRagChunksCount
                  : 20,
            },

            // keep only non-system tools here
            tools: (allTools || []).filter((t: AnyObj) => t?.type !== "system"),
            tool_ids: agentData.toolIds || [],
            built_in_tools: builtInTools,

            mcp_server_ids: agentData.mcpServerIds || [],
            native_mcp_server_ids: agentData.nativeMcpServerIds || [],
            custom_llm: agentData.customLlm || null,
            ignore_default_personality:
              !!agentData.ignoreDefaultPersonality || false,
            timezone: agentData.timezone || null,
          },
        },

        tts: {
          model_id: ttsModel,
          voice_id: agentData.voice_id,
          agent_output_audio_format:
            agentData.outputAudioFormat || "pcm_16000",
          stability:
            typeof agentData.voiceStability === "number"
              ? agentData.voiceStability
              : 0.5,
          similarity_boost:
            typeof agentData.voiceSimilarityBoost === "number"
              ? agentData.voiceSimilarityBoost
              : 0.8,
          speed:
            typeof agentData.voiceSpeed === "number"
              ? agentData.voiceSpeed
              : 1.0,
          // must be a string in API schema
          optimize_streaming_latency: String(
            agentData.optimizeStreamingLatency ?? "3"
          ),
          supported_voices: agentData.supportedVoices || [],
          pronunciation_dictionary_locators:
            agentData.pronunciationDictionaryLocators || [],
        },

        asr: {
          model: agentData.asrModel || "nova-2-general",
          language: agentData.asrLanguage || "auto",
          quality: agentData.asrQuality || "high",
          provider: agentData.asrProvider || "elevenlabs",
          user_input_audio_format: agentData.inputAudioFormat || "pcm_16000",
          keywords: agentData.asrKeywords || [],
        },

        turn: {
          mode: agentData.turnMode || "turn",
          turn_timeout:
            typeof agentData.turnTimeout === "number"
              ? agentData.turnTimeout
              : 7.0,
          silence_end_call_timeout:
            typeof agentData.silenceEndCallTimeout === "number"
              ? agentData.silenceEndCallTimeout
              : -1,
        },

        vad: {
          background_voice_detection:
            !!agentData.backgroundVoiceDetection || false,
        },

        conversation: {
          max_duration_seconds:
            typeof agentData.max_duration_seconds === "number"
              ? agentData.max_duration_seconds
              : 1800,
          text_only: !!agentData.textOnly || false,
          client_events:
            agentData.clientEvents || [
              "audio",
              "interruption",
              "agent_response",
              "user_transcript",
              "agent_response_correction",
              "agent_tool_response",
            ],
        },

        language_presets: agentData.languagePresets || {},
      },
    };

    // Final sanitize for ElevenLabs schema
    const cleanConfig = sanitizeAgentConfigForEL(agentConfig);

    console.log(
      "Professional ElevenLabs agent config:",
      JSON.stringify(cleanConfig, null, 2)
    );

    // Create agent via ElevenLabs API
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/agents/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify(cleanConfig),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API Error:", {
        status: response.status,
        text: errorText,
      });
      throw new Error(
        `Failed to create agent with ElevenLabs (${response.status})`
      );
    }

    const elevenLabsAgent = await response.json();
    console.log("Professional ElevenLabs agent created:", elevenLabsAgent);

    // Persist in DB
    await connectDB();

    const agent = new Agent({
      userId: agentData.userId,
      agentId: elevenLabsAgent.agent_id,
      name: agentData.name,
      description: agentData.description,

      // Voice configuration
      voiceId: agentData.voice_id,
      voiceStability:
        typeof agentData.voiceStability === "number"
          ? agentData.voiceStability
          : 0.5,
      voiceSimilarityBoost:
        typeof agentData.voiceSimilarityBoost === "number"
          ? agentData.voiceSimilarityBoost
          : 0.8,
      voiceSpeed:
        typeof agentData.voiceSpeed === "number" ? agentData.voiceSpeed : 1.0,

      // Core settings
      firstMessage: agentData.first_message,
      disableFirstMessageInterruptions:
        !!agentData.disableFirstMessageInterruptions || false,
      systemPrompt: agentData.system_prompt,
      templateId: agentData.template_id,
      templateName: agentData.template_name,

      // LLM configuration
      llmModel: agentData.llm_model || "gpt-4o-mini",
      temperature:
        typeof agentData.temperature === "number" ? agentData.temperature : 0.3,
      maxTokens:
        typeof agentData.maxTokens === "number" ? agentData.maxTokens : -1,
      reasoningEffort: agentData.reasoningEffort,
      customLlm: agentData.customLlm,

      // Language and localization
      language: agentData.language || "en",
      timezone: agentData.timezone,

      // Advanced conversation settings
      maxDurationSeconds:
        typeof agentData.max_duration_seconds === "number"
          ? agentData.max_duration_seconds
          : 1800,
      turnMode: agentData.turnMode || "turn",
      turnTimeout:
        typeof agentData.turnTimeout === "number"
          ? agentData.turnTimeout
          : 7.0,
      silenceEndCallTimeout:
        typeof agentData.silenceEndCallTimeout === "number"
          ? agentData.silenceEndCallTimeout
          : -1,
      textOnly: !!agentData.textOnly || false,

      // Audio settings
      outputAudioFormat: agentData.outputAudioFormat || "pcm_16000",
      inputAudioFormat: agentData.inputAudioFormat || "pcm_16000",
      optimizeStreamingLatency:
        typeof agentData.optimizeStreamingLatency === "number"
          ? agentData.optimizeStreamingLatency
          : 3,

      // ASR settings
      asrModel: agentData.asrModel || "nova-2-general",
      asrLanguage: agentData.asrLanguage || "auto",
      asrQuality: agentData.asrQuality || "high",
      asrProvider: agentData.asrProvider || "elevenlabs",
      asrKeywords: agentData.asrKeywords || [],

      // Voice Activity Detection
      backgroundVoiceDetection:
        !!agentData.backgroundVoiceDetection || false,

      // Knowledge and tools
      knowledgeDocuments: agentData.knowledge_documents || [],
      tools: agentData.tools || [],
      systemTools: getDefaultSystemTools(),
      toolIds: agentData.toolIds || [],
      mcpServerIds: agentData.mcpServerIds || [],
      nativeMcpServerIds: agentData.nativeMcpServerIds || [],
      dynamicVariables: agentData.dynamicVariables || {},

      // RAG configuration
      ragEnabled: !!agentData.ragEnabled || false,
      embeddingModel: agentData.embeddingModel || "e5_mistral_7b_instruct",
      maxVectorDistance:
        typeof agentData.maxVectorDistance === "number"
          ? agentData.maxVectorDistance
          : 0.6,
      maxDocumentsLength:
        typeof agentData.maxDocumentsLength === "number"
          ? agentData.maxDocumentsLength
          : 50000,
      maxRetrievedRagChunksCount:
        typeof agentData.maxRetrievedRagChunksCount === "number"
          ? agentData.maxRetrievedRagChunksCount
          : 20,

      // Built-in tools (persisting toggles)
      enableEndCall: agentData.enableEndCall !== false,
      enableLanguageDetection: !!agentData.enableLanguageDetection || false,
      enableTransferToAgent: !!agentData.enableTransferToAgent || false,
      enableTransferToNumber: !!agentData.enableTransferToNumber || false,
      enableSkipTurn: !!agentData.enableSkipTurn || false,
      enableKeypadTouchTone: !!agentData.enableKeypadTouchTone || false,
      enableVoicemailDetection: !!agentData.enableVoicemailDetection || false,

      // Client events
      clientEvents:
        agentData.clientEvents || [
          "audio",
          "interruption",
          "agent_response",
          "user_transcript",
          "agent_response_correction",
          "agent_tool_response",
        ],

      // Language presets and voice settings
      languagePresets: agentData.languagePresets || {},
      supportedVoices: agentData.supportedVoices || [],
      pronunciationDictionaryLocators:
        agentData.pronunciationDictionaryLocators || [],

      // Personality
      ignoreDefaultPersonality:
        !!agentData.ignoreDefaultPersonality || false,

      // Status
      disabled: false,
      usageMinutes: 0,
    });

    await agent.save();
    console.log("Professional agent saved to database:", agent.agentId);

    return {
      agent_id: elevenLabsAgent.agent_id,
      name: agentData.name,
      message:
        "Professional AI agent created successfully with advanced configuration",
    };
  } catch (error: any) {
    console.error("Error creating professional agent:", error);
    throw error;
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
// ... existing code until updateAgent function ...

export async function updateAgent(agentId: string, updates: any) {
  try {
    console.log(`Starting updateAgent for ID: ${agentId}`);

    // Check agent existence first
    try {
      const checkResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      });

      if (!checkResponse.ok) {
        console.error(`Agent check failed: ${checkResponse.status} ${checkResponse.statusText}`);
        if (checkResponse.status === 404) {
          console.warn(`Agent ${agentId} not found in ElevenLabs, skipping remote update`);
          return { success: true, warning: "Agent not found in ElevenLabs, updated locally only" };
        }
      }
    } catch (checkError) {
      console.error("Error checking agent existence:", checkError);
    }

    // Import system tools
    const { getDefaultSystemTools, combineTools } = await import('./systemTools');

    // Build the patch object
    const patch: any = {};

    if (updates.name) patch.name = updates.name;
    if (typeof updates.disabled === "boolean") patch.disabled = updates.disabled;

    // Handle conversation config updates
    if (updates.first_message || updates.system_prompt || updates.voice_id || updates.knowledge_documents || updates.llm_model || updates.temperature !== undefined || updates.language || updates.tools || updates.max_duration_seconds) {
      patch.conversation_config = {};

      // Handle agent-level updates
      if (updates.first_message || updates.system_prompt || updates.knowledge_documents || updates.llm_model || updates.temperature !== undefined || updates.language || updates.tools) {
        patch.conversation_config.agent = {};

        if (updates.first_message) {
          patch.conversation_config.agent.first_message = updates.first_message;
        }

        if (updates.system_prompt || updates.knowledge_documents || updates.tools !== undefined) {
          patch.conversation_config.agent.prompt = {};

          if (updates.system_prompt) {
            patch.conversation_config.agent.prompt.prompt = updates.system_prompt;
          }

          if (updates.knowledge_documents) {
            const knowledgeBase = updates.knowledge_documents
              .filter((doc: any) => doc.document_id)
              .map((doc: any) => ({
                id: doc.document_id,
                document_id: doc.document_id,
                name: doc.name,
                type: doc.type
              }));
            patch.conversation_config.agent.prompt.knowledge_base = knowledgeBase;
          }

          // Handle tools - always include system tools
          if (updates.tools !== undefined) {
            const allTools = combineTools(updates.tools);
            patch.conversation_config.agent.prompt.tools = allTools;
          }
        }

        // Handle LLM settings
        if (updates.llm_model || updates.temperature !== undefined) {
          patch.conversation_config.agent.llm = {};
          if (updates.llm_model) {
            patch.conversation_config.agent.llm.model = updates.llm_model;
          }
          if (updates.temperature !== undefined) {
            patch.conversation_config.agent.llm.temperature = updates.temperature;
          }
        }

        // Handle language
        if (updates.language) {
          patch.conversation_config.agent.language = updates.language;
        }
      }

      // Handle TTS updates
      if (updates.voice_id || updates.language) {
        patch.conversation_config.tts = {};

        if (updates.voice_id) {
          patch.conversation_config.tts.voice_id = updates.voice_id;
        }

        // Update TTS model
        if (updates.language) {
          let ttsModel = "eleven_turbo_v2_5";
          patch.conversation_config.tts.model_id = ttsModel;
        }
      }

      // Handle conversation settings
      if (updates.max_duration_seconds) {
        patch.conversation_config.conversation = {
          max_duration_seconds: updates.max_duration_seconds,
          text_only: false
        };
      }
    }

    // Update ElevenLabs if there are changes
    if (Object.keys(patch).length > 0) {
      console.log("Updating ElevenLabs agent with patch:", JSON.stringify(patch, null, 2));

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs update error:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // Not valid JSON
        }

        throw new Error(errorData?.detail?.message || errorData?.message || `ElevenLabs API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Agent updated successfully in ElevenLabs:", result);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating agent:", error);
    throw error;
  }
}
// ... rest of the existing code ...

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

    // Hit ElevenLabs with correct format
    const callPayload = {
      agent_id: agent.agentId,
      agent_phone_number_id: ELEVENLABS_PHONE_ID,
      to_number: formatted,
    };

    if (customMessage) {
      callPayload.agent_start_message = customMessage;
    }

    console.log("Making call with payload:", callPayload);

    const resp = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound_call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(callPayload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("ElevenLabs call error:", errText);
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
