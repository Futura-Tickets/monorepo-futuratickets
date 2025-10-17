import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	// { params }: { params: Promise<{ event: string }>}

	// const urlParams = await params;

	// const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA_API}/admin/events/access/${urlParams.event}`, {
	//   method: "GET",
	//   headers: {
	//       "Content-Type": "application/json",
	//       "Authorization": request.headers.get('authorization')!
	//   }
	// });

	const urlParams = await params;

	try {
		if (!urlParams?.id) {
			return NextResponse.json(
				{ error: "Bad Request: Event ID is required" },
				{ status: 400 },
			);
		}

		// Llamada a la API del backend sin autenticaciÃ³n
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_FUTURA_API}/events/${urlParams.id}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!res.ok) {
			return NextResponse.json(
				{ error: `API request failed with status ${res.status}` },
				{ status: res.status },
			);
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: `Server error: ${error}` },
			{ status: 500 },
		);
	}
}
