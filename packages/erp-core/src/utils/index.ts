/**
 * Utility Functions
 * 
 * Shared utilities for business logic operations.
 */

import type { OperationResult } from "../types/index.js";

/**
 * Create a successful operation result
 */
export function createSuccessResult<T>(data?: T, message?: string): OperationResult {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create a failed operation result
 */
export function createErrorResult(message: string, errors?: string[]): OperationResult {
  return {
    success: false,
    message,
    errors,
  };
}

/**
 * Validate and parse data with Zod schema
 */
export function validateAndParse<T>(
  schema: import("zod").ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof import("zod").ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
      };
    }
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
    };
  }
}

/**
 * Generate UUID (placeholder - use crypto.randomUUID() in production)
 */
export function generateId(): string {
  // TODO: Use proper UUID generation
  return crypto.randomUUID?.() || `id-${Date.now()}-${Math.random()}`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  pageSize: number,
  total: number
): {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
