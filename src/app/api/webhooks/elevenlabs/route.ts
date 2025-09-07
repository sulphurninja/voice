// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Call from "@/models/callModel";
import Agent from "@/models/agentModel";
import { updateUserUsage } from "@/lib/plan-limits";
import { OpenAI } from "openai";

export const runtime = "nodejs"; // ensure Node runtime

const SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET!;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------- Signature utils ----------
function parseSignature(header: string) {
  const map = new Map<string, string>();
  for (const part of header.split(",")) {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (k && v) map.set(k, v);
  }
  // header may be like: "1, t=TIMESTAMP, v0=HEX"
  const t = map.get("t") ?? "";
  let v0 = map.get("v0") ?? "";
  if (v0.startsWith("v0=")) v0 = v0.slice(3);
  return { t, v0 };
}

function isValidSignature(raw: Buffer, header: string | null) {
  if (!header) return false;
  const { t, v0 } = parseSignature(header);
  if (!t || !v0) return false;

  // Optional timestamp tolerance (30 minutes)
  const now = Math.floor(Date.now() / 1000);
  const skew = Math.abs(now - Number(t));
  if (Number.isFinite(Number(t)) && skew > 30 * 60) {
    console.warn("Signature timestamp outside tolerance");
    return false;
  }

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${t}.${raw.toString("utf8")}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(v0), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ---------- Outcome analysis (kept, but fully guarded) ----------
async function analyzeCallOutcome(summary: string): Promise<string> {
  try {
    const s = (summary || "").trim();
    if (!s) return "neutral";

    const r = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.1,
      max_tokens: 50,
      messages: [
        {
          role: "system",
          content: `You are analyzing a restaurant AI voice assistant call. Based on the conversation summary, determine the primary outcome.

Possible outcomes:
- order_placed
- reservation_made
- inquiry_answered
- complaint_logged
- appointment_scheduled
- highly_interested
- interested
- needs_follow_up
- considering
- neutral
- not_interested
- wrong_number
- no_answer

Respond with only the outcome name.`,
        },
        { role: "user", content: `Call summary: ${s}` },
      ],
    });

    const raw = r.choices[0]?.message?.content?.trim().toLowerCase() || "neutral";
    if (raw.includes("order")) return "order_placed";
    if (raw.includes("reservation")) return "reservation_made";
    if (raw.includes("inquiry") || raw.includes("question")) return "inquiry_answered";
    if (raw.includes("complaint")) return "complaint_logged";
    if (raw.includes("appointment") || raw.includes("callback")) return "appointment_scheduled";
    if (raw.includes("highly") && raw.includes("interest")) return "highly_interested";
    if (raw.includes("not") && raw.includes("interest")) return "not_interested";
    if (raw.includes("follow")) return "needs_follow_up";
    if (raw.includes("consider")) return "considering";
    if (raw.includes("wrong")) return "wrong_number";
    return raw || "neutral";
  } catch (err) {
    console.error("Outcome analysis failed:", err);
    return "neutral";
  }
}

export async function POST(req: NextRequest) {
  try {

    // Read raw body first (needed for signature)
    const raw = Buffer.from(await req.arrayBuffer());

    // Signature header (case-insensitive)
    const sigHeader =
      req.headers.get("elevenlabs-signature") ||
      req.headers.get("ElevenLabs-Signature") ||
      req.headers.get("ELEVENLABS-SIGNATURE");

    if (!isValidSignature(raw, sigHeader)) {
      console.log("Invalid ElevenLabs webhook signature");
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
    }

    // Parse payload
    const body = JSON.parse(raw.toString("utf8"));
    const type = body.type ?? body?.data?.type ?? "unknown";

    // We only act on post_call_transcription; acknowledge others quickly
    if (type !== "post_call_transcription") {
      // Accept post_call_audio (no-op) and any other future types
      return NextResponse.json({ ok: true, ignored: type });
    }

    // Minimal synchronous processing (we still do DB work here; keep it quick)
    const event = body.data  // some SDKs wrap under data
    const {
      conversation_id,
      agent_id,
      status, // "done" | "completed" | "failed"
      transcript = [],
      analysis = {},
      transcript_summary,
      metadata = {},
      call_duration_secs,
      cost,
      call_sid, // sometimes present
    } = event;
    console.log("Received webhook with status:", status);
    console.log("Full event data:", JSON.stringify(event, null, 2));

    // Normalize fields
    const finalConversationId: string | undefined = conversation_id || metadata.conversation_id;
    const twilioCallSid: string | undefined =
      call_sid || metadata.call_sid || metadata.twilio_call_sid;

    const duration =
      typeof call_duration_secs === "number"
        ? call_duration_secs
        : typeof metadata.call_duration_secs === "number"
          ? metadata.call_duration_secs
          : 0;

    // cost units can vary; store raw numeric value
    const rawCost =
      typeof cost === "number"
        ? cost
        : typeof metadata.cost === "number"
          ? metadata.cost
          : 0;

    // Build transcript string
    let fullTranscript = "";
    if (Array.isArray(transcript) && transcript.length) {
      fullTranscript = transcript
        .map((seg: any) => {
          const role = seg.role || seg.speaker || "unknown";
          const text = seg.message || seg.text || "";
          return `${role}: ${text}`;
        })
        .join("\n");
    }

    const summary = analysis?.transcript_summary || transcript_summary || "";

    await connectDB();

    // Prefer conversation_id to find the call row
    let call =
      (finalConversationId && (await Call.findOne({ conversationId: finalConversationId }))) ||
      (twilioCallSid && (await Call.findOne({ elevenLabsCallSid: twilioCallSid })));

    // If still not found, create a minimal record (mainly for inbound)
    if (!call) {
      let userId = null;
      if (agent_id) {
        const agent = await Agent.findOne({ agentId: agent_id });
        if (agent) userId = agent.userId;
      }

      call = new Call({
        userId,
        agentId: agent_id,
        conversationId: finalConversationId,
        elevenLabsCallSid: twilioCallSid,
        direction: metadata?.to_number ? "outbound" : "inbound",
        status: "initiated",
        phoneNumber: metadata?.to_number || metadata?.from_number || "unknown",
        startTime: new Date(),
      });
    }

    if (status === "done") {
      call.status = "completed";
    } else if (status === "failed") {
      call.status = "failed";
    }

    // Update other fields
    call.conversationId = finalConversationId || call.conversationId;
    if (twilioCallSid && !call.elevenLabsCallSid) call.elevenLabsCallSid = twilioCallSid;

    call.duration = duration;
    call.cost = rawCost; // keep as-is (no cents->dollars assumption)
    call.endTime = new Date();
    if (fullTranscript) call.transcription = fullTranscript;
    if (summary) call.summary = summary;

    // Outcome analysis (non-blocking-ish)
    try {
      const outcome = await analyzeCallOutcome(summary);
      call.outcome = outcome;
    } catch {
      /* already guarded */
    }

    await call.save();

    // Update usage minutes if completed
    if ((status === "done" || status === "completed") && duration > 0 && call.userId) {
      const minutesUsed = Math.ceil(duration / 60);
      try {
        await updateUserUsage(call.userId.toString(), minutesUsed);
      } catch (e) {
        console.error("Failed to update usage:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    // Return 200 so ElevenLabs doesn't disable the webhook; include ok:false in body for our logs
    return NextResponse.json({ ok: false, error: err?.message ?? "server_error" });
  }
}
