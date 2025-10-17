import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ eventAddress: string }>}) {
    try {

        const urlParams = await params;
        const body = await request.json();

        // Make the API call
        const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/admin/events/update/${urlParams.eventAddress}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": request.headers.get('authorization')!
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data.data);

    } catch (error) {
        throw new Error(`API request failed with status ${error}`);
    }
}