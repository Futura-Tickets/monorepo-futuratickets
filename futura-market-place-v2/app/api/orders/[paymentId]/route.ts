import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ paymentId: string }> },
) {
	try {
		const urlParams = await params;

		// Make the API call
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_FUTURA_API}/orders/paymentId/${urlParams.paymentId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: request.headers.get("authorization")!,
				},
			},
		);

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error en API de tickets:", error);
		return NextResponse.json(
			{ error: `API request failed: ${error}` },
			{ status: 500 },
		);
	}
}
