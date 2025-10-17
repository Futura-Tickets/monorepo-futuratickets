import { NextRequest, NextResponse } from "next/server";
import { loginCredentialsSchema } from "@/lib/validations";
import {
	validateRequest,
	withErrorHandling,
	createErrorResponse,
	logApiRequest,
	logApiResponse
} from "@/lib/api-helpers";

async function loginHandler(request: NextRequest) {
	const startTime = Date.now();
	logApiRequest('POST', '/api/auth/login-credentials');

	// Validate request body
	const validation = await validateRequest(request, loginCredentialsSchema);
	if (!validation.success) {
		return validation.error;
	}

	const { email, password } = validation.data;

	// Call backend API
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/login`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		},
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: 'Authentication failed'
		}));

		logApiResponse('POST', '/api/auth/login-credentials', response.status, Date.now() - startTime);

		return createErrorResponse(
			errorData.message || "Invalid credentials",
			response.status
		);
	}

	const data = await response.json();

	// Set auth token as httpOnly cookie
	const res = NextResponse.json(data);
	if (data.token) {
		res.cookies.set('auth_token', data.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/',
		});
	}

	logApiResponse('POST', '/api/auth/login-credentials', 200, Date.now() - startTime);
	return res;
}

export const POST = withErrorHandling(loginHandler);
