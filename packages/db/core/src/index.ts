/**
 * @axis/db-core
 * 
 * Core database abstraction layer for AXIS.
 * Provides abstract interfaces, contracts, and adapter pattern implementation.
 * 
 * Canonical Order: Metadata → Manifest → Living Schema → Schema Enforcement
 */

export * from "./adapter/index.js";
export * from "./contracts/index.js";
export * from "./aliases/index.js";
export * from "./metadata/index.js";
export * from "./types/type-layers.js";
export * from "./standards/index.js";
export * from "./postgresql-types/index.js";