import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ event: string }>}) {
    try {

        const urlParams = await params;

        // Make the API call
        const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA_API}/events/attendants/${urlParams.event}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": request.headers.get('authorization')!
            },
        });

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        throw new Error(`API request failed with status ${error}`);
    }
}