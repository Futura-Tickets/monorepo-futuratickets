import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization')!,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error en la solicitud: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en API de perfil:', error);
    return NextResponse.json(
      { error: 'Error del servidor al obtener el perfil' },
      { status: 500 }
    );
  }
}