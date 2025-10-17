import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {

        const body = await request.json();

        const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/accounts/create-promoter`, {
            method: "POST",
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