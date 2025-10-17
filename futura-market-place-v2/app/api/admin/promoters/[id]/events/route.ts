import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promoterId } = await params;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUTURA}/api/events?promoter=${promoterId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('authorization')!,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error fetching promoter events: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in promoter events API:', error);
    return NextResponse.json(
      { error: 'Server error fetching promoter events' },
      { status: 500 }
    );
  }
}
