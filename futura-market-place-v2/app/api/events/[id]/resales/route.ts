import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const resolvedParams = await params;
		const eventId = resolvedParams.id;

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_FUTURA_API}/sales/resale/${eventId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: request.headers.get("authorization") || "",
				},
			},
		);

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in API route:", error);
		throw new Error(`API request failed with status ${error}`);
	}
}
