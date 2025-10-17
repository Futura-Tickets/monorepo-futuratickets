import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {

    // Make the API call
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/accounts/export`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('authorization')!,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    throw new Error(`API request failed with status ${error}`);
  }
}