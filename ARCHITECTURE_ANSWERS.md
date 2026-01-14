# Architecture Questions & Answers

## 1. Zod Import: Zod v4 ✅ CONFIRMED

**Status**: ✅ **Zod v4 is stable and released**

**Source**: [Zod v4 Changelog](https://zod.dev/v4/changelog)

**Installation**:
```bash
npm install zod@^4.0.0
```

**Import Syntax** (Unchanged):
```typescript
import { z } from "zod"; // ✅ Still works in v4
```

**Key Breaking Changes**:
- Unified error API: `{ error: ... }` replaces `{ message: ... }`, `invalid_type_error`, `required_error`
- Top-level format helpers: `z.email()`, `z.uuid()` (method form deprecated)
- `z.number().int()` accepts safe integers only
- `z.record()` requires two arguments (no single argument)
- Error handling: `.format()`, `.flatten()` deprecated → use `z.treeifyError()`

**Migration**:
- ✅ Package.json updated to `zod@^4.0.0`
- ⏳ Code review needed for breaking changes
- See `ZOD_V4_MIGRATION.md` for full migration guide
- Codemod available: [zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4)

---

## 2. Type Generation Strategy: Hardcoded vs Type Layers

**Answer: Type Layers with Single Source of Truth**

You're absolutely right - types should NOT be hardcoded. Each type system carries specific meaning:

### Type Layers:

1. **ZodType** (Runtime Validation)
   - Purpose: Runtime validation, sanitization, serialization
   - Stage: Boundary enforcement
   - Generated from: Living Schema

2. **DrizzleType** (Database Schema)
   - Purpose: Database table definitions, query type inference
   - Stage: Database operations
   - Generated from: Manifest → Drizzle schema

3. **NextType** (Next.js Type Inference)
   - Purpose: Server Actions, Route handlers, Client/Server type safety
   - Stage: Application layer
   - Generated from: Living Schema → Next.js types

### Generation Flow:

```
Metadata → Manifest → Living Schema → Type Generation
                                    ├─→ ZodType (runtime)
                                    ├─→ DrizzleType (database)
                                    └─→ NextType (Next.js)
```

### Implementation:

See `packages/db/core/src/types/type-layers.ts` for:
- Type authority levels (SOVEREIGN, REGISTRY, APPLICATION)
- Type mutation policies (additive-only, restricted, free)
- Type registry for tracking all type definitions
- Type generator interface

---

## 3. Currency, Time, Unit Measurements: PostgreSQL Types as Canonical

**CORRECTION**: PostgreSQL Chapter 8 Data Types is the **SMART level** for business metadata.

### Key Principle

> **PostgreSQL has already solved the business metadata problem. We map TO PostgreSQL types, not invent our own.**

### Time: PostgreSQL `timestamp with time zone` (CANONICAL)

- **PostgreSQL Type**: `timestamp with time zone` (timestamptz)
- **Storage**: 8 bytes
- **Range**: 4713 BC to 294276 AD
- **Precision**: 1 microsecond
- **Canonical**: ✅ **YES** - This IS the time type
- **ISO 8601**: ❌ **ALIASING** - Just input/output format, PostgreSQL converts internally

**Reference**: [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)

### Currency: PostgreSQL `numeric(p, s)` (CANONICAL)

- **PostgreSQL Type**: `numeric(p, s)` or `decimal(p, s)`
- **Storage**: Variable (exact precision)
- **Precision**: p = total digits, s = decimal places
- **Canonical**: ✅ **YES** - This IS the currency storage
- **ISO 4217**: ❌ **ALIASING** - Just display metadata, PostgreSQL numeric is storage

### Measurements: PostgreSQL `numeric(p, s)` (CANONICAL)

- **PostgreSQL Type**: `numeric(p, s)` with unit metadata
- **Canonical**: ✅ **YES** - PostgreSQL numeric is storage
- **SI/Imperial Units**: ❌ **ALIASING** - Just metadata for display/conversion

### Implementation:

See `packages/db/core/src/postgresql-types/index.ts` for:
- PostgreSQL timestamp with time zone (canonical time type)
- PostgreSQL numeric/decimal (canonical currency/precision storage)
- PostgreSQL date, time, interval types
- Adapters for aliasing (ISO 8601 → PostgreSQL, etc.)

**Business Rule**: 
> If you're not using PostgreSQL for accounting, you're not our customer.

This means all business data types MUST map to PostgreSQL types.

---

## 4. Dual Layer Architecture Understanding

**Answer: Metadata → Manifest → Living Schema → Schema Enforcement**

### Canonical Order (Locked):

```
Metadata (Meaning Layer)
    ↓
Manifest (Declared Outcome Layer - Kernel Quarum)
    ↓
Living Schema (Consumable Constraint Layer)
    ↓
Schema Enforcement (Zod - Runtime)
```

### Layer Breakdown:

#### 1. Metadata (Meaning Layer)
- **What**: Defines WHAT things mean
- **Scope**: Accounting semantics, business concepts, reporting meaning
- **Characteristics**: Human-readable, stable, slow-moving
- **Never**: Inferred from schemas
- **Implementation**: `packages/db/core/src/metadata/index.ts`

#### 2. Manifest (Kernel Quarum)
- **What**: System's declared, consumable reality
- **Source**: Materialized views from Kernel Cobalt (transactional)
- **Rules**: Read-only, business-aliased, flattened, stable
- **Consumers**: UI, API, BI (forbidden from querying transactional tables)
- **Implementation**: `packages/db/manifest/` (read-only adapter)

#### 3. Living Schema (Consumable Constraint Layer)
- **What**: Read-only contract from Manifest + Metadata
- **Declares**: Field constraints, allowed values, accounting tags, privacy flags
- **Purpose**: Dynamic UI rendering, safe customization
- **Never**: Mutates data or defines truth
- **Implementation**: Generated from Manifest + Metadata

#### 4. Schema Enforcement (Zod)
- **What**: Runtime enforcement of declared contracts
- **Purpose**: Boundary enforcement only
- **Does NOT**: Define meaning (that's Metadata's job)
- **Implementation**: All existing Zod schemas

### Dual-Kernel Separation:

#### Kernel Cobalt (Transactional)
- **Role**: Forge truth
- **Responsibilities**: Writes, updates, state transitions, accounting logic
- **Rule**: If it mutates truth, it belongs in Cobalt
- **Zod Role**: Enforces invariants at write-time

#### Kernel Quarum (Manifest)
- **Role**: Declare truth
- **Responsibilities**: Materialized views, business-aliasing, query optimization
- **Rule**: Quarum is not a cache - it IS the Manifest
- **Zod Role**: Enforces contract stability at read-time

### Implementation Status:

✅ **Completed:**
- Metadata registry structure
- Standards (ISO 4217, ISO 8601, SI units)
- Type layer strategy
- Manifest adapter (read-only)

⏳ **Pending:**
- Living Schema generation from Manifest + Metadata
- Type generation from single source of truth
- Full Cobalt → Quarum materialization pipeline

---

## Next Steps

1. **Update existing schemas** to use recognized standards (ISO 4217, ISO 8601)
2. **Implement type generation** from Metadata → Manifest → Living Schema
3. **Add schema authority annotations** to all Zod schemas
4. **Connect Metadata registry** to existing business logic
5. **Generate Living Schemas** from Manifest + Metadata

See implementation files:
- `packages/db/core/src/metadata/index.ts` - Metadata layer
- `packages/db/core/src/types/type-layers.ts` - Type layer strategy
- `packages/db/core/src/standards/index.ts` - Recognized standards
