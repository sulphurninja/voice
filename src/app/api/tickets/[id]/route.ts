import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/ticketModel";
import { getUserFromRequest } from "@/lib/jwt";

// GET a specific ticket
export async function GET(
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

    const ticket = await Ticket.findOne({ _id: ticketId, userId });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (err: any) {
    console.error("Error fetching ticket:", err);
    return NextResponse.json(
      { message: "Failed to fetch ticket", error: err.message },
      { status: 500 }
    );
  }
}

// PUT to update a ticket
export async function PUT(
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

    const ticket = await Ticket.findOne({ _id: ticketId, userId });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Update ticket fields if provided
    if (body.title) ticket.title = body.title;
    if (body.description) ticket.description = body.description;
    if (body.status) ticket.status = body.status;
    if (body.priority) ticket.priority = body.priority;
    if (body.category) ticket.category = body.category;

    await ticket.save();

    return NextResponse.json({ ticket });
  } catch (err: any) {
    console.error("Error updating ticket:", err);
    return NextResponse.json(
      { message: "Failed to update ticket", error: err.message },
      { status: 500 }
    );
  }
}

// DELETE a ticket
export async function DELETE(
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

    const ticket = await Ticket.findOneAndDelete({ _id: ticketId, userId });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting ticket:", err);
    return NextResponse.json(
      { message: "Failed to delete ticket", error: err.message },
      { status: 500 }
    );
  }
}
