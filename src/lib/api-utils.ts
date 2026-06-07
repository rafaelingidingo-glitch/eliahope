import { NextResponse } from 'next/server'

/**
 * Standard API Response Helpers
 * 
 * Provides consistent response formats across all API routes.
 * Follows the JSend specification pattern.
 */

interface SuccessResponseData {
  success: true
  data?: unknown
  message?: string
}

interface ErrorResponseData {
  success: false
  error: string
  details?: unknown
}

export function successResponse(
  data?: unknown,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponseData> {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      ...(data !== undefined && { data }),
    },
    { status }
  )
}

export function createdResponse(
  data?: unknown,
  message?: string
): NextResponse<SuccessResponseData> {
  return successResponse(data, message, 201)
}

export function errorResponse(
  error: string,
  status: number = 400,
  details?: unknown
): NextResponse<ErrorResponseData> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details ? { details } : {}),
    },
    { status }
  )
}

export function unauthorizedResponse(error: string = 'Unauthorized'): NextResponse<ErrorResponseData> {
  return errorResponse(error, 401)
}

export function forbiddenResponse(error: string = 'Forbidden'): NextResponse<ErrorResponseData> {
  return errorResponse(error, 403)
}

export function notFoundResponse(error: string = 'Not found'): NextResponse<ErrorResponseData> {
  return errorResponse(error, 404)
}

export function serverErrorResponse(error: string = 'Internal server error'): NextResponse<ErrorResponseData> {
  return errorResponse(error, 500)
}

/**
 * Pagination helpers
 */

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  })
}
