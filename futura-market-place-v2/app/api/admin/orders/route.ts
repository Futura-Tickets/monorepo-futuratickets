import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las órdenes del sistema
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization')!,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error fetching orders: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin orders API:', error);
    return NextResponse.json(
      { error: 'Server error fetching orders' },
      { status: 500 }
    );
  }
}
