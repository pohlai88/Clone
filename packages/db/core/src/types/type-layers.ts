/**
 * Type Layer Strategy
 * 
 * Different type systems carry specific meaning and staging functionality:
 * - ZodType: Runtime validation and sanitization
 * - DrizzleType: Database schema representation
 * - NextType: Next.js server/client type inference
 * 
 * All types are generated from a single source of truth: Metadata → Manifest → Living Schema
 * 
 * @authority: REGISTRY
 * @mutation: restricted
 */

import type { z } from "zod";

/**
 * Type Authority Levels
 */
export enum TypeAuthority {
  SOVEREIGN = "SOVEREIGN", // Audit, RBAC, Encryption, Ledger
  REGISTRY = "REGISTRY", // Metadata, configs, stencils
  APPLICATION = "APPLICATION", // Forms, UI, filters
}

/**
 * Type Mutation Policy
 */
export enum TypeMutation {
  ADDITIVE_ONLY = "additive-only", // Can only add, never remove
  RESTRICTED = "restricted", // Requires approval
  FREE = "free", // Can modify freely
}

/**
 * Type Schema Annotation
 */
export interface TypeSchemaAnnotation {
  authority: TypeAuthority;
  mutation: TypeMutation;
  source: "metadata" | "manifest" | "living-schema";
  version: string;
  hash?: string; // For sovereign schemas
}

/**
 * Zod Type (Runtime Validation)
 * 
 * Used for:
 * - Runtime validation
 * - Sanitization
 * - Serialization
 * - Boundary enforcement
 */
export type ZodType<T extends z.ZodTypeAny> = z.infer<T>;

/**
 * Drizzle Type (Database Schema)
 * 
 * Used for:
 * - Database table definitions
 * - Query type inference
 * - Migration generation
 */
export type DrizzleType<T> = T;

/**
 * Next Type (Next.js Type Inference)
 * 
 * Used for:
 * - Server Actions
 * - Route handlers
 * - Client/server type safety
 */
export type NextType<T> = T;

/**
 * Type Generator Interface
 * 
 * Generates types from Metadata → Manifest → Living Schema
 */
export interface ITypeGenerator {
  /**
   * Generate Zod schema from metadata
   */
  generateZodSchema(metadataId: string): z.ZodTypeAny;

  /**
   * Generate Drizzle schema from metadata
   */
  generateDrizzleSchema(metadataId: string): unknown;

  /**
   * Generate Next.js types from metadata
   */
  generateNextTypes(metadataId: string): unknown;
}

/**
 * Type Registry
 * 
 * Tracks all type definitions and their authority levels
 */
export class TypeRegistry {
  private zodSchemas: Map<string, { schema: z.ZodTypeAny; annotation: TypeSchemaAnnotation }> = new Map();
  private drizzleSchemas: Map<string, { schema: unknown; annotation: TypeSchemaAnnotation }> = new Map();
  private nextTypes: Map<string, { type: unknown; annotation: TypeSchemaAnnotation }> = new Map();

  /**
   * Register Zod schema
   */
  registerZodSchema(
    id: string,
    schema: z.ZodTypeAny,
    annotation: TypeSchemaAnnotation
  ): void {
    // Validate authority level
    if (annotation.authority === TypeAuthority.SOVEREIGN && !annotation.hash) {
      throw new Error("Sovereign schemas must include hash");
    }

    this.zodSchemas.set(id, { schema, annotation });
  }

  /**
   * Register Drizzle schema
   */
  registerDrizzleSchema(
    id: string,
    schema: unknown,
    annotation: TypeSchemaAnnotation
  ): void {
    this.drizzleSchemas.set(id, { schema, annotation });
  }

  /**
   * Register Next.js types
   */
  registerNextTypes(
    id: string,
    type: unknown,
    annotation: TypeSchemaAnnotation
  ): void {
    this.nextTypes.set(id, { type, annotation });
  }

  /**
   * Get Zod schema
   */
  getZodSchema(id: string): { schema: z.ZodTypeAny; annotation: TypeSchemaAnnotation } | undefined {
    return this.zodSchemas.get(id);
  }

  /**
   * Get Drizzle schema
   */
  getDrizzleSchema(id: string): { schema: unknown; annotation: TypeSchemaAnnotation } | undefined {
    return this.drizzleSchemas.get(id);
  }

  /**
   * Get Next.js types
   */
  getNextTypes(id: string): { type: unknown; annotation: TypeSchemaAnnotation } | undefined {
    return this.nextTypes.get(id);
  }
}

/**
 * Global type registry instance
 */
export const typeRegistry = new TypeRegistry();
