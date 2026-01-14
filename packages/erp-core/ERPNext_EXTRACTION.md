# ERPNext Business Logic Extraction Plan

## Strategy: Extract, Don't Rebuild

**Goal**: Extract proven business logic from ERPNext to reduce implementation workload.

**Approach**:
1. Identify ERPNext modules to extract
2. Map ERPNext patterns to TypeScript/Zod
3. Extract business logic (not UI, not framework code)
4. Adapt to our architecture (PostgreSQL types, IFRS standards, aliasing)

---

## ERPNext Modules to Extract

### Priority 1: Core Accounting
- ✅ **General Ledger** - Already started
- ⏳ **Accounts Payable** - Vendor invoices, payments
- ⏳ **Accounts Receivable** - Customer invoices, payments
- ⏳ **Chart of Accounts** - Account structure, hierarchy

### Priority 2: Inventory
- ⏳ **Stock Management** - Items, warehouses, stock entries
- ⏳ **Stock Valuation** - FIFO, LIFO, moving average
- ⏳ **Serial/Batch Tracking** - Item tracking

### Priority 3: Sales & Purchasing
- ⏳ **Sales Order** - Customer orders, quotations
- ⏳ **Purchase Order** - Vendor orders, RFQs
- ⏳ **Delivery Note** - Shipments
- ⏳ **Purchase Receipt** - Goods received

### Priority 4: Financial Reporting
- ⏳ **Trial Balance** - Account balances
- ⏳ **Profit & Loss** - Income statement
- ⏳ **Balance Sheet** - Financial position
- ⏳ **Cash Flow** - Cash flow statement

---

## Extraction Pattern

### 1. Identify ERPNext Source Files

**ERPNext Structure**:
```
erpnext/
  accounts/
    doctype/
      journal_entry/
        journal_entry.py          # Business logic
        journal_entry.json        # Schema definition
      sales_invoice/
        sales_invoice.py
        sales_invoice.json
  stock/
    doctype/
      item/
        item.py
        item.json
```

### 2. Extract Business Logic

**What to Extract**:
- ✅ Validation rules
- ✅ Calculation logic
- ✅ Business workflows
- ✅ State transitions
- ✅ Business rules

**What NOT to Extract**:
- ❌ UI components
- ❌ Framework code (Frappe-specific)
- ❌ Database queries (we use adapters)
- ❌ Permission checks (we handle separately)

### 3. Convert to TypeScript/Zod

**ERPNext Pattern**:
```python
# ERPNext: journal_entry.py
def validate(self):
    if self.total_debit != self.total_credit:
        frappe.throw("Debits must equal Credits")
    
    for entry in self.accounts:
        if entry.debit and entry.credit:
            frappe.throw("Cannot have both debit and credit")
```

**AXIS Pattern**:
```typescript
// AXIS: packages/erp-core/src/modules/general-ledger/index.ts
export const CreateJournalEntryRequestSchema = z.object({
  // ... fields
}).refine(
  (data) => {
    const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0);
    return Math.abs(totalDebits - totalCredits) < 0.01;
  },
  { error: "Total debits must equal total credits (IFRS double-entry bookkeeping)" }
);
```

---

## Module Extraction Checklist

For each ERPNext module:

- [ ] **1. Identify Source Files**
  - [ ] Find ERPNext doctype files (.py, .json)
  - [ ] Identify business logic functions
  - [ ] Document validation rules

- [ ] **2. Extract Schemas**
  - [ ] Convert ERPNext JSON schema to Zod
  - [ ] Map to PostgreSQL types
  - [ ] Add IFRS classifications
  - [ ] Add business metadata aliasing

- [ ] **3. Extract Business Logic**
  - [ ] Convert validation functions
  - [ ] Convert calculation functions
  - [ ] Convert workflow logic
  - [ ] Remove framework dependencies

- [ ] **4. Create Service Class**
  - [ ] Create TypeScript service class
  - [ ] Add static validation methods
  - [ ] Add business logic methods
  - [ ] Add error handling

- [ ] **5. Integration**
  - [ ] Connect to database adapters
  - [ ] Add IFRS compliance
  - [ ] Add aliasing support
  - [ ] Test with PostgreSQL types

---

## ERPNext → AXIS Mapping

| ERPNext | AXIS |
|---------|------|
| Frappe DocType | Zod Schema + TypeScript Type |
| `frappe.validate()` | Zod `.refine()` |
| `frappe.throw()` | `createErrorResult()` |
| Python dict | TypeScript object |
| Frappe ORM | Database Adapter Pattern |
| ERPNext permissions | Separate auth layer |
| ERPNext workflows | Service class methods |

---

## Next Steps

1. **Start with Accounts Payable**
   - Extract vendor invoice logic
   - Extract payment logic
   - Map to IFRS standards

2. **Continue with Inventory**
   - Extract item management
   - Extract stock valuation
   - Map to PostgreSQL types

3. **Add Sales & Purchasing**
   - Extract order management
   - Extract delivery logic
   - Add business metadata aliasing

---

## Notes

- **Preserve Business Logic**: Extract the "why" not just the "what"
- **Adapt to Architecture**: Use PostgreSQL types, IFRS standards, aliasing
- **Framework-Agnostic**: Remove all ERPNext/Frappe dependencies
- **Contract-First**: All validation with Zod schemas
- **Type-Safe**: Full TypeScript support
