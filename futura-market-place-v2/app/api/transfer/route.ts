import { type NextRequest, NextResponse } from "next/server";
import { transferTicketSchema } from "@/lib/validations";
import {
	validateRequest,
	withErrorHandling,
	createErrorResponse,
	logApiRequest,
	logApiResponse,
	requireAuth
} from "@/lib/api-helpers";

async function transferHandler(request: NextRequest) {
	const startTime = Date.now();
	logApiRequest('POST', '/api/transfer');

	// Check authentication
	const authResult = requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}
	const token = authResult;

	// Validate request body
	const validation = await validateRequest(request, transferTicketSchema);
	if (!validation.success) {
		return validation.error;
	}

	const transferData = validation.data;

	// Call backend API
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_REFACTOR_RESALE_API}/user/events/transfer`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(transferData),
		}
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: 'Error transferring ticket'
		}));

		logApiResponse('POST', '/api/transfer', response.status, Date.now() - startTime);

		return createErrorResponse(
			errorData.message || "Error transferring ticket",
			response.status
		);
	}

	const data = await response.json();

	logApiResponse('POST', '/api/transfer', 200, Date.now() - startTime);
	return NextResponse.json(data);
}

export const POST = withErrorHandling(transferHandler);
