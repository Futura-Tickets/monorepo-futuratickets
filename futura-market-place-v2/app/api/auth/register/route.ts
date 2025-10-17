import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { accessToken, isRegistration } = body;

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/login-google`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					googleCode: accessToken,
					clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
					isRegistration: isRegistration || false,
				}),
			},
		);

		if (!response.ok) {
			const errorData = await response.json();
			console.error("API Route: Error response:", errorData);
			return NextResponse.json(
				{
					error:
						errorData.message ||
						`Error en la ${isRegistration ? "registro" : "autenticación"} con Google`,
				},
				{ status: response.status },
			);
		}

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
