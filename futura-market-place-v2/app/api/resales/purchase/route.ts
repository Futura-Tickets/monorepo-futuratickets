import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { resaleId } = body;

		// Hacer la petición a la API externa
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_FUTURA_API}/sales/purchase`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: request.headers.get("authorization") || "",
				},
				body: JSON.stringify({ resaleId }),
			},
		);

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in API route:", error);
		throw new Error(`API request failed with status ${error}`);
	}
}
