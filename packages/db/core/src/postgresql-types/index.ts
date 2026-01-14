/**
 * PostgreSQL Type System (Canonical Foundation)
 * 
 * PostgreSQL Chapter 8 Data Types is the SMART level for business metadata.
 * All business data types map to PostgreSQL's native types.
 * 
 * References:
 * - Chapter 8: https://www.postgresql.org/docs/current/datatype.html
 * - Chapter 10: https://www.postgresql.org/docs/current/typeconv.html ⚠️ CHECK FIRST
 * 
 * ⚠️ FLAG: Before implementing any type conversion logic, check PostgreSQL Chapter 10
 * and PAUSE to ask user for advice. This follows DRY and saves tokens.
 * 
 * @authority: SOVEREIGN
 * @mutation: additive-only
 */

import { z } from "zod";

/**
 * PostgreSQL Timestamp Types
 * 
 * PostgreSQL supports:
 * - timestamp [ (p) ] [ without time zone ]: 8 bytes, 4713 BC to 294276 AD, 1 microsecond precision
 * - timestamp [ (p) ] with time zone: 8 bytes, 4713 BC to 294276 AD, 1 microsecond precision
 * 
 * For business data, we use: timestamp with time zone (timestamptz)
 * This is the canonical time type. All other time formats are aliasing.
 */
export const PostgreSQLTimestampSchema = z.date().or(
  z.string().datetime() // Accepts ISO 8601 input, converts to Date
);

export type PostgreSQLTimestamp = Date;

/**
 * PostgreSQL Timestamp with Time Zone Schema
 * 
 * This is the canonical time type for all business data.
 * Input accepts ISO 8601, SQL-compatible, traditional POSTGRES formats.
 * PostgreSQL handles all conversions internally.
 */
export const PostgreSQLTimestampTZSchema = z.date().or(
  z.string().datetime() // PostgreSQL accepts ISO 8601 and converts to timestamptz
);

export type PostgreSQLTimestampTZ = Date;

/**
 * PostgreSQL Date Schema
 * 
 * 4 bytes, date only (no time of day)
 * Range: 4713 BC to 5874897 AD, 1 day resolution
 */
export const PostgreSQLDateSchema = z.date().or(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    error: "Must be a valid date in YYYY-MM-DD format (PostgreSQL date type)",
  })
);

export type PostgreSQLDate = Date;

/**
 * PostgreSQL Time Schema
 * 
 * time [ (p) ] [ without time zone ]: 8 bytes, 00:00:00 to 24:00:00, 1 microsecond precision
 * time [ (p) ] with time zone: 12 bytes, 00:00:00+1559 to 24:00:00-1559, 1 microsecond precision
 */
export const PostgreSQLTimeSchema = z.string().regex(
  /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d{1,6})?$/,
  {
    error: "Must be a valid time in HH:mm:ss[.microseconds] format (PostgreSQL time type)",
  }
);

export type PostgreSQLTime = string;

/**
 * PostgreSQL Interval Schema
 * 
 * 16 bytes, time interval
 * Range: -178000000 years to 178000000 years, 1 microsecond precision
 * 
 * Accepts:
 * - SQL standard: '1-2' (1 year 2 months), '3 4:05:06' (3 days 4 hours 5 minutes 6 seconds)
 * - Traditional Postgres: '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'
 * - ISO 8601: 'P1Y2M3DT4H5M6S' or 'P0001-02-03T04:05:06'
 */
export const PostgreSQLIntervalSchema = z.string().regex(
  /^(P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?|(?:\d+-\d+)|(?:\d+ \d+:\d+:\d+)|(?:\d+ (?:year|years|mon|mons|day|days|hour|hours|minute|minutes|second|seconds) ?)+)$/i,
  {
    error: "Must be a valid PostgreSQL interval (SQL standard, ISO 8601, or traditional format)",
  }
);

export type PostgreSQLInterval = string;

// Export business rules (SSOT)
export {
  CurrencyPrecisionRules,
  RoundingRules,
  PostgreSQLCurrencyNumericSchema,
  CurrencyTypeRegistry,
  getCurrencyNumericType,
  roundBank,
  roundHalfUp,
  type PostgreSQLCurrencyNumeric,
} from "./business-rules.js";

/**
 * PostgreSQL Numeric Types
 * 
 * For currency and precise decimal values, use:
 * - numeric(p, s): arbitrary precision, exact
 * - decimal(p, s): same as numeric
 * 
 * Where p = precision (total digits), s = scale (decimal places)
 */
export const PostgreSQLNumericSchema = z.number().or(
  z.string().regex(/^-?\d+(\.\d+)?$/, {
    error: "Must be a valid numeric value for PostgreSQL numeric/decimal type",
  })
);

export type PostgreSQLNumeric = number | string;

/**
 * PostgreSQL Currency Schema
 * 
 * Uses PostgreSQL numeric(p, s) for exact currency representation.
 * Currency code is stored separately (ISO 4217 for display/aliasing only).
 * 
 * PostgreSQL numeric is the canonical storage. Currency codes are aliasing.
 * 
 * Business Rules (SSOT - Data Logic Only):
 * - USD uses numeric(19, 2) - ISO 4217 minor unit 2
 * - Rounding: Bank rounding (round half to even) for financial calculations
 * - See business-rules.ts for complete SSOT definitions
 * 
 * Note: Accounting standards (IFRS/GAAP) are business logic, not data logic.
 * See: @axis/erp-core/standards/ifrs.ts for accounting business rules.
 */
export const PostgreSQLCurrencySchema = z.object({
  amount: PostgreSQLNumericSchema, // PostgreSQL numeric type
  currencyCode: z.string().length(3).regex(/^[A-Z]{3}$/).optional(), // ISO 4217 alias (for display only)
  precision: z.number().int().min(0).max(6).default(2), // Decimal places (PostgreSQL scale)
});

export type PostgreSQLCurrency = z.infer<typeof PostgreSQLCurrencySchema>;

/**
 * PostgreSQL Type Mappings
 * 
 * Maps PostgreSQL types to their canonical representations.
 * All business metadata must map to these PostgreSQL types.
 */
export const PostgreSQLTypes = {
  /**
   * Timestamp with time zone (canonical time type)
   */
  TIMESTAMP_TZ: "timestamp with time zone",
  
  /**
   * Timestamp without time zone
   */
  TIMESTAMP: "timestamp without time zone",
  
  /**
   * Date only
   */
  DATE: "date",
  
  /**
   * Time of day
   */
  TIME: "time without time zone",
  
  /**
   * Time of day with time zone
   */
  TIME_TZ: "time with time zone",
  
  /**
   * Interval
   */
  INTERVAL: "interval",
  
  /**
   * Numeric (exact precision)
   */
  NUMERIC: "numeric",
  
  /**
   * Decimal (same as numeric)
   */
  DECIMAL: "decimal",
} as const;

/**
 * PostgreSQL Type Registry
 * 
 * Tracks all PostgreSQL type mappings.
 * PostgreSQL types are the canonical source - everything else is aliasing.
 * 
 * ⚠️ FLAG: For type conversion logic, check PostgreSQL Chapter 10 first:
 * https://www.postgresql.org/docs/current/typeconv.html
 * 
 * PAUSE and ask user for advice before implementing conversion logic.
 */
export class PostgreSQLTypeRegistry {
  private typeMappings: Map<string, string> = new Map();

  /**
   * Register a field mapping to PostgreSQL type
   */
  registerField(fieldName: string, postgresType: string): void {
    this.typeMappings.set(fieldName, postgresType);
  }

  /**
   * Get PostgreSQL type for a field
   */
  getPostgreSQLType(fieldName: string): string | undefined {
    return this.typeMappings.get(fieldName);
  }

  /**
   * Validate that a value matches PostgreSQL type expectations
   * 
   * ⚠️ FLAG: For type conversion validation, check PostgreSQL Chapter 10:
   * https://www.postgresql.org/docs/current/typeconv.html
   * 
   * This is basic validation only. Complex conversions require user advice.
   */
  validateForPostgreSQL(fieldName: string, value: unknown): boolean {
    const pgType = this.getPostgreSQLType(fieldName);
    if (!pgType) return false;

    switch (pgType) {
      case PostgreSQLTypes.TIMESTAMP_TZ:
        return PostgreSQLTimestampTZSchema.safeParse(value).success;
      case PostgreSQLTypes.DATE:
        return PostgreSQLDateSchema.safeParse(value).success;
      case PostgreSQLTypes.NUMERIC:
      case PostgreSQLTypes.DECIMAL:
        return PostgreSQLNumericSchema.safeParse(value).success;
      default:
        return true;
    }
  }

  /**
   * ⚠️ FLAG: Type Conversion Methods
   * 
   * Before implementing any type conversion methods, check:
   * - PostgreSQL Chapter 10: Type Conversion
   * - PostgreSQL Chapter 8: Data Types
   * 
   * PAUSE and ask user for advice on:
   * - Implicit vs explicit conversions
   * - Type compatibility rules
   * - Casting syntax
   * - Conversion precedence
   * 
   * Reference: https://www.postgresql.org/docs/current/typeconv.html
   */
}

/**
 * Global PostgreSQL type registry
 */
export const postgreSQLTypeRegistry = new PostgreSQLTypeRegistry();

/**
 * PostgreSQL Type Adapters
 * 
 * Converts between external formats (ISO 8601, etc.) and PostgreSQL types.
 * These are aliasing/morphology adapters - PostgreSQL types are canonical.
 * 
 * ⚠️ FLAG: For complex type conversions, check PostgreSQL Chapter 10 first:
 * https://www.postgresql.org/docs/current/typeconv.html
 * 
 * PAUSE and ask user for advice before implementing conversion logic.
 */
export const PostgreSQLAdapters = {
  /**
   * Convert ISO 8601 string to PostgreSQL timestamp with time zone
   * 
   * PostgreSQL accepts ISO 8601 input and converts internally.
   * This adapter validates input format.
   * 
   * Reference: PostgreSQL Chapter 8 (Data Types) - timestamp with time zone
   */
  fromISO8601(isoString: string): Date {
    const parsed = PostgreSQLTimestampTZSchema.parse(isoString);
    return parsed instanceof Date ? parsed : new Date(parsed);
  },

  /**
   * Convert PostgreSQL timestamp to ISO 8601 string (for display/API)
   * 
   * This is aliasing - PostgreSQL timestamp is canonical.
   */
  toISO8601(timestamp: Date): string {
    return timestamp.toISOString();
  },

  /**
   * Convert currency amount to PostgreSQL numeric
   * 
   * PostgreSQL numeric is canonical. Currency codes are aliasing.
   * 
   * ⚠️ FLAG: For numeric type conversion, check PostgreSQL Chapter 10:
   * https://www.postgresql.org/docs/current/typeconv.html
   */
  toPostgreSQLNumeric(amount: number, precision: number = 2): string {
    return amount.toFixed(precision);
  },

  /**
   * ⚠️ FLAG: Type Conversion Functions
   * 
   * Before implementing any type conversion functions, check:
   * - PostgreSQL Chapter 10: Type Conversion
   * - PostgreSQL Chapter 8: Data Types
   * 
   * PAUSE and ask user for advice on:
   * - Implicit vs explicit conversions
   * - Type compatibility rules
   * - Casting syntax
   * - Conversion precedence
   * 
   * Reference: https://www.postgresql.org/docs/current/typeconv.html
   */
};
