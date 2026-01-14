# AXIS ERP Core

Core business logic extracted from NextERP and migrated from Python to TypeScript.

## Overview

This package contains pure business logic with no framework dependencies. All operations use contract-first validation with Zod schemas.

## Architecture

### Modules

- **Authentication**: User authentication and authorization
- **General Ledger**: Accounting and journal entry management
- **Future Modules**: Inventory, Sales, Purchasing, etc.

### Design Principles

1. **Contract-First**: All inputs/outputs validated with Zod schemas
2. **Framework-Agnostic**: No Next.js, Express, or other framework dependencies
3. **Pure Business Logic**: No database queries, HTTP handling, or UI concerns
4. **Type-Safe**: Full TypeScript support with strict typing

## Usage

### Authentication

```typescript
import { AuthenticationService, LoginRequestSchema } from "@axis/erp-core";

// Validate login request
const validation = AuthenticationService.validateLogin({
  email: "user@example.com",
  password: "password123",
});

if (validation.success) {
  const loginData = validation.data;
  // Use loginData...
}
```

### General Ledger

```typescript
import { GeneralLedgerService, CreateJournalEntryRequestSchema } from "@axis/erp-core";

// Validate journal entry
const validation = GeneralLedgerService.validateJournalEntry({
  date: new Date(),
  description: "Monthly expenses",
  lines: [
    { accountId: "acc-1", debit: 1000, credit: 0 },
    { accountId: "acc-2", debit: 0, credit: 1000 },
  ],
});

if (validation.success) {
  const entry = await GeneralLedgerService.createJournalEntry(validation.data);
}
```

## Migration from NextERP

### Python to TypeScript Mapping

| Python (NextERP) | TypeScript (AXIS) |
|-----------------|-------------------|
| Pydantic schemas | Zod schemas |
| FastAPI routes | Service classes |
| SQLAlchemy models | TypeScript types + DB adapters |
| Python classes | TypeScript classes |

### Example Migration

**Python (NextERP):**
```python
from pydantic import BaseModel

class User(BaseModel):
    email: str
    username: str
```

**TypeScript (AXIS):**
```typescript
import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  username: z.string(),
});
```

## Integration

### With Database Adapters

```typescript
import { AuthenticationService } from "@axis/erp-core";
import { NeonAdapter } from "@axis/db-neon";

const adapter = new NeonAdapter();
await adapter.connect(config);

// Use adapter in service methods
// TODO: Integrate adapter into service classes
```

### With UI Components

```typescript
import { AuthenticationService } from "@axis/erp-core";
import { Button } from "@axis/ui";

// Validate form data before submission
const validation = AuthenticationService.validateLogin(formData);
if (!validation.success) {
  // Show errors in UI
}
```

## Status

- ✅ Authentication module (basic structure)
- ✅ General Ledger module (basic structure)
- ⏳ Database integration (pending)
- ⏳ Additional modules (inventory, sales, etc.)

## Next Steps

1. Integrate database adapters into service classes
2. Add password hashing and JWT token generation
3. Implement full CRUD operations
4. Add more business logic modules
5. Add unit tests
