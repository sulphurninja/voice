import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import Order from '@/models/orderModel';
import Reservation from '@/models/reservationModel';
import MenuItem from '@/models/menuModel';
import { getUserFromRequest } from '@/lib/jwt';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { callId } = await request.json();
    
    if (!callId) {
      return NextResponse.json({ message: 'Call ID required' }, { status: 400 });
    }

    await connectDB();

    // Get the call with transcription
    const call = await Call.findOne({
      _id: callId,
      userId: userData.userId
    });

    if (!call || !call.transcription) {
      return NextResponse.json({ message: 'Call or transcription not found' }, { status: 404 });
    }

    // Get menu items to help with order extraction
    const menuItems = await MenuItem.find({ userId: userData.userId, available: true });
    const menuItemsText = menuItems.map(item => 
      `${item.name} - ₹${item.price} (${item.category})`
    ).join('\n');

    // Use OpenAI to extract structured data
    const extractionPrompt = `
    Analyze this restaurant call transcript and extract any orders or reservations made.
    
    Available Menu Items:
    ${menuItemsText}
    
    Call Transcript:
    ${call.transcription}
    
    Extract the following information in JSON format:
    {
      "hasOrder": boolean,
      "hasReservation": boolean,
      "order": {
        "customerName": string,
        "customerPhone": string,
        "items": [{"name": string, "quantity": number, "price": number, "specialInstructions"?: string}],
        "orderType": "dine_in" | "takeaway" | "delivery",
        "tableNumber"?: number,
        "notes"?: string
      },
      "reservation": {
        "customerName": string,
        "customerPhone": string,
        "partySize": number,
        "dateTime": ISO date string,
        "specialRequests"?: string,
        "notes"?: string
      }
    }
    
    Only extract information that is clearly mentioned in the transcript. If no order or reservation is made, set the respective boolean to false.
    Match menu items as closely as possible to the available items list.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting structured data from restaurant call transcripts. Return only valid JSON."
        },
        {
          role: "user",
          content: extractionPrompt
        }
      ],
      temperature: 0.1,
    });

    const extractedData = JSON.parse(response.choices[0].message.content || '{}');
    
    const results = {
      orderCreated: false,
      reservationCreated: false,
      orderId: null as string | null,
      reservationId: null as string | null,
    };

    // Create order if found
    if (extractedData.hasOrder && extractedData.order) {
      const orderData = extractedData.order;
      
      // Calculate totals
      const subtotal = orderData.items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      const tax = subtotal * 0.18; // 18% GST
      const total = subtotal + tax;

      // Generate order number
      const orderCount = await Order.countDocuments({ userId: userData.userId });
      const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

      const order = await Order.create({
        userId: userData.userId,
        callId: call._id,
        orderNumber,
        customerName: orderData.customerName || call.contactName || 'Unknown',
        customerPhone: orderData.customerPhone || call.phoneNumber,
        items: orderData.items,
        subtotal,
        tax,
        total,
        status: 'confirmed',
        orderType: orderData.orderType || 'takeaway',
        tableNumber: orderData.tableNumber,
        notes: orderData.notes,
        estimatedTime: 30, // Default 30 minutes
        placedAt: call.startTime || new Date(),
      });

      results.orderCreated = true;
      results.orderId = order._id.toString();
    }

    // Create reservation if found
    if (extractedData.hasReservation && extractedData.reservation) {
      const reservationData = extractedData.reservation;

      const reservation = await Reservation.create({
        userId: userData.userId,
        callId: call._id,
        customerName: reservationData.customerName || call.contactName || 'Unknown',
        customerPhone: reservationData.customerPhone || call.phoneNumber,
        partySize: reservationData.partySize,
        dateTime: new Date(reservationData.dateTime),
        duration: 90, // Default 90 minutes
        status: 'confirmed',
        specialRequests: reservationData.specialRequests,
        notes: reservationData.notes,
      });

      results.reservationCreated = true;
      results.reservationId = reservation._id.toString();
    }

    // Update call outcome if we created something
    if (results.orderCreated) {
      call.outcome = 'order_placed';
    } else if (results.reservationCreated) {
      call.outcome = 'reservation_made';
    }
    
    await call.save();

    return NextResponse.json({
      success: true,
      ...results,
      extractedData
    });

  } catch (error: any) {
    console.error('Error extracting call data:', error);
    return NextResponse.json(
      { message: 'Failed to extract data', error: error.message },
      { status: 500 }
    );
  }
}