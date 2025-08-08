import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/contactModel';
import { getUserFromRequest } from '@/lib/jwt';

// Delete multiple contacts in a batch operation
export async function DELETE(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the array of contact IDs from the request body
    const { contactIds } = await request.json();

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { message: 'No contact IDs provided' },
        { status: 400 }
      );
    }

    await connectDB();

    // Delete all contacts that match the IDs and belong to the user
    const result = await Contact.deleteMany({
      _id: { $in: contactIds },
      userId: typeof userData === 'object' ? userData.userId : userData
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} contacts`,
      deletedCount: result.deletedCount
    });

  } catch (error: any) {
    console.error('Error deleting contacts:', error);
    return NextResponse.json(
      { message: 'Failed to delete contacts', error: error.message },
      { status: 500 }
    );
  }
}
