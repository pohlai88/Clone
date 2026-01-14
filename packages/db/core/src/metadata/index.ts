/**
 * Metadata Layer (Meaning Layer)
 * 
 * Defines WHAT things mean - independent of storage, transport, or presentation.
 * 
 * Canonical Order: Metadata → Manifest → Living Schema → Schema Enforcement
 * 
 * @authority: REGISTRY
 * @mutation: restricted
 */

import { z } from "zod";

/**
 * Business Metadata Schema
 * 
 * Semantic meaning, accounting classification, labels
 */
export const BusinessMetadataSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  category: z.string(), // e.g., "Revenue", "Other Income" (IFRS-aligned)
  accountingClassification: z.string().optional(), // IFRS category
  labels: z.record(z.string(), z.string()).optional(), // i18n labels
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BusinessMetadata = z.infer<typeof BusinessMetadataSchema>;

/**
 * Technical Metadata Schema
 * 
 * Type, format, constraints, sensitivity, indexing hints
 * 
 * CRITICAL: dataType must reference PostgreSQL types (Chapter 8).
 * External formats (ISO 8601, ISO 4217) are aliasing only.
 */
export const TechnicalMetadataSchema = z.object({
  id: z.uuid(),
  fieldName: z.string(),
  postgreSQLType: z.string(), // PostgreSQL type (canonical): "timestamp with time zone", "numeric(19,4)", etc.
  dataType: z.enum(["string", "number", "boolean", "timestamp_tz", "timestamp", "date", "time", "interval", "numeric", "currency", "measurement"]),
  format: z.string().optional(), // Aliasing format: "ISO 8601", "ISO 4217" (for input/output only)
  constraints: z.record(z.string(), z.unknown()).optional(),
  sensitivity: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
  indexingHints: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TechnicalMetadata = z.infer<typeof TechnicalMetadataSchema>;

/**
 * Currency Metadata
 * 
 * PostgreSQL numeric(p, s) is CANONICAL for currency storage.
 * ISO 4217 codes are aliasing for display only.
 */
export const CurrencyMetadataSchema = z.object({
  postgreSQLType: z.literal("numeric").or(z.string().regex(/^numeric\(\d+,\d+\)$/)), // Canonical: "numeric(19,4)" or "numeric(19,2)"
  code: z.string().length(3), // ISO 4217 code (e.g., "USD", "EUR") - aliasing for display
  name: z.string(),
  symbol: z.string(),
  decimalPlaces: z.number().int().min(0).max(6).default(2), // PostgreSQL scale
  isActive: z.boolean().default(true),
});

export type CurrencyMetadata = z.infer<typeof CurrencyMetadataSchema>;

/**
 * Time Metadata
 * 
 * PostgreSQL timestamp with time zone is CANONICAL.
 * ISO 8601, RFC 3339 are aliasing layers for input/output only.
 */
export const TimeMetadataSchema = z.object({
  postgreSQLType: z.literal("timestamp with time zone"), // Canonical PostgreSQL type
  inputFormat: z.enum(["ISO_8601", "RFC_3339", "UNIX_TIMESTAMP", "SQL", "POSTGRES"]).default("ISO_8601"), // Aliasing for input
  outputFormat: z.enum(["ISO_8601", "RFC_3339", "UNIX_TIMESTAMP", "SQL", "POSTGRES"]).default("ISO_8601"), // Aliasing for output
  timezone: z.string().optional(), // IANA timezone (e.g., "America/New_York") - for display only
  precision: z.number().int().min(0).max(6).default(6), // PostgreSQL precision (microseconds)
});

export type TimeMetadata = z.infer<typeof TimeMetadataSchema>;

/**
 * Unit of Measurement Metadata
 * 
 * References recognized measurement systems (SI, Imperial, etc.)
 */
export const MeasurementMetadataSchema = z.object({
  unit: z.string(), // e.g., "kg", "lb", "m", "ft"
  system: z.enum(["SI", "IMPERIAL", "US_CUSTOMARY", "METRIC"]),
  baseUnit: z.string().optional(), // Base unit for conversion
  conversionFactor: z.number().optional(), // Factor to convert to base unit
});

export type MeasurementMetadata = z.infer<typeof MeasurementMetadataSchema>;

/**
 * Metadata Registry
 * 
 * Central registry for all metadata definitions.
 * Metadata is NEVER inferred from schemas - it must be explicitly declared.
 */
export class MetadataRegistry {
  private businessMetadata: Map<string, BusinessMetadata> = new Map();
  private technicalMetadata: Map<string, TechnicalMetadata> = new Map();
  private currencyMetadata: Map<string, CurrencyMetadata> = new Map();
  private timeMetadata: Map<string, TimeMetadata> = new Map();
  private measurementMetadata: Map<string, MeasurementMetadata> = new Map();

  /**
   * Register business metadata
   */
  registerBusiness(metadata: BusinessMetadata): void {
    this.businessMetadata.set(metadata.id, metadata);
  }

  /**
   * Register technical metadata
   */
  registerTechnical(metadata: TechnicalMetadata): void {
    this.technicalMetadata.set(metadata.id, metadata);
  }

  /**
   * Register currency metadata (ISO 4217)
   */
  registerCurrency(currency: CurrencyMetadata): void {
    // Validate ISO 4217 code format
    if (!/^[A-Z]{3}$/.test(currency.code)) {
      throw new Error(`Invalid ISO 4217 currency code: ${currency.code}`);
    }
    this.currencyMetadata.set(currency.code, currency);
  }

  /**
   * Register time metadata (ISO 8601)
   */
  registerTime(id: string, time: TimeMetadata): void {
    this.timeMetadata.set(id, time);
  }

  /**
   * Register measurement metadata
   */
  registerMeasurement(id: string, measurement: MeasurementMetadata): void {
    this.measurementMetadata.set(id, measurement);
  }

  /**
   * Get business metadata
   */
  getBusiness(id: string): BusinessMetadata | undefined {
    return this.businessMetadata.get(id);
  }

  /**
   * Get technical metadata
   */
  getTechnical(id: string): TechnicalMetadata | undefined {
    return this.technicalMetadata.get(id);
  }

  /**
   * Get currency metadata
   */
  getCurrency(code: string): CurrencyMetadata | undefined {
    return this.currencyMetadata.get(code);
  }

  /**
   * Get time metadata
   */
  getTime(id: string): TimeMetadata | undefined {
    return this.timeMetadata.get(id);
  }

  /**
   * Get measurement metadata
   */
  getMeasurement(id: string): MeasurementMetadata | undefined {
    return this.measurementMetadata.get(id);
  }
}

/**
 * Global metadata registry instance
 */
export const metadataRegistry = new MetadataRegistry();
