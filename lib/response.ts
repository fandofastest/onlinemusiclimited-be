import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "INTERNAL_ERROR";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status: 201, ...init });
}

export function badRequest(message: string, details?: Record<string, unknown>) {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error: { code: "BAD_REQUEST", message, details }
    },
    { status: 400 }
  );
}

export function notFound(message: string) {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error: { code: "NOT_FOUND", message }
    },
    { status: 404 }
  );
}

export function methodNotAllowed(message = "Method not allowed") {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error: { code: "METHOD_NOT_ALLOWED", message }
    },
    { status: 405 }
  );
}

export function internalError(message = "Internal server error") {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error: { code: "INTERNAL_ERROR", message }
    },
    { status: 500 }
  );
}
