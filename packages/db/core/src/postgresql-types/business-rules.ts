/**
 * PostgreSQL Business Rules (SSOT)
 * 
 * These rules define WHY we use specific PostgreSQL types and precision/scale values.
 * Based on PostgreSQL documentation and business requirements.
 * 
 * Reference: PostgreSQL Chapter 8 (Data Types) - https://www.postgresql.org/docs/current/datatype-numeric.html
 * 
 * @authority: SOVEREIGN
 * @mutation: additive-only
 */

import { z } from "zod";

/**
 * Currency Precision Rules (SSOT)
 * 
 * Based on ISO 4217 and PostgreSQL numeric type behavior:
 * - Most currencies use 2 decimal places (USD, EUR, GBP, etc.)
 * - Some currencies use 0 decimals (JPY, KRW)
 * - Some currencies use 3-4 decimals (BHD, IQD)
 * 
 * PostgreSQL numeric(p, s) where:
 * - p = precision (total digits)
 * - s = scale (decimal places)
 * 
 * For USD: numeric(19, 2) - 19 total digits, 2 decimal places
 * This allows: -999,999,999,999,999.99 to 999,999,999,999,999.99
 * 
 * Why 2 decimals for USD?
 * - ISO 4217 standard: USD has minor unit 2 (cents)
 * - Display standard: All financial systems display USD with 2 decimals
 * - PostgreSQL behavior: numeric(19, 2) stores exactly 2 decimal places, no rounding errors
 * 
 * Note: Accounting standards (IFRS/GAAP) are business logic, not data logic.
 * See: @axis/erp-core/standards/ifrs.ts for accounting business rules.
 */
export const CurrencyPrecisionRules = {
  /**
   * Standard currency precision (2 decimals)
   * Used by: USD, EUR, GBP, CAD, AUD, CHF, etc.
   */
  STANDARD: {
    precision: 19,
    scale: 2,
    reason: "ISO 4217 minor unit 2, PostgreSQL numeric(19,2) for exact storage",
  },

  /**
   * Zero decimal currencies
   * Used by: JPY, KRW, CLP, VND, etc.
   */
  ZERO: {
    precision: 19,
    scale: 0,
    reason: "ISO 4217 minor unit 0, no decimal places in native currency",
  },

  /**
   * Three decimal currencies
   * Used by: BHD, IQD, JOD, KWD, OMR, TND
   */
  THREE: {
    precision: 19,
    scale: 3,
    reason: "ISO 4217 minor unit 3, requires 3 decimal places",
  },

  /**
   * Four decimal currencies
   * Used by: Some cryptocurrencies and specialized currencies
   */
  FOUR: {
    precision: 19,
    scale: 4,
    reason: "Specialized currency requiring 4 decimal places",
  },
} as const;

/**
 * Rounding Rules (SSOT)
 * 
 * PostgreSQL numeric type behavior:
 * - PostgreSQL numeric(p, s) stores values exactly as specified
 * - No automatic rounding occurs on INSERT/UPDATE
 * - Rounding only occurs when:
 *   1. Value exceeds scale (decimal places) - PostgreSQL rounds to nearest
 *   2. Explicit ROUND() function is called
 *   3. Casting to a type with fewer decimal places
 * 
 * Business Rules:
 * - **Bank Rounding (Round Half to Even)**: Used for financial calculations
 *   - Also called "Banker's Rounding" or "IEEE 754 Round to Nearest Even"
 *   - 2.5 → 2, 3.5 → 4, 4.5 → 4, 5.5 → 6
 *   - Reduces cumulative rounding errors in large calculations
 *   - PostgreSQL ROUND() function uses this by default
 * 
 * - **Round Half Up**: Used for display and user-facing calculations
 *   - 2.5 → 3, 3.5 → 4, 4.5 → 5, 5.5 → 6
 *   - More intuitive for users
 *   - Used in accounting when specified by business rules
 * 
 * PostgreSQL Reference:
 * - ROUND(numeric) uses "round half to even" (bank rounding)
 * - ROUND(numeric, integer) rounds to specified decimal places
 * - CAST to numeric(p, s) rounds to scale if value exceeds scale
 */
export const RoundingRules = {
  /**
   * Bank Rounding (Round Half to Even)
   * 
   * PostgreSQL default behavior for ROUND() function.
   * Used for: Financial calculations, ledger entries, trial balances
   * 
   * Why: Reduces cumulative rounding errors in large calculations
   */
  BANK: {
    method: "round_half_to_even" as const,
    description: "Round half to even (Banker's Rounding, IEEE 754)",
    postgresqlFunction: "ROUND(value)",
    useCase: "Financial calculations, ledger entries, trial balances",
    example: "2.5 → 2, 3.5 → 4, 4.5 → 4, 5.5 → 6",
  },

  /**
   * Round Half Up
   * 
   * Custom implementation required (PostgreSQL ROUND() uses bank rounding).
   * Used for: Display, user-facing calculations, specific business rules
   * 
   * Why: More intuitive for users, matches common accounting practices
   */
  HALF_UP: {
    method: "round_half_up" as const,
    description: "Round half up (traditional rounding)",
    postgresqlFunction: "Custom function required (PostgreSQL ROUND() uses bank rounding)",
    useCase: "Display, user-facing calculations, specific business rules",
    example: "2.5 → 3, 3.5 → 4, 4.5 → 5, 5.5 → 6",
  },
} as const;

/**
 * PostgreSQL Numeric Type Schema with Business Rules
 * 
 * Defines the canonical numeric type for currency storage.
 * Based on PostgreSQL Chapter 8 (Data Types).
 */
export const PostgreSQLCurrencyNumericSchema = z.object({
  /**
   * PostgreSQL numeric(p, s) precision
   * Default: 19 (allows up to 19 total digits)
   */
  precision: z.number().int().min(1).max(131072).default(19),

  /**
   * PostgreSQL numeric(p, s) scale (decimal places)
   * Default: 2 (USD standard)
   */
  scale: z.number().int().min(0).max(16383).default(2),

  /**
   * Currency code (ISO 4217)
   * Used for display/aliasing only - PostgreSQL numeric is canonical
   */
  currencyCode: z.string().length(3).regex(/^[A-Z]{3}$/).optional(),

  /**
   * Rounding method
   * Default: BANK (round half to even) for financial calculations
   */
  roundingMethod: z.enum(["round_half_to_even", "round_half_up"]).default("round_half_to_even"),
});

export type PostgreSQLCurrencyNumeric = z.infer<typeof PostgreSQLCurrencyNumericSchema>;

/**
 * Currency Type Registry (SSOT)
 * 
 * Maps currency codes to their PostgreSQL numeric type definitions.
 * Based on ISO 4217 and business requirements.
 */
export const CurrencyTypeRegistry = {
  /**
   * USD - United States Dollar
   * 
   * Why numeric(19, 2)?
   * - ISO 4217 minor unit: 2 (cents)
   * - PostgreSQL numeric(19, 2) stores exactly, no rounding errors
   * - Range: -999,999,999,999,999.99 to 999,999,999,999,999.99
   * 
   * Note: Accounting standards (IFRS/GAAP) are business logic, not data logic.
   * See: @axis/erp-core/standards/ifrs.ts for accounting business rules.
   */
  USD: {
    code: "USD",
    precision: 19,
    scale: 2,
    roundingMethod: "round_half_to_even" as const,
    reason: "ISO 4217 minor unit 2, PostgreSQL numeric(19,2) for exact storage",
  },

  /**
   * EUR - Euro
   * Same as USD: 2 decimals
   */
  EUR: {
    code: "EUR",
    precision: 19,
    scale: 2,
    roundingMethod: "round_half_to_even" as const,
    reason: "ISO 4217 minor unit 2, standard European currency format",
  },

  /**
   * JPY - Japanese Yen
   * Zero decimals (no cents)
   */
  JPY: {
    code: "JPY",
    precision: 19,
    scale: 0,
    roundingMethod: "round_half_to_even" as const,
    reason: "ISO 4217 minor unit 0, no decimal places in Japanese Yen",
  },

  /**
   * BHD - Bahraini Dinar
   * Three decimals
   */
  BHD: {
    code: "BHD",
    precision: 19,
    scale: 3,
    roundingMethod: "round_half_to_even" as const,
    reason: "ISO 4217 minor unit 3, requires 3 decimal places",
  },
} as const;

/**
 * Get PostgreSQL numeric type definition for a currency
 */
export function getCurrencyNumericType(currencyCode: string): PostgreSQLCurrencyNumeric {
  const currency = CurrencyTypeRegistry[currencyCode as keyof typeof CurrencyTypeRegistry];
  
  if (currency) {
    return {
      precision: currency.precision,
      scale: currency.scale,
      currencyCode: currency.code,
      roundingMethod: currency.roundingMethod,
    };
  }

  // Default to USD standard (2 decimals, bank rounding)
  return {
    precision: 19,
    scale: 2,
    currencyCode,
    roundingMethod: "round_half_to_even",
  };
}

/**
 * Rounding Functions
 * 
 * ⚠️ FLAG: For complex rounding logic, check PostgreSQL Chapter 10 (Type Conversion)
 * and PAUSE to ask user for advice.
 */

/**
 * Bank Rounding (Round Half to Even)
 * 
 * PostgreSQL ROUND() function uses this by default.
 * This is a TypeScript implementation for validation/display purposes.
 */
export function roundBank(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(value * factor) / factor;
  
  // Check if we're at exactly .5
  const remainder = (value * factor) % 1;
  if (Math.abs(remainder) === 0.5) {
    // Round to even
    const roundedInt = Math.round(value * factor);
    if (roundedInt % 2 === 0) {
      return roundedInt / factor;
    } else {
      // Already rounded correctly by Math.round
      return rounded;
    }
  }
  
  return rounded;
}

/**
 * Round Half Up
 * 
 * Custom implementation (PostgreSQL ROUND() uses bank rounding).
 * Use this for display/user-facing calculations.
 */
export function roundHalfUp(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.ceil(value * factor - 0.5) / factor;
}
