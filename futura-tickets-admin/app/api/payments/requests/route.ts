import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Make the API call
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/payments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": request.headers.get('authorization')!
      }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching payment requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Make the API call
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": request.headers.get('authorization')!
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || 'Error creating payment request' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating payment request' },
      { status: 500 }
    );
  }
}