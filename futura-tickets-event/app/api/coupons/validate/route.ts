import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { code, eventId } = await request.json();

    // Make the API call
    const res = await fetch(`http:localhost:3000/events/coupon/${code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId })
    });

    const data = await res.json();

    if (!data.discount || data.discount <= 0) {
      throw new Error('Invalid coupon');
    }

    return NextResponse.json({
      valid: true,
      discount: data.discount,
      code: code
    });
    
  } catch (error) {
    console.error('Error validando el cupón:', error);
    throw new Error('Invalid coupon');
  }
}