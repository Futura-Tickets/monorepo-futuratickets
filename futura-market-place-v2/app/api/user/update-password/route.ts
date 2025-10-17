import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/update-password`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: request.headers.get("authorization")!,
				},
				body: JSON.stringify(body),
			},
		);

		if (!res.ok) {
			const errorData = await res.json();
			return NextResponse.json(
				{ error: errorData.message || `Error en la solicitud: ${res.status}` },
				{ status: res.status },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error en API de actualización de contraseña:", error);
		return NextResponse.json(
			{ error: "Error del servidor al actualizar la contraseña" },
			{ status: 500 },
		);
	}
}
