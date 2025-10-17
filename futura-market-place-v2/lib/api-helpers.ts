import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

/**
 * API Helper Functions for Error Handling and Validation
 */

// ============================================================================
// ERROR RESPONSE HELPERS
// ============================================================================

export interface ApiError {
  error: string;
  details?: any;
  statusCode: number;
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: any
): NextResponse<ApiError> {
  const response: ApiError = {
    error: message,
    statusCode,
  };

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status: statusCode });
}

export function handleZodError(error: ZodError): NextResponse<ApiError> {
  const formattedErrors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return createErrorResponse(
    'Validation failed',
    400,
    { validationErrors: formattedErrors }
  );
}

export function handleUnknownError(error: unknown): NextResponse<ApiError> {
  console.error('Unexpected error:', error);

  if (error instanceof Error) {
    return createErrorResponse(error.message, 500);
  }

  return createErrorResponse('An unexpected error occurred', 500);
}

// ============================================================================
// VALIDATION HELPER
// ============================================================================

export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; error: NextResponse<ApiError> }
> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: handleZodError(error) };
    }
    return { success: false, error: handleUnknownError(error) };
  }
}

// ============================================================================
// SAFE API HANDLER WRAPPER
// ============================================================================

type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Route Error:', error);

      if (error instanceof ZodError) {
        return handleZodError(error);
      }

      return handleUnknownError(error);
    }
  };
}

// ============================================================================
// LOGGING HELPERS
// ============================================================================

export function logApiRequest(
  method: string,
  path: string,
  body?: any
): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path}`);

  if (body && process.env.NODE_ENV === 'development') {
    console.log('Request Body:', JSON.stringify(body, null, 2));
  }
}

export function logApiResponse(
  method: string,
  path: string,
  status: number,
  duration?: number
): void {
  const timestamp = new Date().toISOString();
  const durationStr = duration ? ` (${duration}ms)` : '';
  console.log(`[${timestamp}] ${method} ${path} - ${status}${durationStr}`);
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export function getAuthToken(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookie
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export function requireAuth(request: NextRequest): string | NextResponse<ApiError> {
  const token = getAuthToken(request);

  if (!token) {
    return createErrorResponse('Authentication required', 401);
  }

  return token;
}

// ============================================================================
// CORS HELPERS
// ============================================================================

export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export function handleCorsPreFlight(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}
