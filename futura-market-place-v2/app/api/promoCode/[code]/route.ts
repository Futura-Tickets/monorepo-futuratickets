import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const urlParams = await params;
    const code = urlParams.code;

    const resquest = await fetch(
      `${process.env.NEXT_PUBLIC_FUTURA_API}/events/promocode/${code}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await resquest.json();
    return NextResponse.json(data);
  } catch (error) {
    throw new Error(`API request failed with status ${error}`);
  }
}
