import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
      // Llamada a la API del backend sin autenticación
      const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA_API}/stripe/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `API request failed with status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `Server error: ${error}` },
      { status: 500 }
    );
  }
}
