/**
 * Contract-first database schemas using Zod.
 * All database operations must validate against these contracts.
 */

import { z } from "zod";

/**
 * Base database connection configuration
 */
export const DatabaseConnectionSchema = z.object({
  host: z.string(),
  port: z.number().int().positive(),
  database: z.string(),
  user: z.string(),
  password: z.string().optional(),
  ssl: z.boolean().optional().default(false),
});

export type DatabaseConnection = z.infer<typeof DatabaseConnectionSchema>;

/**
 * Query result metadata
 */
export const QueryResultSchema = z.object({
  rows: z.array(z.unknown()),
  rowCount: z.number().int().nonnegative(),
  affectedRows: z.number().int().nonnegative().optional(),
});

export type QueryResult = z.infer<typeof QueryResultSchema>;

/**
 * Transaction options
 */
export const TransactionOptionsSchema = z.object({
  isolationLevel: z.enum(["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"]).optional(),
  timeout: z.number().int().positive().optional(),
});

export type TransactionOptions = z.infer<typeof TransactionOptionsSchema>;

/**
 * Database operation result
 */
export const DatabaseOperationResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type DatabaseOperationResult = z.infer<typeof DatabaseOperationResultSchema>;
