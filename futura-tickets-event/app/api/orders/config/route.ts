import { NextResponse } from "next/server";

export async function GET() {
    try {

        // Make the API call
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/config`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        throw new Error(`API request failed with status ${error}`);
    }
}