/**
 * Core Type Definitions
 * 
 * Shared types and interfaces for business logic.
 */

import { z } from "zod";

/**
 * Base entity schema
 */
export const BaseEntitySchema = z.object({
  id: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.uuid().optional(),
  updatedBy: z.uuid().optional(),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Paginated response schema
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: PaginationSchema,
  });

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

/**
 * Operation result schema
 */
export const OperationResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  errors: z.array(z.string()).optional(),
});

export type OperationResult = z.infer<typeof OperationResultSchema>;

/**
 * Validation error schema
 */
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;
