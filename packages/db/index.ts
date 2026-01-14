/**
 * @axis/db
 * 
 * Main database package exports.
 * Provides unified access to all database adapters and core functionality.
 */

// Core exports
export * from "@axis/db-core";
export * from "@axis/db-core/adapter";
export * from "@axis/db-core/contracts";
export * from "@axis/db-core/aliases";

// Adapter exports
export { NeonAdapter } from "@axis/db-neon";
export { SupabaseAdapter } from "@axis/db-supabase";
export { PrismaAdapter } from "@axis/db-prisma";
export { AzureAdapter } from "@axis/db-azure";
export { ManifestAdapter } from "@axis/db-manifest";
