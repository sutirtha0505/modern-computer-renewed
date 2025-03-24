// app/api/refund/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay instance with your credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID!,
  key_secret: process.env.RAZORPAY_KEY!, // Make sure to set this in your environment variables
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, payment_id, amount } = body;

    // Validate inputs
    if (!order_id || !payment_id || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Refund the payment
    const refund = await razorpay.payments.refund(payment_id, {
      amount, // The amount to be refunded
      notes: {
        order_id, // You can add any additional notes or metadata here
      },                                        
    });

    // Respond with the refund details
    return NextResponse.json(refund, { status: 200 });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
