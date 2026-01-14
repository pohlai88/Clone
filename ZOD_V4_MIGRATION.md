# Zod v4 Migration Guide

## Status: ✅ Zod v4 is Stable

**Source**: [Zod v4 Changelog](https://zod.dev/v4/changelog)

**Installation**:
```bash
npm install zod@^4.0.0
```

## Key Breaking Changes

### 1. Error Customization (Unified API)

**Old (v3)**:
```typescript
z.string().min(5, { message: "Too short" });
z.string({ invalid_type_error: "Not a string", required_error: "Required" });
```

**New (v4)**:
```typescript
z.string().min(5, { error: "Too short" });
z.string({ 
  error: (issue) => issue.input === undefined 
    ? "This field is required" 
    : "Not a string" 
});
```

### 2. Import Syntax (Unchanged)

**Good News**: Import syntax remains the same:
```typescript
import { z } from "zod"; // ✅ Still works in v4
```

### 3. Top-Level Format Helpers

**Old (v3)**:
```typescript
z.string().email();
z.string().uuid();
```

**New (v4)** - Method form deprecated, use top-level:
```typescript
z.email(); // ✅ New (tree-shakable)
z.uuid(); // ✅ New
z.string().email(); // ⚠️ Deprecated but still works
```

### 4. z.number() Changes

- No infinite values (`POSITIVE_INFINITY`, `NEGATIVE_INFINITY`)
- `.int()` accepts safe integers only (within `Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`)
- `.safe()` no longer accepts floats (behaves like `.int()`)

### 5. z.record() Changes

**Old (v3)**:
```typescript
z.record(z.string()); // Single argument
```

**New (v4)**:
```typescript
z.record(z.string(), z.string()); // Two arguments required
z.partialRecord(z.enum(["a", "b"]), z.number()); // For optional keys
```

### 6. Error Handling

- `.format()` deprecated → use `z.treeifyError()`
- `.flatten()` deprecated → use `z.treeifyError()`
- `.addIssue()` / `.addIssues()` deprecated → push directly to `err.issues`

## Migration Steps

1. ✅ Update `package.json`: `"zod": "^4.0.0"`
2. ⏳ Review error customization (if using `message`, `invalid_type_error`, `required_error`)
3. ⏳ Update string format validators (`.email()` → `z.email()`)
4. ⏳ Review number validations (infinite values, `.int()` behavior)
5. ⏳ Update `z.record()` usage (if using single argument)
6. ⏳ Update error handling (if using `.format()`, `.flatten()`)

## Codemod Available

Unofficial codemod: [zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4)

## Current Status

- ✅ Package.json updated to `zod@^4.0.0`
- ⏳ Code review needed for breaking changes
- ⏳ Test after migration
