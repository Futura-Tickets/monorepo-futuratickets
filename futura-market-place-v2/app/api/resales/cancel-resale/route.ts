import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { sale } = body;

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_REFACTOR_RESALE_API}/user/events/cancel-resale`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: request.headers.get("authorization")!,
				},
				body: JSON.stringify({ sale }),
			},
		);
		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: `Server error: ${error}` },
			{ status: 500 },
		);
	}
}
