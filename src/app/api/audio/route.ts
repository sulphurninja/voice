import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { callId: string } }) {
  const res = await fetch(`https://api.elevenlabs.io/v1/conversations/${params.callId}/audio`, {
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    }
  });

  if (!res.ok) {
    return new NextResponse("Audio fetch failed", { status: 500 });
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
