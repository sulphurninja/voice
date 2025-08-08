// Lists voices without leaking ElevenLabs branding or API key to the client.
import { NextResponse } from "next/server";
const KEY = process.env.ELEVENLABS_API_KEY!;
export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": KEY }
  });
  if (!res.ok) return NextResponse.json({ voices: [] }, { status: 500 });

  const json = await res.json();           // { voices: [ { voice_id,name,labels,preview_url… } ] }
  const safe = json.voices.map((v: any) => ({
    id   : v.voice_id,
    name : v.name,
    tags : v.labels?.accent || "General",
    demo : v.preview_url,
  }));
  return NextResponse.json({ voices: safe });
}
