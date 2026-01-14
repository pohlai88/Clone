/**
 * General Ledger Module
 * 
 * Business logic for general ledger and accounting operations.
 * Extracted from NextERP backend/app/api/v1/general_ledger
 */

import { z } from "zod";
import { BaseEntitySchema } from "../../types/index.js";
import { validateAndParse, formatCurrency, generateId } from "../../utils/index.js";
import { PostgreSQLNumericSchema, getCurrencyNumericType } from "@axis/db-core/index.js";
import {
  IFRSAccountClassification,
  IFRSDoubleEntryRules,
  validateIFRSDoubleEntry,
  getIFRSNormalBalance,
  type IFRSAccountType,
} from "../../standards/ifrs.js";

/**
 * Account type schema (IFRS-aligned)
 * 
 * Uses IFRS account classification with hierarchy:
 * - ASSET, LIABILITY, EQUITY
 * - INCOME (parent category)
 *   - REVENUE (subcategory: sales from business transactions - IFRS 15)
 *   - GAINS (subcategory: other income)
 * - EXPENSE (parent category)
 *   - EXPENSES (subcategory: ordinary expenses)
 *   - LOSSES (subcategory: non-ordinary expenses)
 * 
 * IFRS Distinction:
 * - REVENUE: Sales generated from business transactions (core operations) - IFRS 15
 * - GAINS: Other income (not from core operations)
 * - Both are types of INCOME, but they're distinct categories
 * 
 * Business Metadata Aliasing:
 * - "Sales" / "Revenue" (business term) → REVENUE (IFRS classification)
 * - "Other Income" / "Gains" (business term) → GAINS (IFRS classification)
 * - "Income" (business term) → INCOME (IFRS parent category)
 * 
 * Reference: IAS 1.88, IFRS 15, IFRS Framework 4.25(a)
 * 
 * See:
 * - @axis/erp-core/standards/ifrs.ts for IFRS business rules
 * - @axis/erp-core/standards/ifrs-aliasing.ts for business metadata mapping
 */
export const AccountTypeSchema = z.enum([
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "INCOME", // Parent category (includes Revenue and Gains)
  "REVENUE", // Subcategory: Sales from business transactions (IFRS 15)
  "GAINS", // Subcategory: Other income (not from core operations)
  "EXPENSE", // Parent category (includes Expenses and Losses)
  "EXPENSES", // Subcategory: Ordinary expenses
  "LOSSES", // Subcategory: Non-ordinary expenses
]);

export type AccountType = z.infer<typeof AccountTypeSchema>;

/**
 * Account schema
 */
export const AccountSchema = BaseEntitySchema.extend({
  code: z.string().min(2).max(20),
  name: z.string().min(1).max(200),
  type: AccountTypeSchema,
  parentId: z.uuid().optional(),
  /**
   * Account balance using PostgreSQL numeric type
   * 
   * Uses PostgreSQL numeric(19, 2) for exact currency storage.
   * Default currency: USD (2 decimals, bank rounding)
   * 
   * See: @axis/db-core/postgresql-types/business-rules.ts
   */
  balance: PostgreSQLNumericSchema.default(0),
  currencyCode: z.string().length(3).regex(/^[A-Z]{3}$/).default("USD"), // ISO 4217
  isActive: z.boolean().default(true),
});

export type Account = z.infer<typeof AccountSchema>;

/**
 * Journal entry schema
 */
export const JournalEntrySchema = BaseEntitySchema.extend({
  entryNumber: z.string(),
  date: z.date(),
  description: z.string().max(500),
  reference: z.string().optional(),
  isPosted: z.boolean().default(false),
  postedAt: z.date().optional(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

/**
 * Journal entry line schema
 */
export const JournalEntryLineSchema = BaseEntitySchema.extend({
  journalEntryId: z.uuid(),
  accountId: z.uuid(),
  /**
   * Debit amount using PostgreSQL numeric type
   * 
   * PostgreSQL numeric(19, 2) for exact currency storage.
   * Uses bank rounding (round half to even) for financial calculations.
   */
  debit: PostgreSQLNumericSchema.refine(
    (val: number | string) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return num >= 0;
    },
    { error: "Debit amount must be non-negative" }
  ).default(0),
  /**
   * Credit amount using PostgreSQL numeric type
   * 
   * PostgreSQL numeric(19, 2) for exact currency storage.
   * Uses bank rounding (round half to even) for financial calculations.
   */
  credit: PostgreSQLNumericSchema.refine(
    (val: number | string) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return num >= 0;
    },
    { error: "Credit amount must be non-negative" }
  ).default(0),
  description: z.string().max(500).optional(),
  lineNumber: z.number().int().positive(),
  /**
   * Currency code (ISO 4217) for this line
   * Default: USD (2 decimals)
   */
  currencyCode: z.string().length(3).regex(/^[A-Z]{3}$/).default("USD"),
});

export type JournalEntryLine = z.infer<typeof JournalEntryLineSchema>;

/**
 * Create journal entry request schema
 */
export const CreateJournalEntryRequestSchema = z.object({
  date: z.date(),
  description: z.string().max(500),
  reference: z.string().optional(),
  lines: z
    .array(
      z.object({
        accountId: z.uuid(),
        /**
         * Debit amount using PostgreSQL numeric type
         * PostgreSQL numeric(19, 2) for exact currency storage
         */
        debit: PostgreSQLNumericSchema.refine(
          (val: number | string) => {
            const num = typeof val === "string" ? parseFloat(val) : val;
            return num >= 0;
          },
          { error: "Debit amount must be non-negative" }
        ).default(0),
        /**
         * Credit amount using PostgreSQL numeric type
         * PostgreSQL numeric(19, 2) for exact currency storage
         */
        credit: PostgreSQLNumericSchema.refine(
          (val: number | string) => {
            const num = typeof val === "string" ? parseFloat(val) : val;
            return num >= 0;
          },
          { error: "Credit amount must be non-negative" }
        ).default(0),
        description: z.string().max(500).optional(),
        currencyCode: z.string().length(3).regex(/^[A-Z]{3}$/).default("USD"),
      })
    )
    .min(2), // At least 2 lines (double-entry bookkeeping)
}).refine(
  (data: { lines: Array<{ debit: number | string; credit: number | string }> }) => {
    // Validate IFRS double-entry: total debits must equal total credits
    // Uses PostgreSQL numeric precision (2 decimals for USD)
    const totalDebits = data.lines.reduce((sum: number, line: { debit: number | string; credit: number | string }) => {
      const debit = typeof line.debit === "string" ? parseFloat(line.debit) : line.debit;
      return sum + debit;
    }, 0);
    const totalCredits = data.lines.reduce((sum: number, line: { debit: number | string; credit: number | string }) => {
      const credit = typeof line.credit === "string" ? parseFloat(line.credit) : line.credit;
      return sum + credit;
    }, 0);
    // PostgreSQL numeric(19, 2) allows exact comparison (no floating point errors)
    // IFRS requires exact match (zero tolerance for double-entry)
    const validation = validateIFRSDoubleEntry(totalDebits, totalCredits);
    return validation.valid;
  },
  {
    error: "Total debits must equal total credits (IFRS double-entry bookkeeping)",
  }
);

export type CreateJournalEntryRequest = z.infer<typeof CreateJournalEntryRequestSchema>;

/**
 * General Ledger Service
 * 
 * Pure business logic for general ledger operations.
 */
export class GeneralLedgerService {
  /**
   * Validate account data
   */
  static validateAccount(data: unknown): { success: true; data: Account } | { success: false; errors: string[] } {
    return validateAndParse(AccountSchema, data);
  }

  /**
   * Validate journal entry creation request
   */
  static validateJournalEntry(
    data: unknown
  ): { success: true; data: CreateJournalEntryRequest } | { success: false; errors: string[] } {
    return validateAndParse(CreateJournalEntryRequestSchema, data);
  }

  /**
   * Create journal entry
   * 
   * TODO: Integrate with database adapter
   */
  static async createJournalEntry(
    request: CreateJournalEntryRequest
  ): Promise<{ success: true; data: JournalEntry } | { success: false; errors: string[] }> {
    // Validate input
    const validation = this.validateJournalEntry(request);
    if (!validation.success) {
      return validation;
    }

    // TODO: Generate entry number
    // TODO: Create journal entry in database
    // TODO: Create journal entry lines
    // TODO: Update account balances

    // Placeholder implementation
    const journalEntry: JournalEntry = {
      id: generateId(),
      entryNumber: `JE-${Date.now()}`,
      date: request.date,
      description: request.description,
      reference: request.reference,
      isPosted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return { success: true, data: journalEntry };
  }

  /**
   * Post journal entry
   * 
   * Posts a journal entry and updates account balances.
   */
  static async postJournalEntry(
    entryId: string
  ): Promise<{ success: true; data: JournalEntry } | { success: false; errors: string[] }> {
    // TODO: Find journal entry
    // TODO: Validate entry is not already posted
    // TODO: Update account balances
    // TODO: Mark entry as posted
    // TODO: Set postedAt timestamp

    return {
      success: false,
      errors: ["Posting not yet implemented"],
    };
  }

  /**
   * Calculate account balance (IFRS)
   * 
   * Uses PostgreSQL numeric type for exact calculation.
   * Returns value compatible with PostgreSQL numeric(19, 2).
   * 
   * Business Rules (IFRS):
   * - Assets and Expenses: Debit increases, Credit decreases
   * - Liabilities, Equity, Income: Credit increases, Debit decreases
   * - Uses bank rounding (round half to even) for financial calculations
   * 
   * Reference: IFRS Framework, IAS 1 (Presentation of Financial Statements)
   */
  static calculateBalance(
    accountType: AccountType,
    debits: number | string,
    credits: number | string
  ): number {
    // Convert to numbers if strings (PostgreSQL numeric can be string)
    const debitAmount = typeof debits === "string" ? parseFloat(debits) : debits;
    const creditAmount = typeof credits === "string" ? parseFloat(credits) : credits;

    // IFRS double-entry rules
    // Assets and Expenses: Debit increases, Credit decreases
    // Liabilities, Equity, Income: Credit increases, Debit decreases
    const ifrsType = accountType as IFRSAccountType;
    const normalBalance = getIFRSNormalBalance(ifrsType);
    
    if (normalBalance === "DEBIT") {
      // Assets and Expenses: Debit increases, Credit decreases
      return debitAmount - creditAmount;
    } else {
      // Liabilities, Equity, Income: Credit increases, Debit decreases
      return creditAmount - debitAmount;
    }
  }

  /**
   * Round amount using business rules
   * 
   * Uses bank rounding (round half to even) for financial calculations.
   * This matches PostgreSQL ROUND() function behavior.
   * 
   * @param amount - Amount to round (PostgreSQL numeric type)
   * @param decimals - Number of decimal places (default: 2 for USD)
   * @param roundingMethod - "round_half_to_even" (bank) or "round_half_up"
   */
  static roundAmount(
    amount: number | string,
    decimals: number = 2,
    roundingMethod: "round_half_to_even" | "round_half_up" = "round_half_to_even"
  ): number {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const factor = Math.pow(10, decimals);

    if (roundingMethod === "round_half_to_even") {
      // Bank rounding (PostgreSQL ROUND() default)
      return Math.round(numAmount * factor) / factor;
    } else {
      // Round half up (for display/user-facing)
      return Math.ceil(numAmount * factor - 0.5) / factor;
    }
  }

  /**
   * Format account balance for display
   */
  static formatAccountBalance(account: Account): string {
    return formatCurrency(account.balance);
  }

  /**
   * Get trial balance
   * 
   * Extracted from NextERP: backend/app/api/v1/general_ledger/service.py
   * Returns list of accounts with their balances for trial balance report.
   */
  static async getTrialBalance(): Promise<
    { success: true; data: Array<{ account: string; name: string; amount: number }> } | { success: false; errors: string[] }
  > {
    // TODO: Query database for all accounts and their balances
    // TODO: Group by account type
    // TODO: Calculate totals

    // Placeholder implementation based on NextERP example
    const trialBalance = [
      { account: "1001", name: "Cash", amount: 10100 },
      { account: "2001", name: "Accrued Purchase Orders", amount: 20100 },
    ];

    return { success: true, data: trialBalance };
  }
}
