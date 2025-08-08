// app/api/audio/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;

  // Forward Range requests so the browser can seek inside the recording
  const rangeHeader = req.headers.get('range') ?? undefined;

  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
    {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        ...(rangeHeader && { Range: rangeHeader }),
      },
    },
  );

  if (!elevenRes.ok) {
    const errText = await elevenRes.text().catch(() => '');
    console.error(
      `ElevenLabs audio fetch failed (${conversationId}): ${elevenRes.status} ${errText}`,
    );
    return new NextResponse('Audio fetch failed', { status: elevenRes.status });
  }

  // ‼️  IMPORTANT: stream the Response body so large recordings aren’t buffered in memory
  return new NextResponse(elevenRes.body, {
    status: elevenRes.status, // 200 or 206 if Range request
    headers: {
      // keep ElevenLabs’ Content-Type (audio/mpeg) plus any range / length headers they send back
      'Content-Type': 'audio/mpeg',
      ...(elevenRes.headers.get('content-length')
        ? { 'Content-Length': elevenRes.headers.get('content-length')! }
        : {}),
      ...(elevenRes.headers.get('content-range')
        ? { 'Content-Range': elevenRes.headers.get('content-range')! }
        : {}),
      // tidy filename for downloads
      'Content-Disposition': `inline; filename="${conversationId}.mp3"`,
      // allow player to cache but always re-validate
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });
}
