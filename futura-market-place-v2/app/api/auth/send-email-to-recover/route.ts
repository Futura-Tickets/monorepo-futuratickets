import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Send email to recover endpoint called");

  try {
    const body = await request.json();
    const { email } = body;

    console.log("Email received:", email);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log(
      "Making request to:",
      `${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/recovery-email`
    );

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/recovery-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error sending recovery email" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recovery email sent successfully",
    });
  } catch (error) {
    console.error("Error in send-email-to-recover:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}