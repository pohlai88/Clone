/**
 * IFRS Business Metadata Aliasing
 * 
 * Maps business metadata (how non-accountants understand "money") to IFRS technical metadata.
 * 
 * This is the aliasing layer that connects:
 * - Business Metadata: "Money", "Sales", "Income" (B2C, P2P understanding)
 * - Technical Metadata: IFRS classifications (Revenue, Gains, Income)
 * 
 * The dual kernel architecture uses this to:
 * - Kernel Cobalt (Transactional): Stores IFRS classifications
 * - Kernel Quarum (Manifest): Presents business-friendly terms
 * 
 * @authority: REGISTRY
 * @mutation: restricted
 */

import type { IFRSAccountType } from "./ifrs.js";
import { getIFRSParentCategory, isIFRSSubcategory } from "./ifrs.js";

/**
 * Business Metadata Terms (Non-Accounting Understanding)
 * 
 * These are the terms that non-accountants use to understand "money":
 * - "Money" - Generic term for any financial value
 * - "Sales" - Money from selling products/services
 * - "Income" - Money coming in
 * - "Expense" - Money going out
 * - "Profit" - Money left over
 */
export const BusinessMetadataTerms = {
  MONEY: {
    description: "Generic term for any financial value",
    ifrsMapping: ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"],
    note: "Too generic - requires context to map to IFRS",
  },
  SALES: {
    description: "Money from selling products/services (business transactions)",
    ifrsMapping: ["REVENUE"],
    note: "Maps to IFRS Revenue (sales from business transactions)",
  },
  INCOME: {
    description: "Money coming in (outcome)",
    ifrsMapping: ["INCOME", "REVENUE", "GAINS"],
    note: "Maps to IFRS Income (parent) or Revenue/Gains (specific)",
  },
  REVENUE: {
    description: "Sales generated from business transactions",
    ifrsMapping: ["REVENUE"],
    note: "Maps to IFRS Revenue (core operations)",
  },
  GAINS: {
    description: "Other income (not from core operations)",
    ifrsMapping: ["GAINS"],
    note: "Maps to IFRS Gains (other income)",
  },
  EXPENSE: {
    description: "Money going out",
    ifrsMapping: ["EXPENSE", "EXPENSES", "LOSSES"],
    note: "Maps to IFRS Expense (parent) or Expenses/Losses (specific)",
  },
  PROFIT: {
    description: "Money left over (Income - Expenses)",
    ifrsMapping: ["EQUITY"],
    note: "Maps to IFRS Equity (residual interest)",
  },
} as const;

/**
 * IFRS Technical Metadata Terms (Accounting Understanding)
 * 
 * These are the IFRS classifications that accountants use:
 * - Revenue: Sales from business transactions (IFRS 15)
 * - Gains: Other income (not from core operations)
 * - Income: Parent category (Revenue + Gains)
 * - Expenses: Ordinary expenses from operations
 * - Losses: Non-ordinary expenses
 * - Expense: Parent category (Expenses + Losses)
 */
export const IFRSTechnicalMetadata = {
  REVENUE: {
    definition: "Sales generated from business transactions (core operations)",
    reference: "IFRS 15, IAS 1.88",
    businessAliases: ["SALES", "REVENUE", "INCOME"],
    parentCategory: "INCOME",
    isSubcategory: true,
  },
  GAINS: {
    definition: "Income from non-core operations (other income)",
    reference: "IAS 1.88",
    businessAliases: ["GAINS", "OTHER_INCOME", "INCOME"],
    parentCategory: "INCOME",
    isSubcategory: true,
  },
  INCOME: {
    definition: "Increases in economic benefits (revenue, gains)",
    reference: "IAS 1.88",
    businessAliases: ["INCOME", "MONEY_IN"],
    parentCategory: null,
    subcategories: ["REVENUE", "GAINS"],
  },
  EXPENSES: {
    definition: "Ordinary expenses from business operations",
    reference: "IAS 1.88",
    businessAliases: ["EXPENSES", "COSTS", "EXPENSE"],
    parentCategory: "EXPENSE",
    isSubcategory: true,
  },
  LOSSES: {
    definition: "Non-ordinary expenses (losses)",
    reference: "IAS 1.88",
    businessAliases: ["LOSSES", "EXPENSE"],
    parentCategory: "EXPENSE",
    isSubcategory: true,
  },
  EXPENSE: {
    definition: "Decreases in economic benefits (expenses, losses)",
    reference: "IAS 1.88",
    businessAliases: ["EXPENSE", "MONEY_OUT"],
    parentCategory: null,
    subcategories: ["EXPENSES", "LOSSES"],
  },
} as const;

/**
 * Map business metadata term to IFRS classification
 * 
 * This is the aliasing mechanism that converts:
 * - Business understanding ("Sales", "Money") → IFRS classification ("REVENUE", "INCOME")
 */
export function mapBusinessToIFRS(businessTerm: string): IFRSAccountType | null {
  const normalized = businessTerm.toUpperCase().trim();
  
  // Direct mapping
  if (normalized === "SALES" || normalized === "REVENUE") {
    return "REVENUE";
  }
  if (normalized === "GAINS" || normalized === "OTHER_INCOME") {
    return "GAINS";
  }
  if (normalized === "INCOME" || normalized === "MONEY_IN") {
    return "INCOME"; // Parent category
  }
  if (normalized === "EXPENSES" || normalized === "COSTS") {
    return "EXPENSES";
  }
  if (normalized === "LOSSES") {
    return "LOSSES";
  }
  if (normalized === "EXPENSE" || normalized === "MONEY_OUT") {
    return "EXPENSE"; // Parent category
  }
  
  return null;
}

/**
 * Map IFRS classification to business metadata term
 * 
 * This is the reverse aliasing that converts:
 * - IFRS classification ("REVENUE") → Business understanding ("Sales")
 */
export function mapIFRSToBusiness(ifrsType: IFRSAccountType): string[] {
  const technical = IFRSTechnicalMetadata[ifrsType as keyof typeof IFRSTechnicalMetadata];
  if (technical) {
    return technical.businessAliases;
  }
  
  // Fallback for parent categories
  if (ifrsType === "INCOME") {
    return ["INCOME", "MONEY_IN"];
  }
  if (ifrsType === "EXPENSE") {
    return ["EXPENSE", "MONEY_OUT"];
  }
  
  return [];
}

/**
 * Validate business term against IFRS classification
 * 
 * Ensures business metadata correctly maps to IFRS technical metadata.
 */
export function validateBusinessIFRSMapping(
  businessTerm: string,
  ifrsType: IFRSAccountType
): { valid: boolean; error?: string } {
  const mapped = mapBusinessToIFRS(businessTerm);
  
  if (!mapped) {
    return {
      valid: false,
      error: `Business term "${businessTerm}" does not map to any IFRS classification`,
    };
  }
  
  // Check if mapped type matches or is parent/child
  if (mapped === ifrsType) {
    return { valid: true };
  }
  
  // Check parent-child relationship
  const parent = getIFRSParentCategory(ifrsType);
  if (parent === mapped || getIFRSParentCategory(mapped) === ifrsType) {
    return { valid: true };
  }
  
  return {
    valid: false,
    error: `Business term "${businessTerm}" maps to "${mapped}" but expected "${ifrsType}"`,
  };
}
