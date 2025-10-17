import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ event: string }>}) {
    try {

        const urlParams = await params;

        // Make the API call
        const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/admin/events/resale/${urlParams.event}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": request.headers.get('authorization')!
            }
        });

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        throw new Error(`API request failed with status ${error}`);
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ event: string }>}) {
    try {

        const urlParams = await params;
        const body = await request.json();

        console.log(`${process.env.NEXT_PUBLIC_FUTURA}/admin/events/resale/${urlParams.event}`);

        // Make the API call
        const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/admin/events/resale/${urlParams.event}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": request.headers.get('authorization')!
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        throw new Error(`API request failed with status ${error}`);
    }
}