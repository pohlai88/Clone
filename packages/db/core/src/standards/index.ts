/**
 * PostgreSQL Types as Canonical Foundation
 * 
 * PostgreSQL Chapter 8 Data Types is the SMART level for business metadata.
 * All business data types map to PostgreSQL's native types.
 * 
 * Reference: https://www.postgresql.org/docs/current/datatype-datetime.html
 * 
 * Key Principle:
 * - PostgreSQL types are CANONICAL
 * - ISO 8601, ISO 4217, etc. are ALIASING/MORPHOLOGY layers only
 * - PostgreSQL has already solved the business metadata problem
 * 
 * @authority: SOVEREIGN
 * @mutation: additive-only
 */

import { z } from "zod";

/**
 * ISO 4217 Currency Code Schema
 * 
 * Three-letter currency codes (e.g., USD, EUR, GBP)
 */
export const ISOCurrencyCodeSchema = z.string().length(3).regex(/^[A-Z]{3}$/, {
    error: "Must be a valid ISO 4217 currency code (3 uppercase letters)",
});

export type ISOCurrencyCode = z.infer<typeof ISOCurrencyCodeSchema>;

/**
 * PostgreSQL Timestamp with Time Zone (CANONICAL)
 * 
 * This is the canonical time type. PostgreSQL accepts ISO 8601 input
 * and converts internally to timestamp with time zone.
 * 
 * Storage: 8 bytes
 * Range: 4713 BC to 294276 AD
 * Precision: 1 microsecond
 * 
 * ISO 8601 is just aliasing for input/output - PostgreSQL timestamp is canonical.
 */
export const PostgreSQLTimestampTZSchema = z.date().or(
  z.string().datetime({
    error: "Must be a valid datetime string (PostgreSQL accepts ISO 8601 and converts to timestamptz)",
  })
);

export type PostgreSQLTimestampTZ = Date;

/**
 * ISO 8601 Date-Time Schema (ALIASING LAYER)
 * 
 * This is NOT canonical - it's an aliasing layer for input/output.
 * PostgreSQL timestamp with time zone is canonical.
 */
export const ISO8601DateTimeSchema = z.string().datetime({
  error: "Must be a valid ISO 8601 datetime string (aliasing layer - PostgreSQL timestamp is canonical)",
});

export type ISO8601DateTime = z.infer<typeof ISO8601DateTimeSchema>;

/**
 * RFC 3339 Date-Time Schema
 * 
 * Similar to ISO 8601 but with specific format requirements
 */
export const RFC3339DateTimeSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?([+-]\d{2}:\d{2})?$/,
  {
    error: "Must be a valid RFC 3339 datetime string",
  }
);

export type RFC3339DateTime = z.infer<typeof RFC3339DateTimeSchema>;

/**
 * PostgreSQL Numeric Type (CANONICAL for Currency)
 * 
 * PostgreSQL numeric(p, s) is the canonical storage for currency.
 * - p = precision (total digits)
 * - s = scale (decimal places)
 * 
 * ISO 4217 currency codes are aliasing for display only.
 */
export const PostgreSQLNumericSchema = z.number().or(
  z.string().regex(/^-?\d+(\.\d+)?$/, {
    error: "Must be a valid numeric value for PostgreSQL numeric/decimal type",
  })
);

export type PostgreSQLNumeric = number | string;

/**
 * Currency Amount Schema (PostgreSQL Canonical)
 * 
 * Uses PostgreSQL numeric(p, s) for exact currency representation.
 * Currency code is metadata/aliasing for display only.
 */
export const CurrencyAmountSchema = z.object({
  amount: PostgreSQLNumericSchema, // PostgreSQL numeric type (canonical)
  currency: ISOCurrencyCodeSchema.optional(), // ISO 4217 alias (for display only)
  precision: z.number().int().min(0).max(6).default(2), // PostgreSQL scale (decimal places)
});

export type CurrencyAmount = z.infer<typeof CurrencyAmountSchema>;

/**
 * Time Duration Schema
 * 
 * ISO 8601 duration format (e.g., PT1H30M for 1 hour 30 minutes)
 */
export const ISODurationSchema = z.string().regex(/^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/, {
  error: "Must be a valid ISO 8601 duration string",
});

export type ISODuration = z.infer<typeof ISODurationSchema>;

/**
 * SI Unit Schema
 * 
 * International System of Units (SI) base and derived units
 */
export const SIUnitSchema = z.enum([
  // Base units
  "m", // meter
  "kg", // kilogram
  "s", // second
  "A", // ampere
  "K", // kelvin
  "mol", // mole
  "cd", // candela
  // Derived units
  "Hz", // hertz
  "N", // newton
  "Pa", // pascal
  "J", // joule
  "W", // watt
  "C", // coulomb
  "V", // volt
  "F", // farad
  "Ω", // ohm
  "S", // siemens
  "Wb", // weber
  "T", // tesla
  "H", // henry
  "lm", // lumen
  "lx", // lux
  "Bq", // becquerel
  "Gy", // gray
  "Sv", // sievert
  "kat", // katal
]);

export type SIUnit = z.infer<typeof SIUnitSchema>;

/**
 * Measurement Schema (PostgreSQL Canonical)
 * 
 * Uses PostgreSQL numeric(p, s) for exact measurement storage.
 * Unit and system are metadata/aliasing for display/conversion only.
 */
export const MeasurementSchema = z.object({
  value: PostgreSQLNumericSchema, // PostgreSQL numeric type (canonical)
  unit: z.string(), // Unit metadata (SI, Imperial, etc. - aliasing)
  system: z.enum(["SI", "IMPERIAL", "US_CUSTOMARY", "METRIC", "CUSTOM"]), // System metadata (aliasing)
});

export type Measurement = z.infer<typeof MeasurementSchema>;

/**
 * Standard Validators and Adapters
 * 
 * PostgreSQL types are canonical. These are aliasing/morphology adapters.
 */
export const Standards = {
  /**
   * Validate PostgreSQL timestamp with time zone (canonical)
   */
  validatePostgreSQLTimestampTZ(value: unknown): boolean {
    return PostgreSQLTimestampTZSchema.safeParse(value).success;
  },

  /**
   * Validate ISO 4217 currency code (aliasing layer)
   */
  validateCurrencyCode(code: string): boolean {
    return ISOCurrencyCodeSchema.safeParse(code).success;
  },

  /**
   * Validate ISO 8601 datetime (aliasing layer - PostgreSQL timestamp is canonical)
   */
  validateISO8601(datetime: string): boolean {
    return ISO8601DateTimeSchema.safeParse(datetime).success;
  },

  /**
   * Convert ISO 8601 to PostgreSQL timestamp with time zone
   * 
   * PostgreSQL accepts ISO 8601 and converts internally.
   * This adapter validates input format.
   */
  fromISO8601ToPostgreSQL(isoString: string): Date {
    const parsed = PostgreSQLTimestampTZSchema.parse(isoString);
    return parsed instanceof Date ? parsed : new Date(parsed);
  },

  /**
   * Convert PostgreSQL timestamp to ISO 8601 (aliasing for display/API)
   */
  fromPostgreSQLToISO8601(timestamp: Date): string {
    return timestamp.toISOString();
  },

  /**
   * Format currency amount (aliasing for display)
   * 
   * PostgreSQL numeric is canonical. This is display formatting only.
   */
  formatCurrency(amount: CurrencyAmount): string {
    const numericValue = typeof amount.amount === "string" ? parseFloat(amount.amount) : amount.amount;
    const currency = amount.currency || "USD"; // Default if not provided
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: amount.precision,
      maximumFractionDigits: amount.precision,
    }).format(numericValue);
  },
};
