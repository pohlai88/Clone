/**
 * @axis/erp-core
 * 
 * Core business logic extracted from NextERP.
 * Migrated from Python to TypeScript with contract-first validation.
 * 
 * This package contains pure business logic - no framework dependencies.
 * All operations are validated using Zod schemas.
 */

export * from "./modules/index.js";
export * from "./types/index.js";
export * from "./utils/index.js";
export * from "./standards/ifrs.js";
export * from "./standards/ifrs-aliasing.js";
export * from "./standards/ifrs.js";