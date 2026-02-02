import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard API error response structure.
 */
export interface ApiError {
    error: string;
    details?: Record<string, string[]>;
}

/**
 * Create a successful JSON response.
 */
export function successResponse<T>(data: T, status = 200): NextResponse<T> {
    return NextResponse.json(data, { status });
}

/**
 * Create an error JSON response.
 */
export function errorResponse(message: string, status = 500): NextResponse<ApiError> {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Create a validation error response from Zod error.
 */
export function validationErrorResponse(error: ZodError): NextResponse<ApiError> {
    const details = error.flatten().fieldErrors as Record<string, string[]>;
    return NextResponse.json(
        {
            error: "Validation failed",
            details,
        },
        { status: 400 }
    );
}

/**
 * Handle an async route handler with consistent error handling.
 */
export async function handleRoute<T>(
    handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiError>> {
    try {
        return await handler();
    } catch (error) {
        if (error instanceof ZodError) {
            return validationErrorResponse(error);
        }

        console.error("[API Error]", error);
        return errorResponse("Internal server error");
    }
}
