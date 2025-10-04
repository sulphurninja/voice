import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import KnowledgeDocument from '@/models/knowledgeModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const userId = typeof userData === 'object' ? userData.userId : userData;
    const document = await KnowledgeDocument.findOne({ _id: id, userId });

    if (!document) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { message: 'Failed to fetch document', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const userId = typeof userData === 'object' ? userData.userId : userData;
    const existingDoc = await KnowledgeDocument.findOne({ _id: id, userId });

    if (!existingDoc) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Check if isGlobal status is changing
    const wasGlobal = existingDoc.isGlobal;
    const willBeGlobal = body.isGlobal;

    const document = await KnowledgeDocument.findOneAndUpdate(
      { _id: id, userId },
      { ...body, lastModified: new Date() },
      { new: true }
    );

    // If document is becoming global, sync to all agents
    if (!wasGlobal && willBeGlobal && document.elevenLabsDocumentId) {
      try {
        const { syncGlobalKnowledgeToAllAgents } = await import('@/lib/knowledgeSync');
        const syncResult = await syncGlobalKnowledgeToAllAgents(userId);
        console.log('Document made global, sync result:', syncResult);

        return NextResponse.json({
          ...document.toObject(),
          syncResult,
          message: 'Document updated and synced to all agents'
        });
      } catch (syncError) {
        console.error('Error syncing newly global document:', syncError);
      }
    }

    // If document is no longer global, remove from agents (optional - you might want to keep it)
    if (wasGlobal && !willBeGlobal) {
      // Optionally remove from all agents or just update the flag
      console.log('Document is no longer global');
    }

    return NextResponse.json(document);
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { message: 'Failed to update document', error: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const userId = typeof userData === 'object' ? userData.userId : userData;
    const document = await KnowledgeDocument.findOne({ _id: id, userId });

    if (!document) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Delete from ElevenLabs if it exists
    if (document.elevenLabsDocumentId) {
      try {
        await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-base/${document.elevenLabsDocumentId}`, {
          method: "DELETE",
          headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
        });
      } catch (error) {
        console.error('Failed to delete from ElevenLabs:', error);
      }
    }

    await KnowledgeDocument.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { message: 'Failed to delete document', error: error.message },
      { status: 500 }
    );
  }
}
