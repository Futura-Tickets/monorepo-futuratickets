import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const urlParams = await params;
    const body = await request.json();

    // Make the API call
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/notifications/${urlParams.id}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": request.headers.get('authorization')!
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Error marking the notification as read" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error marking the notification as read:", error);
    throw new Error(`Error marking the notification as read ${error}`);
  }
}