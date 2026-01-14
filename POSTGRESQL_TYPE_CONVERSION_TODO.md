# PostgreSQL Type Conversion - TODO & Flags

## ⚠️ PAUSE AND ASK FOR ADVICE

Before implementing any PostgreSQL type conversion logic, **PAUSE and ask the user for advice**.

## PostgreSQL Documentation References

### Primary References

1. **Chapter 8: Data Types**
   - URL: https://www.postgresql.org/docs/current/datatype.html
   - **USE THIS** for all data type definitions
   - PostgreSQL types are CANONICAL

2. **Chapter 10: Type Conversion** ⚠️ **CRITICAL**
   - URL: https://www.postgresql.org/docs/current/typeconv.html
   - **USE THIS** for all type conversion logic
   - **PAUSE and ask user** before implementing any conversion logic

## When to Flag

Flag yourself (and ask user) when you need to:

- ✅ Implement type conversion between PostgreSQL types
- ✅ Handle implicit vs explicit conversions
- ✅ Map between PostgreSQL types and TypeScript/Zod types
- ✅ Implement casting logic
- ✅ Handle type coercion
- ✅ Work with type compatibility rules
- ✅ Implement numeric/decimal conversions
- ✅ Handle timestamp/timezone conversions
- ✅ Work with interval arithmetic
- ✅ Handle array/record type conversions

## Flag Format

```typescript
/**
 * ⚠️ FLAG: PostgreSQL Type Conversion
 * 
 * TODO: Check PostgreSQL Chapter 10 (Type Conversion) documentation first
 * Reference: https://www.postgresql.org/docs/current/typeconv.html
 * 
 * PAUSE and ask user for advice before implementing:
 * - Type conversion logic
 * - Casting rules
 * - Compatibility checks
 * 
 * This follows DRY principle - PostgreSQL docs are the source of truth.
 * Saves tokens by avoiding incorrect implementations.
 */
```

## DRY Principle

- **DO NOT** implement type conversion logic without checking PostgreSQL docs
- **DO NOT** guess PostgreSQL type behavior
- **DO** reference PostgreSQL documentation first
- **DO** ask user for advice on complex conversions
- **DO** use PostgreSQL types as canonical (Chapter 8)
- **DO** reference PostgreSQL type conversion rules (Chapter 10)

## Token Saving

By checking PostgreSQL docs first and asking for advice:
- ✅ Avoid implementing incorrect logic
- ✅ Save tokens on debugging
- ✅ Follow DRY (PostgreSQL docs are source of truth)
- ✅ Ensure correctness from the start

## Current Implementation Status

### ✅ Completed (No Conversion Logic Yet)
- PostgreSQL type schemas (canonical definitions)
- Type registry structure
- Basic adapters for input/output (aliasing only)

### ⏳ Pending (Requires User Advice)
- Type conversion between PostgreSQL types
- Implicit vs explicit conversion handling
- Casting logic implementation
- Type compatibility checks
- Numeric/decimal conversion rules
- Timestamp/timezone conversion rules
- Interval arithmetic conversions

## Next Steps

1. ⚠️ **PAUSE** when encountering type conversion work
2. Check PostgreSQL Chapter 10 documentation
3. Ask user for advice on implementation approach
4. Implement based on PostgreSQL docs + user guidance
