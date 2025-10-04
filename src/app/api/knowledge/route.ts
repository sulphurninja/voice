import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import KnowledgeDocument from '@/models/knowledgeModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = typeof userData === 'object' ? userData.userId : userData;

    // Get all knowledge documents for the user
    const documents = await KnowledgeDocument.find({ userId }).sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      total_items: documents.length,
      active_items: documents.filter(doc => doc.elevenLabsDocumentId).length,
      global_items: documents.filter(doc => doc.isGlobal).length,
      total_usage: documents.reduce((sum, doc) => sum + doc.usageCount, 0),
    };

    return NextResponse.json({
      documents,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json(
      { message: 'Failed to fetch knowledge base', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = typeof userData === 'object' ? userData.userId : userData;
    const body = await request.json();

    // Create FormData for ElevenLabs upload
    const formData = new FormData();
    let elevenLabsDocumentId: string | null = null;

    try {
      if (body.type === 'text' && body.content) {
        const tempFile = new File([body.content], `${body.name}.txt`, { type: "text/plain" });
        formData.append("file", tempFile);
        formData.append("name", body.name);
      } else if (body.type === 'url' && body.url) {
        formData.append("url", body.url);
        formData.append("name", body.name);
      } else if (body.type === 'file' && body.fileData) {
        const buffer = Buffer.from(body.fileData, 'base64');
        const file = new File([buffer], body.fileName || 'document', { type: body.mimeType });
        formData.append("file", file);
        formData.append("name", body.name);
      }

      // Upload to ElevenLabs
      const response = await fetch("https://api.elevenlabs.io/v1/convai/knowledge-base", {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: formData
      });

      if (response.ok) {
        const elevenLabsData = await response.json();
        elevenLabsDocumentId = elevenLabsData.id || elevenLabsData.document_id;
      }
    } catch (error) {
      console.error('Failed to upload to ElevenLabs:', error);
    }

    // Save to database
    const document = new KnowledgeDocument({
      userId,
      name: body.name,
      type: body.type,
      content: body.content,
      url: body.url,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      elevenLabsDocumentId,
      category: body.category,
      tags: body.tags || [],
      description: body.description,
      isGlobal: body.isGlobal || false,
      agentIds: body.agentIds || [],
    });

    await document.save();

    // If this is a global document and has ElevenLabs ID, sync it to all agents
    if (body.isGlobal && elevenLabsDocumentId) {
      try {
        const { syncGlobalKnowledgeToAllAgents } = await import('@/lib/knowledgeSync');
        const syncResult = await syncGlobalKnowledgeToAllAgents(userId);
        console.log('Global document sync result:', syncResult);

        return NextResponse.json({
          message: 'Knowledge document created and synced to all agents',
          document,
          syncResult,
        });
      } catch (syncError) {
        console.error('Error syncing global document:', syncError);
        // Don't fail the creation, just log the sync error
        return NextResponse.json({
          message: 'Knowledge document created successfully (sync pending)',
          document,
          syncError: syncError.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Knowledge document created successfully',
      document,
    });
  } catch (error: any) {
    console.error('Error creating knowledge document:', error);
    return NextResponse.json(
      { message: 'Failed to create knowledge document', error: error.message },
      { status: 500 }
    );
  }
}
