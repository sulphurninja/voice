import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/contactModel';
import { getUserFromRequest } from '@/lib/jwt';

// Delete a single contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const contactId = params.id;

    // Check if contact belongs to user
    const contact = await Contact.findOne({
      _id: contactId,
      userId: typeof userData === 'object' ? userData.userId : userData
    });

    if (!contact) {
      return NextResponse.json(
        { message: 'Contact not found' },
        { status: 404 }
      );
    }

    // Delete the contact
    await Contact.findByIdAndDelete(contactId);

    return NextResponse.json({
      message: 'Contact deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { message: 'Failed to delete contact', error: error.message },
      { status: 500 }
    );
  }
}
