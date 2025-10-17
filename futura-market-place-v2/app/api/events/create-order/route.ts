import { type NextRequest, NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validations";
import {
	validateRequest,
	withErrorHandling,
	createErrorResponse,
	logApiRequest,
	logApiResponse
} from "@/lib/api-helpers";

async function createOrderHandler(request: NextRequest) {
	const startTime = Date.now();
	logApiRequest('POST', '/api/events/create-order');

	// Validate request body
	const validation = await validateRequest(request, createOrderSchema);
	if (!validation.success) {
		return validation.error;
	}

	const orderData = validation.data;

	// Call backend API
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_FUTURA_API}/events/create-order`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(orderData),
		}
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: 'Error creating order'
		}));

		logApiResponse('POST', '/api/events/create-order', response.status, Date.now() - startTime);

		return createErrorResponse(
			errorData.message || "Error creating order",
			response.status
		);
	}

	const data = await response.json();

	logApiResponse('POST', '/api/events/create-order', 200, Date.now() - startTime);
	return NextResponse.json(data);
}

export const POST = withErrorHandling(createOrderHandler);
