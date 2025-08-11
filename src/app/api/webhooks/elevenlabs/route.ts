// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Call from "@/models/callModel";
import { OpenAI } from "openai";
import { updateUserUsage } from "@/lib/plan-limits";
import Agent from "@/models/agentModel";

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
          content: `You are analyzing a restaurant AI voice assistant call. Based on the conversation summary, determine the primary outcome.
          
          Restaurant-specific outcomes:
          - order_placed: Customer placed a food order
          - reservation_made: Customer made a table reservation
          - inquiry_answered: Customer asked about menu, hours, location, etc.
          - complaint_logged: Customer complained about service/food
          - appointment_scheduled: Customer scheduled a callback or meeting
          - highly_interested: Customer showed strong interest in services
          - interested: Customer showed general interest
          - needs_follow_up: Requires additional contact
          - considering: Customer is thinking about it
          - neutral: Conversation was neither positive nor negative
          - not_interested: Customer declined services
          - wrong_number: Wrong contact reached
          - no_answer: Call went unanswered
          
          Respond with only the outcome type.`
        },
        {
          role: "user",
          content: `Call summary: ${summary}`
        }
      ],
      temperature: 0.1,
      max_tokens: 50
    });

    const outcome = response.choices[0].message.content?.trim().toLowerCase() || "neutral";
    
    // Normalize outcomes
    if (outcome.includes("order")) return "order_placed";
    if (outcome.includes("reservation")) return "reservation_made";
    if (outcome.includes("inquiry") || outcome.includes("question")) return "inquiry_answered";
    if (outcome.includes("complaint")) return "complaint_logged";
    if (outcome.includes("appointment") || outcome.includes("callback")) return "appointment_scheduled";
    if (outcome.includes("highly") && outcome.includes("interest")) return "highly_interested";
    if (outcome.includes("interest") && !outcome.includes("not")) return "interested";
    if (outcome.includes("follow")) return "needs_follow_up";
    if (outcome.includes("consider")) return "considering";
    if (outcome.includes("not") && outcome.includes("interest")) return "not_interested";
    if (outcome.includes("wrong")) return "wrong_number";
    
    return outcome;
  } catch (error) {
    console.error("Error analyzing call outcome:", error);
    return "neutral";
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = Buffer.from(await req.arrayBuffer());
    
    if (!isValidSignature(raw, req.headers.get("elevenlabs-signature"))) {
      console.log("Invalid webhook signature");
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(raw.toString());
    console.log("Full webhook payload:", JSON.stringify(payload, null, 2));

    // Handle different webhook event types
    const eventType = payload.type || "unknown";
    console.log("Webhook event type:", eventType);

    if (eventType === "post_call_transcription" || eventType === "conversation_update") {
      const event = payload.data || payload;
      
      const {
        metadata = {},
        transcript = [],
        analysis = {},
        transcript_summary,
        conversation_id,
        status,
        agent_id,
        call_sid
      } = event;

      const finalCallSid = call_sid || metadata.call_sid;
      const callDuration = metadata.call_duration_secs || event.call_duration_secs || 0;
      const callCost = metadata.cost || event.cost || 0;
      
      console.log("Processing call:", {
        callSid: finalCallSid,
        conversationId: conversation_id,
        agentId: agent_id,
        duration: callDuration,
        status,
        hasTranscript: transcript.length > 0,
        hasSummary: !!transcript_summary
      });

      if (!finalCallSid && !conversation_id) {
        console.log("No call_sid or conversation_id found, skipping");
        return NextResponse.json({ ok: true });
      }

      await connectDB();

      // Find the call record
      let call = null;
      
      if (finalCallSid) {
        call = await Call.findOne({ elevenLabsCallSid: finalCallSid });
      }
      
      if (!call && conversation_id) {
        call = await Call.findOne({ conversationId: conversation_id });
      }

      if (!call) {
        console.log("Call not found, creating new record");
        // Try to find the agent to get userId
        let userId = null;
        if (agent_id) {
          const agent = await Agent.findOne({ agentId: agent_id });
          if (agent) {
            userId = agent.userId;
          }
        }

        if (!userId) {
          console.log("Cannot create call record without userId");
          return NextResponse.json({ ok: true });
        }

        call = new Call({
          userId,
          agentId: agent_id,
          elevenLabsCallSid: finalCallSid,
          conversationId: conversation_id,
          direction: "inbound", // Assume inbound if not found
          status: "initiated",
          phoneNumber: metadata.to_number || "unknown",
          contactName: "Unknown"
        });
      }

      // Process transcript
      let fullTranscript = "";
      if (transcript && transcript.length > 0) {
        fullTranscript = transcript
          .map((seg: any) => `${seg.role || seg.speaker}: ${seg.message || seg.text}`)
          .join("\n");
        console.log("Processed transcript length:", fullTranscript.length);
      }

      // Get summary
      const summary = analysis.transcript_summary || transcript_summary || "";
      console.log("Summary found:", !!summary, "Length:", summary.length);

      // Analyze outcome
      const outcome = summary ? await analyzeCallOutcome(summary) : "neutral";
      console.log("Determined outcome:", outcome);

      // Update call record
      if (status === "done" || status === "completed") {
        call.status = "completed";
      } else if (status === "failed") {
        call.status = "failed";
      }

      call.duration = callDuration;
      call.cost = callCost / 100; // Convert cents to dollars
      call.endTime = new Date();
      call.transcription = fullTranscript;
      call.summary = summary;
      call.conversationId = conversation_id;
      call.hasAudio = status === "done";
      call.outcome = outcome;

      await call.save();
      console.log("Call updated successfully:", call._id);

      // Update usage if call completed
      if (status === "done" && callDuration > 0) {
        const minutesUsed = Math.ceil(callDuration / 60);
        if (call.userId) {
          await updateUserUsage(call.userId.toString(), minutesUsed);
          console.log("Usage updated:", minutesUsed, "minutes");
        }
      }

      return NextResponse.json({ ok: true });
    }

    // Handle other event types
    console.log("Unhandled event type:", eventType);
    return NextResponse.json({ ok: true });

  } catch (error:any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}


