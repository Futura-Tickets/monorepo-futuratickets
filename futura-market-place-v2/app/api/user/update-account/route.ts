import { type NextRequest, NextResponse } from "next/server";
import { updateUserProfileSchema } from "@/lib/validations";
import {
	validateRequest,
	withErrorHandling,
	createErrorResponse,
	logApiRequest,
	logApiResponse,
	requireAuth
} from "@/lib/api-helpers";

async function updateAccountHandler(request: NextRequest) {
	const startTime = Date.now();
	logApiRequest('POST', '/api/user/update-account');

	// Check authentication
	const authResult = requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}
	const token = authResult;

	// Validate request body
	const validation = await validateRequest(request, updateUserProfileSchema);
	if (!validation.success) {
		return validation.error;
	}

	const updateData = validation.data;

	// Call backend API
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_FUTURA_API}/accounts/update-account`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updateData),
		}
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: 'Error updating account'
		}));

		logApiResponse('POST', '/api/user/update-account', response.status, Date.now() - startTime);

		return createErrorResponse(
			errorData.message || "Error updating account",
			response.status
		);
	}

	const data = await response.json();

	logApiResponse('POST', '/api/user/update-account', 200, Date.now() - startTime);
	return NextResponse.json(data);
}

export const POST = withErrorHandling(updateAccountHandler);
