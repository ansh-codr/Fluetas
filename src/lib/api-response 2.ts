/**
 * Standardized API Response Utilities for Vercel Serverless Functions
 * Guarantees consistent response format without exposing internal stack traces or secrets.
 */

import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export function apiSuccess<T>(data: T, status = 200, headers?: HeadersInit) {
  return NextResponse.json(
    {
      success: true,
      data,
    } as ApiSuccessResponse<T>,
    {
      status,
      headers,
    }
  );
}

export function apiError(code: string, message: string, status = 400, details?: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && process.env.NODE_ENV === 'development' ? { details } : {}),
      },
    } as ApiErrorResponse,
    {
      status,
    }
  );
}
