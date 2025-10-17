import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA_API}/promoters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization')!,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error fetching promoters: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin promoters API:', error);
    return NextResponse.json(
      { error: 'Server error fetching promoters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA_API}/promoters`, {
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
        { error: errorData.message || 'Error creating promoter' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating promoter:', error);
    return NextResponse.json(
      { error: 'Server error creating promoter' },
      { status: 500 }
    );
  }
}
