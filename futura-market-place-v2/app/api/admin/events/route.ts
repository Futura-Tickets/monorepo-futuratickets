import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization')!,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error fetching events: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin events API:', error);
    return NextResponse.json(
      { error: 'Server error fetching events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization')!,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.message || 'Error creating event' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Server error creating event' },
      { status: 500 }
    );
  }
}
