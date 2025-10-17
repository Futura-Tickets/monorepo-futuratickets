import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
) {
  try {
    // Make the API call
    const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/admin/events/notifications/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": request.headers.get('authorization')!
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error(`Error marking all notifications as read ${error}`);
  }
}