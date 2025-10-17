import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Register with ADMIN role
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA_API}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newAccount: {
          name,
          email,
          password,
          role: 'ADMIN', // Force ADMIN role
        },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.message || 'Error creating admin account' },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Set auth token as httpOnly cookie for middleware
    const response = NextResponse.json(data);
    if (data.token) {
      response.cookies.set('auth_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Error creating admin account:', error);
    return NextResponse.json(
      { error: 'Server error creating admin account' },
      { status: 500 }
    );
  }
}
