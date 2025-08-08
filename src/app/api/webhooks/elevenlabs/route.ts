// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Call from "@/models/callModel";
import { OpenAI } from "openai";
import { updateUserUsage } from "@/lib/plan-limits";

const SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET!;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Verify ElevenLabs signature header */
function isValidSignature(raw: Buffer, header: string | null) {
  if (!header) return false;

  const parts = header.split(",").reduce<Record<string, string>>((acc, p) => {
    const [k, v] = p.split("=");
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const received  = parts["v0"];
  if (!timestamp || !received) return false;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${timestamp}.${raw}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

async function analyzeCallOutcome(summary: string): Promise<string> {
  if (!summary || summary.trim() === "") {
    return "neutral";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert sales analyst. Analyze the following call summary and determine the outcome.
          Select the most appropriate outcome from these options:
          - highly_interested: Prospect showed strong interest and is eager to proceed
          - interested: Prospect showed general interest in the offering
          - qualified_lead: Prospect meets qualification criteria and has potential
          - appointment_scheduled: A meeting or follow-up appointment was set
          - opportunity_created: Prospect is ready for a proposal or next steps in sales process
          - needs_follow_up: Requires additional contact to progress
          - considering: Prospect is thinking about the offer but not committed
          - neutral: Conversation was neither positive nor negative
          - more_information_requested: Prospect needs additional details
          - call_back_later: Prospect asked to be contacted at a later time
          - not_interested: Prospect explicitly declined the offer
          - do_not_call: Prospect requested no further contact
          - unqualified: Prospect does not meet basic criteria for the offering
          - wrong_number: Reached an incorrect or unintended recipient
          - complaint: Prospect expressed dissatisfaction or filed a complaint

          Respond with only one of these outcome types based on your analysis.`
        },
        {
          role: "user",
          content: `Call summary: ${summary}`
        }
      ],
      temperature: 0.3,
      max_tokens: 50
    });

    const outcome = response.choices[0].message.content?.trim().toLowerCase() || "neutral";

    // Normalize the outcome to match our expected format
    if (outcome.includes("highly") && outcome.includes("interest")) return "highly_interested";
    if (outcome.includes("interest") && !outcome.includes("not")) return "interested";
    if (outcome.includes("qualified") && !outcome.includes("un")) return "qualified_lead";
    if (outcome.includes("appointment") || outcome.includes("schedul")) return "appointment_scheduled";
    if (outcome.includes("opportunity")) return "opportunity_created";
    if (outcome.includes("follow") && outcome.includes("up")) return "needs_follow_up";
    if (outcome.includes("consider")) return "considering";
    if (outcome.includes("neutral")) return "neutral";
    if (outcome.includes("more") && outcome.includes("information")) return "more_information_requested";
    if (outcome.includes("call") && outcome.includes("back")) return "call_back_later";
    if (outcome.includes("not") && outcome.includes("interest")) return "not_interested";
    if (outcome.includes("do") && outcome.includes("not") && outcome.includes("call")) return "do_not_call";
    if (outcome.includes("unqualified")) return "unqualified";
    if (outcome.includes("wrong")) return "wrong_number";
    if (outcome.includes("complaint")) return "complaint";

    // If we can't match to a standard outcome, return the raw outcome
    return outcome;
  } catch (error) {
    console.error("Error analyzing call outcome:", error);
    return "neutral";
  }
}

export async function POST(req: NextRequest) {
  /** 1 ▸ read raw body & verify signature */
  const raw = Buffer.from(await req.arrayBuffer());

  if (!isValidSignature(raw, req.headers.get("elevenlabs-signature"))) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  /** 2 ▸ parse once */
  const payload = JSON.parse(raw.toString());

  /**
   * ElevenLabs sends two slightly different shapes:
   *   A) { type, data:{ …analysis:{transcript_summary}… } }
   *   B) { status:'done', analysis:{transcript_summary}, … }   (no wrapper)
   *
   * event = the object that actually holds call details.
   */
  const event = payload.data ?? payload;
  const eventType = payload.type ?? event.type ?? "post_call_transcription";

  if (eventType !== "post_call_transcription") {
    // ignore other webhook types (e.g., TTS status)
    return NextResponse.json({ ok: true });
  }

  /** 3 ▸ pull the fields we care about from event */
  const {
    metadata: {
      call_sid,
      call_duration_secs = 0,
      cost = 0,
    } = {},
    transcript = [],
    analysis = {},
    transcript_summary: legacySummary,
    conversation_id,
    status,
    agent_id, // This identifies which agent handled the call
  } = event;

  // summary can live in analysis or directly on the root (legacy)
  const transcript_summary =
    analysis.transcript_summary ?? legacySummary ?? "";

  console.log("Webhook summary:", transcript_summary);

  /** 4 ▸ analyze the call outcome based on the summary */
  const outcome = await analyzeCallOutcome(transcript_summary);
  console.log("Call outcome:", outcome);

  /** 5 ▸ update DB - handle both inbound and outbound calls */
  await connectDB();
  
  // Try to find existing call by SID first (for outbound calls)
  let call = await Call.findOne({ elevenLabsCallSid: call_sid });
  
  if (!call) {
    // If not found by call_sid, this might be an inbound call
    // Try to find by conversation_id or create a new record
    call = await Call.findOne({ conversationId: conversation_id });
    
    if (!call) {
      // Create new call record for inbound calls
      call = new Call({
        elevenLabsCallSid: call_sid,
        conversationId: conversation_id,
        agentId: agent_id,
        type: 'inbound', // Mark as inbound call
        status: 'initiated',
        // You might want to extract phone numbers from metadata or transcript
        // depending on how your inbound calls are structured
      });
      console.log("Created new inbound call record:", conversation_id);
    }
  } else {
    // This is an outbound call - mark it as such if not already set
    if (!call.type) {
      call.type = 'outbound';
    }
  }

  // Update call details (same for both inbound and outbound)
  call.status = status === "done" ? "completed" : "failed";
  call.duration = call_duration_secs;
  call.cost = cost / 100; // paise/cents → rupees/dollars
  call.endTime = new Date();
  call.transcription = transcript
    .map((seg: { role: string; message: string }) => `${seg.role}: ${seg.message}`)
    .join("\n");
  call.summary = transcript_summary;
  call.conversationId = conversation_id;
  call.hasAudio = status === "done";
  call.outcome = outcome;
  call.agentId = agent_id; // Ensure agent_id is stored

  await call.save();

  /** 6 ▸ Update user usage based on call duration */
  if (status === "done" && call_duration_secs > 0) {
    try {
      // Convert seconds to minutes, rounding up to nearest minute
      const minutesUsed = Math.ceil(call_duration_secs / 60);

      // Get the user ID from the call
      const userId = call.userId?.toString();

      if (userId) {
        // Update the user's usage stats
        const usageResult = await updateUserUsage(userId, minutesUsed);

        if (!usageResult.success) {
          console.error("Failed to update user usage:", usageResult.message);
        } else {
          console.log("Updated user usage:", {
            userId,
            minutesUsed,
            callType: call.type,
            minutesFromPlan: usageResult.minutesFromPlan,
            minutesFromWallet: usageResult.minutesFromWallet,
            walletCost: usageResult.walletCost / 100,
          });
        }
      } else {
        console.warn("No userId found for call:", call_sid);
      }
    } catch (error) {
      console.error("Error updating user usage for call:", call_sid, error);
    }
  }

  return NextResponse.json({ ok: true });
}
