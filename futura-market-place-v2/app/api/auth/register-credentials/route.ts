import { NextRequest, NextResponse } from "next/server";
import { registerCredentialsSchema } from "@/lib/validations";
import {
	validateRequest,
	withErrorHandling,
	createErrorResponse,
	logApiRequest,
	logApiResponse
} from "@/lib/api-helpers";

async function registerHandler(request: NextRequest) {
	const startTime = Date.now();
	logApiRequest('POST', '/api/auth/register-credentials');

	// Validate request body
	const validation = await validateRequest(request, registerCredentialsSchema);
	if (!validation.success) {
		return validation.error;
	}

	const { name, email, password } = validation.data;

	// Call backend API
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/register`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				newAccount: { name, email, password, role: 'USER' }
			}),
		}
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: 'Registration failed'
		}));

		logApiResponse('POST', '/api/auth/register-credentials', response.status, Date.now() - startTime);

		return createErrorResponse(
			errorData.message || "Registration failed",
			response.status
		);
	}

	const data = await response.json();

	logApiResponse('POST', '/api/auth/register-credentials', 200, Date.now() - startTime);
	return NextResponse.json(data);
}

export const POST = withErrorHandling(registerHandler);