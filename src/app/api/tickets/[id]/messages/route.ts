import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/ticketModel";
import { getUserFromRequest } from "@/lib/jwt";

// POST a new message to a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = typeof userData === "object" ? userData.userId : userData;
    const ticketId = params.id;
    const body = await request.json();

    // Validate content
    if (!body.content) {
      return NextResponse.json(
        { message: "Message content is required" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findOne({ _id: ticketId, userId });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Add new message
    ticket.messages.push({
      content: body.content,
      sender: "user", // User is always the sender in client-side API
      attachments: body.attachments || [],
    });

    // Update the ticket's updatedAt timestamp
    ticket.updatedAt = new Date();

    await ticket.save();

    return NextResponse.json({
      ticket,
      message: ticket.messages[ticket.messages.length - 1]
    });
  } catch (err: any) {
    console.error("Error adding message:", err);
    return NextResponse.json(
      { message: "Failed to add message", error: err.message },
      { status: 500 }
    );
  }
}
