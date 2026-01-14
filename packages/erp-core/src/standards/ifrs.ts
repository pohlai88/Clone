/**
 * IFRS (International Financial Reporting Standards) Business Rules
 * 
 * This module defines accounting business logic based on IFRS standards.
 * IFRS is the global accounting standard used by 140+ countries.
 * 
 * Separation of Concerns:
 * - Data Logic (PostgreSQL types, precision, storage) → @axis/db-core
 * - Business Logic (IFRS accounting rules, classifications) → @axis/erp-core
 * 
 * References:
 * - IFRS Foundation: https://www.ifrs.org/
 * - IFRS Standards: https://www.ifrs.org/issued-standards/
 * - IAS 1: Presentation of Financial Statements
 * - IAS 21: The Effects of Changes in Foreign Exchange Rates
 * - IAS 32: Financial Instruments: Presentation
 * 
 * @authority: SOVEREIGN
 * @mutation: additive-only
 */

import { z } from "zod";

/**
 * IFRS Currency Presentation Rules
 * 
 * Based on IAS 21 (The Effects of Changes in Foreign Exchange Rates):
 * - Functional currency: Currency of the primary economic environment
 * - Presentation currency: Currency in which financial statements are presented
 * - Monetary items: Denominated in a specific currency
 * - Non-monetary items: Not denominated in a specific currency
 * 
 * Currency Precision (Business Logic):
 * - IFRS does not mandate specific decimal places
 * - Decimal places follow ISO 4217 minor unit (data logic)
 * - Financial statements must present amounts clearly and accurately
 * - Rounding is acceptable if materiality is not affected
 */
export const IFRSCurrencyRules = {
  /**
   * Functional Currency Determination
   * 
   * IAS 21 requires entities to determine their functional currency based on:
   * - Primary economic environment
   * - Currency that mainly influences sales prices
   * - Currency of the country whose competitive forces and regulations determine prices
   */
  functionalCurrency: {
    criteria: [
      "Primary economic environment",
      "Currency that mainly influences sales prices",
      "Currency of country whose competitive forces determine prices",
    ],
    reference: "IAS 21.9-12",
  },

  /**
   * Presentation Currency
   * 
   * Financial statements may be presented in any currency.
   * If different from functional currency, translation is required.
   */
  presentationCurrency: {
    reference: "IAS 21.38",
    note: "May differ from functional currency, requires translation",
  },

  /**
   * Currency Rounding (Business Logic)
   * 
   * IFRS allows rounding if:
   * - Materiality is not affected
   * - Financial statements remain clear and accurate
   * - Rounding method is consistent
   * 
   * Note: Technical rounding (PostgreSQL numeric) is data logic.
   * This is business logic for financial statement presentation.
   */
  rounding: {
    allowed: true,
    requirement: "Must not affect materiality",
    consistency: "Must be consistent across periods",
    reference: "IAS 1.29",
  },
} as const;

/**
 * IFRS Account Classification
 * 
 * Based on IAS 1 (Presentation of Financial Statements):
 * - Assets: Resources controlled by entity, future economic benefits
 * - Liabilities: Present obligations, future outflows of resources
 * - Equity: Residual interest in assets after deducting liabilities
 * - Income: Increases in economic benefits (revenue, gains)
 * - Expenses: Decreases in economic benefits (expenses, losses)
 */
export const IFRSAccountClassification = {
  /**
   * Assets (IAS 1.49)
   * 
   * Resource controlled by the entity as a result of past events
   * and from which future economic benefits are expected to flow.
   */
  ASSET: {
    definition: "Resource controlled by entity, future economic benefits",
    recognition: "Probable future economic benefits, reliable measurement",
    reference: "IAS 1.49, Framework 4.4(a)",
    normalBalance: "DEBIT" as const,
  },

  /**
   * Liabilities (IAS 1.49)
   * 
   * Present obligation arising from past events, settlement expected
   * to result in an outflow of resources.
   */
  LIABILITY: {
    definition: "Present obligation, future outflow of resources",
    recognition: "Probable outflow, reliable measurement",
    reference: "IAS 1.49, Framework 4.4(b)",
    normalBalance: "CREDIT" as const,
  },

  /**
   * Equity (IAS 1.49)
   * 
   * Residual interest in assets after deducting all liabilities.
   */
  EQUITY: {
    definition: "Residual interest in assets after deducting liabilities",
    reference: "IAS 1.49, Framework 4.4(c)",
    normalBalance: "CREDIT" as const,
  },

  /**
   * Income (IAS 1.88)
   * 
   * Increases in economic benefits during the accounting period in the form
   * of inflows or enhancements of assets or decreases of liabilities.
   * 
   * Income consists of:
   * - Revenue: Sales generated from business transactions (core operations)
   * - Gains: Other income (not from core operations)
   */
  INCOME: {
    definition: "Increases in economic benefits (revenue, gains)",
    reference: "IAS 1.88, Framework 4.25(a)",
    normalBalance: "CREDIT" as const,
    includes: ["Revenue", "Gains"],
    note: "Income is the parent category; Revenue and Gains are subcategories",
  },

  /**
   * Revenue (IFRS 15)
   * 
   * Income arising in the ordinary course of an entity's activities.
   * Specifically: Sales generated from business transactions (core operations).
   * 
   * Revenue is a TYPE of Income, not a separate account type.
   * It represents the primary income from business operations.
   * 
   * Reference: IFRS 15 (Revenue from Contracts with Customers)
   */
  REVENUE: {
    definition: "Sales generated from business transactions (core operations)",
    reference: "IFRS 15, IAS 1.88",
    normalBalance: "CREDIT" as const,
    parentCategory: "INCOME" as const,
    isSubcategory: true,
    note: "Revenue is income from ordinary business activities",
  },

  /**
   * Gains (IFRS)
   * 
   * Income that is NOT from ordinary business activities.
   * Examples: Gains on disposal of assets, foreign exchange gains, etc.
   * 
   * Gains are a TYPE of Income, not a separate account type.
   * They represent income from non-core operations.
   * 
   * Reference: IAS 1.88, Framework 4.25(a)
   */
  GAINS: {
    definition: "Income from non-core operations (other income)",
    reference: "IAS 1.88, Framework 4.25(a)",
    normalBalance: "CREDIT" as const,
    parentCategory: "INCOME" as const,
    isSubcategory: true,
    note: "Gains are income from non-ordinary business activities",
  },

  /**
   * Expenses (IAS 1.88)
   * 
   * Decreases in economic benefits during the accounting period in the form
   * of outflows or depletions of assets or incurrences of liabilities.
   */
  EXPENSE: {
    definition: "Decreases in economic benefits (expenses, losses)",
    reference: "IAS 1.88, Framework 4.25(b)",
    normalBalance: "DEBIT" as const,
    includes: ["Expenses", "Losses"],
  },
} as const;

/**
 * IFRS Double-Entry Bookkeeping Rules
 * 
 * Fundamental accounting equation (IFRS Framework):
 * Assets = Liabilities + Equity
 * 
 * Every transaction must maintain this equation:
 * - Debits = Credits (always)
 * - Assets and Expenses: Debit increases, Credit decreases
 * - Liabilities, Equity, Income: Credit increases, Debit decreases
 */
export const IFRSDoubleEntryRules = {
  /**
   * Fundamental Accounting Equation
   */
  equation: "Assets = Liabilities + Equity",

  /**
   * Debit/Credit Rules
   */
  rules: {
    ASSET: {
      increase: "DEBIT",
      decrease: "CREDIT",
      reason: "Assets are resources controlled by entity",
    },
    LIABILITY: {
      increase: "CREDIT",
      decrease: "DEBIT",
      reason: "Liabilities are obligations to others",
    },
    EQUITY: {
      increase: "CREDIT",
      decrease: "DEBIT",
      reason: "Equity is residual interest",
    },
    INCOME: {
      increase: "CREDIT",
      decrease: "DEBIT",
      reason: "Income increases equity",
    },
    EXPENSE: {
      increase: "DEBIT",
      decrease: "CREDIT",
      reason: "Expenses decrease equity",
    },
    EXPENSES: {
      increase: "DEBIT",
      decrease: "CREDIT",
      reason: "Expenses are a type of expense, decrease equity",
    },
    LOSSES: {
      increase: "DEBIT",
      decrease: "CREDIT",
      reason: "Losses are a type of expense, decrease equity",
    },
  },

  /**
   * Validation Rule
   * 
   * For every transaction: Total Debits = Total Credits
   */
  validation: {
    rule: "Total Debits must equal Total Credits",
    tolerance: "Zero tolerance (exact match required)",
    reference: "IFRS Framework, Fundamental Accounting Equation",
  },
} as const;

/**
 * IFRS Financial Statement Presentation
 * 
 * Based on IAS 1 (Presentation of Financial Statements):
 * - Statement of Financial Position (Balance Sheet)
 * - Statement of Profit or Loss and Other Comprehensive Income
 * - Statement of Changes in Equity
 * - Statement of Cash Flows
 * - Notes to Financial Statements
 */
export const IFRSFinancialStatements = {
  /**
   * Statement of Financial Position (Balance Sheet)
   * 
   * Presents assets, liabilities, and equity at a specific date.
   */
  statementOfFinancialPosition: {
    required: true,
    reference: "IAS 1.10(a)",
    structure: ["Assets", "Liabilities", "Equity"],
    format: "Current/Non-current classification or liquidity order",
  },

  /**
   * Statement of Profit or Loss
   * 
   * Presents income and expenses for the period.
   */
  statementOfProfitOrLoss: {
    required: true,
    reference: "IAS 1.10(b)",
    structure: ["Income", "Expenses", "Profit or Loss"],
  },

  /**
   * Statement of Changes in Equity
   * 
   * Presents changes in equity during the period.
   */
  statementOfChangesInEquity: {
    required: true,
    reference: "IAS 1.10(c)",
    structure: ["Opening Balance", "Changes", "Closing Balance"],
  },

  /**
   * Statement of Cash Flows
   * 
   * Presents cash flows from operating, investing, and financing activities.
   */
  statementOfCashFlows: {
    required: true,
    reference: "IAS 7",
    structure: ["Operating Activities", "Investing Activities", "Financing Activities"],
  },
} as const;

/**
 * IFRS Materiality Threshold
 * 
 * Information is material if omitting, misstating, or obscuring it
 * could reasonably be expected to influence decisions.
 * 
 * Reference: IAS 1.7, IAS 8.5
 */
export const IFRSMateriality = {
  definition: "Information is material if it could influence decisions",
  reference: "IAS 1.7, IAS 8.5",
  application: "Entity-specific, based on nature and magnitude",
  note: "No quantitative threshold defined by IFRS",
} as const;

/**
 * IFRS Schema for Account Types
 * 
 * Validates account types against IFRS classification.
 * 
 * Hierarchy:
 * - INCOME (parent category)
 *   - REVENUE (subcategory: sales from business transactions)
 *   - GAINS (subcategory: other income)
 * - EXPENSE (parent category)
 *   - EXPENSES (subcategory: ordinary expenses)
 *   - LOSSES (subcategory: non-ordinary expenses)
 */
export const IFRSAccountTypeSchema = z.enum([
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "INCOME", // Parent category
  "REVENUE", // Subcategory of INCOME (sales from business transactions)
  "GAINS", // Subcategory of INCOME (other income)
  "EXPENSE", // Parent category
  "EXPENSES", // Subcategory of EXPENSE (ordinary expenses)
  "LOSSES", // Subcategory of EXPENSE (non-ordinary expenses)
]);

export type IFRSAccountType = z.infer<typeof IFRSAccountTypeSchema>;

/**
 * IFRS Account Type Hierarchy
 * 
 * Maps subcategories to parent categories for proper IFRS classification.
 */
export const IFRSAccountTypeHierarchy = {
  INCOME: {
    parent: null,
    subcategories: ["REVENUE", "GAINS"],
    definition: "Increases in economic benefits",
  },
  REVENUE: {
    parent: "INCOME",
    subcategories: [],
    definition: "Sales generated from business transactions (core operations)",
  },
  GAINS: {
    parent: "INCOME",
    subcategories: [],
    definition: "Income from non-core operations (other income)",
  },
  EXPENSE: {
    parent: null,
    subcategories: ["EXPENSES", "LOSSES"],
    definition: "Decreases in economic benefits",
  },
  EXPENSES: {
    parent: "EXPENSE",
    subcategories: [],
    definition: "Ordinary expenses from business operations",
  },
  LOSSES: {
    parent: "EXPENSE",
    subcategories: [],
    definition: "Non-ordinary expenses (losses)",
  },
} as const;

/**
 * Get parent category for an IFRS account type
 */
export function getIFRSParentCategory(accountType: IFRSAccountType): IFRSAccountType | null {
  const hierarchy = IFRSAccountTypeHierarchy[accountType as keyof typeof IFRSAccountTypeHierarchy];
  if (!hierarchy) return null;
  return (hierarchy.parent as IFRSAccountType | null) || null;
}

/**
 * Check if account type is a subcategory
 */
export function isIFRSSubcategory(accountType: IFRSAccountType): boolean {
  const hierarchy = IFRSAccountTypeHierarchy[accountType as keyof typeof IFRSAccountTypeHierarchy];
  if (!hierarchy) return false;
  return hierarchy.parent !== null && hierarchy.parent !== undefined;
}

/**
 * Get IFRS account classification rules
 */
export function getIFRSAccountRules(accountType: IFRSAccountType): typeof IFRSAccountClassification[keyof typeof IFRSAccountClassification] | undefined {
  return IFRSAccountClassification[accountType as keyof typeof IFRSAccountClassification];
}

/**
 * Validate double-entry bookkeeping (IFRS)
 * 
 * Ensures total debits equal total credits.
 */
export function validateIFRSDoubleEntry(
  debits: number,
  credits: number
): { valid: boolean; error?: string } {
  if (Math.abs(debits - credits) > 0.01) {
    return {
      valid: false,
      error: `IFRS double-entry violation: Debits (${debits}) must equal Credits (${credits})`,
    };
  }
  return { valid: true };
}

/**
 * Get normal balance for account type (IFRS)
 * 
 * Handles subcategories by checking parent category if needed.
 */
export function getIFRSNormalBalance(accountType: IFRSAccountType): "DEBIT" | "CREDIT" {
  // If it's a subcategory, check parent category
  const parent = getIFRSParentCategory(accountType);
  if (parent) {
    const parentClassification = IFRSAccountClassification[parent as keyof typeof IFRSAccountClassification];
    if (parentClassification) {
      return parentClassification.normalBalance;
    }
  }
  
  // Direct category
  const classification = IFRSAccountClassification[accountType as keyof typeof IFRSAccountClassification];
  if (classification) {
    return classification.normalBalance;
  }
  
  // Default: INCOME and subcategories are CREDIT, EXPENSE and subcategories are DEBIT
  if (accountType === "INCOME" || accountType === "REVENUE" || accountType === "GAINS") {
    return "CREDIT";
  }
  if (accountType === "EXPENSE" || accountType === "EXPENSES" || accountType === "LOSSES") {
    return "DEBIT";
  }
  
  // Assets and Expenses: DEBIT
  if (accountType === "ASSET") {
    return "DEBIT";
  }
  
  // Liabilities, Equity, Income: CREDIT
  return "CREDIT";
}
