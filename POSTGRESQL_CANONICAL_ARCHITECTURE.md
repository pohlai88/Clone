# PostgreSQL Canonical Architecture

## Core Principle

> **PostgreSQL Chapter 8 Data Types is the SMART level for business metadata.**
> 
> PostgreSQL has already solved the business metadata problem that humans/businesses struggle with.
> We map TO PostgreSQL types, not invent our own.

## Business Rule

> **If you're not using PostgreSQL for accounting, you're not our customer.**

This means:
- All business data types MUST map to PostgreSQL types
- PostgreSQL types are the source of truth
- External formats (ISO 8601, ISO 4217) are aliasing layers only
- Zod schemas enforce PostgreSQL type constraints, not invent new types

---

## Architecture Flow (Corrected)

### Canonical Order:

```
PostgreSQL Types (Chapter 8 - CANONICAL)
    ↓
Metadata (Business + Technical - references PostgreSQL types)
    ↓
Manifest (Materialized from PostgreSQL - Kernel Quarum)
    ↓
Living Schema (Generated from Manifest + Metadata)
    ↓
Zod Schemas (Enforce PostgreSQL type constraints)
    ↓
Drizzle Schemas (Map to PostgreSQL types)
    ↓
TypeScript Types (Inferred from Zod)
```

### Type Generation (Corrected):

**WRONG** (Old):
```
Zod Schema → TypeScript Type → Drizzle Schema
```

**CORRECT** (New):
```
PostgreSQL Type → Drizzle Schema → Zod Schema → TypeScript Type
```

---

## PostgreSQL Types as Canonical

### Time Types

| PostgreSQL Type | Storage | Range | Precision | Canonical? |
|----------------|---------|-------|-----------|------------|
| `timestamp with time zone` | 8 bytes | 4713 BC to 294276 AD | 1 microsecond | ✅ **YES** |
| `timestamp without time zone` | 8 bytes | 4713 BC to 294276 AD | 1 microsecond | For local time |
| `date` | 4 bytes | 4713 BC to 5874897 AD | 1 day | ✅ **YES** |
| `time without time zone` | 8 bytes | 00:00:00 to 24:00:00 | 1 microsecond | ✅ **YES** |
| `interval` | 16 bytes | -178M to +178M years | 1 microsecond | ✅ **YES** |

**Reference**: [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)

**Key Points**:
- PostgreSQL `timestamp with time zone` is the **canonical time type**
- PostgreSQL accepts ISO 8601 input and converts internally
- ISO 8601, RFC 3339 are **aliasing layers** for input/output only
- PostgreSQL handles all timezone conversions internally (stores in UTC)

### Numeric Types (Currency)

| PostgreSQL Type | Storage | Precision | Canonical? |
|----------------|---------|-----------|------------|
| `numeric(p, s)` | Variable | Exact (p digits, s decimal places) | ✅ **YES** |
| `decimal(p, s)` | Variable | Same as numeric | ✅ **YES** |

**For Currency**:
- Use `numeric(19, 4)` for high precision (e.g., financial calculations)
- Use `numeric(19, 2)` for standard currency (e.g., USD, EUR)
- PostgreSQL numeric is **exact** - no rounding errors
- ISO 4217 codes are **aliasing** for display only

### Measurements

- **PostgreSQL Type**: `numeric(p, s)` with unit metadata
- **Canonical**: PostgreSQL numeric is storage
- **SI/Imperial Units**: Aliasing for display/conversion only

---

## Implementation

### Time Handling

**PostgreSQL Handles**:
- ISO 8601 input → converts to `timestamp with time zone`
- SQL-compatible formats → converts to `timestamp with time zone`
- Traditional POSTGRES formats → converts to `timestamp with time zone`
- Timezone conversions → stores in UTC, converts on retrieval

**Our Job**:
- Accept various input formats (PostgreSQL will convert)
- Store as `timestamp with time zone` (canonical)
- Output in desired format (aliasing/morphology)

**Example**:
```typescript
// Input (aliasing): ISO 8601 string
const input = "2024-01-15T10:30:00Z";

// PostgreSQL converts to: timestamp with time zone (canonical)
// Stored as: UTC timestamp

// Output (aliasing): Format for display
const output = timestamp.toISOString(); // ISO 8601 for API
```

### Currency Handling

**PostgreSQL Handles**:
- Exact precision storage with `numeric(p, s)`
- No rounding errors
- Perfect for accounting

**Our Job**:
- Store as `numeric(p, s)` (canonical)
- Currency codes (ISO 4217) are metadata/aliasing for display
- Format for display (aliasing/morphology)

**Example**:
```typescript
// Input (aliasing): { amount: 1000.50, currency: "USD" }
// PostgreSQL stores: numeric(19, 2) = 1000.50 (canonical)
// Currency code "USD" is metadata for display only

// Output (aliasing): Format for display
const formatted = formatCurrency(amount, "USD"); // "$1,000.50"
```

---

## Files Created

1. **`packages/db/core/src/postgresql-types/index.ts`**
   - PostgreSQL type schemas (canonical)
   - Type registry
   - Adapters for aliasing (ISO 8601 → PostgreSQL, etc.)

2. **Updated `packages/db/core/src/standards/index.ts`**
   - PostgreSQL types as canonical
   - ISO 8601, ISO 4217 as aliasing layers
   - Adapters for input/output conversion

3. **Updated `packages/db/core/src/metadata/index.ts`**
   - Technical metadata references PostgreSQL types
   - Time metadata uses PostgreSQL `timestamp with time zone`
   - Currency metadata uses PostgreSQL `numeric(p, s)`

---

## Next Steps

1. ✅ Update all time schemas to use PostgreSQL `timestamp with time zone`
2. ✅ Update currency schemas to use PostgreSQL `numeric(p, s)`
3. ⏳ Update Drizzle schemas to match PostgreSQL types exactly
4. ⏳ Update Zod schemas to enforce PostgreSQL constraints
5. ⏳ Update erp-core schemas to use PostgreSQL types
6. ⏳ Verify Zod v4 and update if needed

---

## Key Insight

> **PostgreSQL's type system IS the business metadata solution.**
> 
> We don't invent types. We map to PostgreSQL types.
> Everything else (ISO standards, etc.) is aliasing/morphology for input/output.
> 
> PostgreSQL handles the complexity. We just need to speak PostgreSQL's language.
