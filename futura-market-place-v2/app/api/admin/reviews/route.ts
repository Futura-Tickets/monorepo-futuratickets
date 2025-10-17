import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/api/admin/reviews`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error fetching reviews: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin reviews API:', error);
    return NextResponse.json(
      { error: 'Server error fetching reviews' },
      { status: 500 }
    );
  }
}
