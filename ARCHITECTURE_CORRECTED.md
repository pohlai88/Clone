# Architecture Corrections

## Critical Corrections

### 1. Zod v4 (Not v3)

**Correction**: Zod is now **v4**, and it has significant differences from v3.

**Action Required**:
- Update all imports to use Zod v4 syntax
- Review breaking changes in Zod v4
- Update package.json dependencies

**Current Status**: ⚠️ Need to verify Zod v4 release and update accordingly

---

### 2. PostgreSQL Types as Canonical Foundation

**Correction**: PostgreSQL Chapter 8 Data Types is the **SMART level** for business metadata.

**Key Principle**:
> PostgreSQL has already solved the business metadata problem that humans/businesses struggle with. We map TO PostgreSQL types, not invent our own.

**Architecture Change**:

**OLD (Wrong)**:
```
ISO 8601 → Zod Schema → TypeScript Type
```

**NEW (Correct)**:
```
PostgreSQL Type (Canonical) → Zod Schema (Enforcement) → TypeScript Type
```

### PostgreSQL as Canonical Source

For **Time**:
- **PostgreSQL Type**: `timestamp with time zone` (timestamptz)
- **Canonical**: This IS the time type
- **Everything Else**: ISO 8601, RFC 3339, etc. are just **aliasing/morphology**

For **Currency**:
- **PostgreSQL Type**: `numeric(p, s)` (exact precision)
- **Canonical**: This IS the currency storage
- **Everything Else**: ISO 4217 codes are just **aliasing** (for display only)

For **Measurements**:
- **PostgreSQL Type**: `numeric(p, s)` with unit metadata
- **Canonical**: PostgreSQL numeric is the storage
- **Everything Else**: SI units, Imperial, etc. are just **aliasing**

### Implementation

See `packages/db/core/src/postgresql-types/index.ts` for:
- PostgreSQL timestamp with time zone (canonical time type)
- PostgreSQL date, time, interval types
- PostgreSQL numeric/decimal (canonical currency/precision storage)
- Type adapters (ISO 8601 → PostgreSQL, etc.)

### Business Rule

> **If you're not using PostgreSQL for accounting, you're not our customer.**

This means:
- All business data types MUST map to PostgreSQL types
- PostgreSQL types are the source of truth
- External formats (ISO 8601, ISO 4217) are aliasing layers only
- Zod schemas enforce PostgreSQL type constraints, not invent new types

---

## Updated Architecture Flow

### Canonical Order (Corrected):

```
PostgreSQL Types (Canonical Foundation)
    ↓
Metadata (Business + Technical - references PostgreSQL types)
    ↓
Manifest (Materialized from PostgreSQL - Kernel Quarum)
    ↓
Living Schema (Generated from Manifest + Metadata)
    ↓
Zod Schemas (Enforce PostgreSQL type constraints)
    ↓
TypeScript Types (Inferred from Zod)
```

### Type Generation (Corrected):

```
PostgreSQL Type → Drizzle Schema → Zod Schema → TypeScript Type
```

**NOT**:
```
Zod Schema → TypeScript Type → Drizzle Schema
```

---

## PostgreSQL Type Mappings

### Time Types

| PostgreSQL Type | Storage | Range | Precision | Canonical? |
|----------------|---------|-------|-----------|------------|
| `timestamp with time zone` | 8 bytes | 4713 BC to 294276 AD | 1 microsecond | ✅ YES |
| `timestamp without time zone` | 8 bytes | 4713 BC to 294276 AD | 1 microsecond | For local time |
| `date` | 4 bytes | 4713 BC to 5874897 AD | 1 day | ✅ YES |
| `time without time zone` | 8 bytes | 00:00:00 to 24:00:00 | 1 microsecond | ✅ YES |
| `interval` | 16 bytes | -178M to +178M years | 1 microsecond | ✅ YES |

**Reference**: [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)

### Numeric Types (Currency)

| PostgreSQL Type | Storage | Precision | Canonical? |
|----------------|---------|-----------|------------|
| `numeric(p, s)` | Variable | Exact (p digits, s decimal places) | ✅ YES |
| `decimal(p, s)` | Variable | Same as numeric | ✅ YES |

**For Currency**: Use `numeric(19, 4)` or `numeric(19, 2)` depending on requirements.

---

## Updated Standards Approach

### Time Input/Output

**PostgreSQL Handles**:
- ISO 8601 input → converts to `timestamp with time zone`
- SQL-compatible formats → converts to `timestamp with time zone`
- Traditional POSTGRES formats → converts to `timestamp with time zone`

**Our Job**:
- Accept various input formats (PostgreSQL will convert)
- Store as `timestamp with time zone` (canonical)
- Output in desired format (aliasing/morphology)

### Currency Input/Output

**PostgreSQL Handles**:
- Exact precision storage with `numeric(p, s)`
- No rounding errors
- Perfect for accounting

**Our Job**:
- Store as `numeric(p, s)` (canonical)
- Currency codes (ISO 4217) are metadata/aliasing for display
- Format for display (aliasing/morphology)

---

## Implementation Files

1. **`packages/db/core/src/postgresql-types/index.ts`**
   - PostgreSQL type schemas (canonical)
   - Type registry
   - Adapters for aliasing (ISO 8601 → PostgreSQL, etc.)

2. **Updated Standards** (to be revised)
   - Remove ISO 8601 as canonical
   - Use PostgreSQL types as canonical
   - ISO 8601 becomes aliasing layer only

---

## Next Steps

1. ✅ Verify Zod v4 release and update imports
2. ✅ Update all time schemas to use PostgreSQL `timestamp with time zone`
3. ✅ Update currency schemas to use PostgreSQL `numeric(p, s)`
4. ✅ Revise metadata to reference PostgreSQL types
5. ✅ Update Drizzle schemas to match PostgreSQL types exactly
6. ✅ Update Zod schemas to enforce PostgreSQL constraints

---

## Key Insight

> **PostgreSQL's type system IS the business metadata solution.**
> 
> We don't invent types. We map to PostgreSQL types.
> Everything else (ISO standards, etc.) is aliasing/morphology for input/output.
> 
> PostgreSQL handles the complexity. We just need to speak PostgreSQL's language.
