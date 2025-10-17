import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { eventId, id } = resolvedParams;

    // Make the API call
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FUTURA}/admin/events/promocodes/${eventId}/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization')!,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || 'Error deleting the promo code' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting the promo code' },
      { status: 500 }
    );
  }
}