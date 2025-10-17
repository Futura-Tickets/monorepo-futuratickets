import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { accessToken } = body;

		// Log para depuración
		console.log("API Route: Procesando autenticación con token:", accessToken);

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/login-google`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ googleCode: accessToken }),
			},
		);

		const data = await response.json();
		return NextResponse.json(data);
		
	} catch (error) {
		console.error("API Route: Error en autenticación con Google:", error);
		return NextResponse.json(
			{ error: "Error en el servidor durante la autenticación" },
			{ status: 500 },
		);
	}
}
