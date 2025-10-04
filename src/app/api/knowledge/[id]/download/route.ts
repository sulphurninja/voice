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

    // Update usage count
    document.usageCount += 1;
    await document.save();

    let content = '';
    let fileName = document.name;
    let mimeType = 'text/plain';

    if (document.type === 'text') {
      content = document.content || '';
      fileName = `${document.name}.txt`;
    } else if (document.type === 'url') {
      content = `URL: ${document.url}\nDescription: ${document.description || ''}`;
      fileName = `${document.name}.txt`;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { message: 'Failed to download document', error: error.message },
      { status: 500 }
    );
  }
}
