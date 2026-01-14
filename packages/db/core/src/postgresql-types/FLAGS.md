# PostgreSQL Type Conversion Flags

## ⚠️ PAUSE AND ASK FOR ADVICE

Before implementing any PostgreSQL type conversion logic, **PAUSE and ask the user for advice**.

## PostgreSQL Documentation References

### Primary References

1. **Chapter 8: Data Types**
   - URL: https://www.postgresql.org/docs/current/datatype.html
   - **USE THIS** for all data type definitions

2. **Chapter 10: Type Conversion** ⚠️ **CRITICAL**
   - URL: https://www.postgresql.org/docs/current/typeconv.html
   - **USE THIS** for all type conversion logic
   - **PAUSE and ask user** before implementing any conversion logic

### When to Flag

Flag yourself (and ask user) when you need to:
- Implement type conversion between PostgreSQL types
- Handle implicit vs explicit conversions
- Map between PostgreSQL types and TypeScript/Zod types
- Implement casting logic
- Handle type coercion
- Work with type compatibility rules

### Flag Format

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
 */
```

## DRY Principle

- **DO NOT** implement type conversion logic without checking PostgreSQL docs
- **DO NOT** guess PostgreSQL type behavior
- **DO** reference PostgreSQL documentation first
- **DO** ask user for advice on complex conversions

## Token Saving

By checking PostgreSQL docs first and asking for advice, we:
- Avoid implementing incorrect logic
- Save tokens on debugging
- Follow DRY (PostgreSQL docs are source of truth)
- Ensure correctness from the start
