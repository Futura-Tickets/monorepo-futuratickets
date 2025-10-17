import { type NextRequest, NextResponse } from "next/server";
import { createResaleSchema } from "@/lib/validations";
import {
	validateRequest,
	withErrorHandling,
	createErrorResponse,
	logApiRequest,
	logApiResponse,
	requireAuth
} from "@/lib/api-helpers";

async function createResaleHandler(request: NextRequest) {
	const startTime = Date.now();
	logApiRequest('POST', '/api/resales/create');

	// Check authentication
	const authResult = requireAuth(request);
	if (authResult instanceof NextResponse) {
		return authResult;
	}
	const token = authResult;

	// Validate request body
	const validation = await validateRequest(request, createResaleSchema);
	if (!validation.success) {
		return validation.error;
	}

	const { saleId, resalePrice } = validation.data;

	// Call backend API
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_REFACTOR_RESALE_API}/user/events/resale`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ sale: saleId, resalePrice }),
		}
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: 'Error creating resale'
		}));

		logApiResponse('POST', '/api/resales/create', response.status, Date.now() - startTime);

		return createErrorResponse(
			errorData.message || "Error creating resale",
			response.status
		);
	}

	const data = await response.json();

	logApiResponse('POST', '/api/resales/create', 200, Date.now() - startTime);
	return NextResponse.json(data);
}

export const POST = withErrorHandling(createResaleHandler);
