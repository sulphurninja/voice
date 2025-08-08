import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/ticketModel";
import { getUserFromRequest } from "@/lib/jwt";

// GET all tickets for the user
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = typeof userData === "object" ? userData.userId : userData;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const query = searchParams.get('query');

    // Build filter
    const filter: any = { userId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(filter).sort({ updatedAt: -1 });

    return NextResponse.json({ tickets });
  } catch (err: any) {
    console.error("Error fetching tickets:", err);
    return NextResponse.json(
      { message: "Failed to fetch tickets", error: err.message },
      { status: 500 }
    );
  }
}

// POST a new ticket
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = typeof userData === "object" ? userData.userId : userData;
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newTicket = new Ticket({
      userId,
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority || "medium",
      messages: [
        {
          content: body.description,
          sender: "user",
        }
      ]
    });

    await newTicket.save();

    return NextResponse.json({ ticket: newTicket });
  } catch (err: any) {
    console.error("Error creating ticket:", err);
    return NextResponse.json(
      { message: "Failed to create ticket", error: err.message },
      { status: 500 }
    );
  }
}
