import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/models', {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for TTS models
    const ttsModels = data.models?.filter((model: any) =>
      model.model_id.includes('turbo') ||
      model.model_id.includes('multilingual') ||
      model.model_id.includes('flash')
    ) || [];

    return NextResponse.json({
      models: ttsModels,
      available_model_ids: ttsModels.map((m: any) => m.model_id)
    });
  } catch (error: any) {
    console.error('Error fetching TTS models:', error);
    return NextResponse.json(
      { message: 'Failed to fetch TTS models', error: error.message },
      { status: 500 }
    );
  }
}
