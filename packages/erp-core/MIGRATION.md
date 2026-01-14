# Migration Guide: NextERP Python → AXIS TypeScript

This guide documents the migration of business logic from NextERP (Python) to AXIS (TypeScript).

## Migration Strategy

### Phase 1: Analysis
- ✅ Identify business logic modules in NextERP
- ✅ Map Python patterns to TypeScript equivalents
- ✅ Document data models and schemas

### Phase 2: Schema Migration
- ✅ Convert Pydantic models to Zod schemas
- ✅ Preserve validation rules
- ✅ Add TypeScript types

### Phase 3: Service Migration
- ✅ Extract business logic from FastAPI routes
- ✅ Create service classes
- ✅ Remove framework dependencies

### Phase 4: Integration
- ⏳ Connect services to database adapters
- ⏳ Add error handling
- ⏳ Implement missing features

## Module Mapping

### Authentication Module

**NextERP Location**: `backend/app/api/v1/auth/routes.py`

**AXIS Location**: `packages/erp-core/src/modules/auth/index.ts`

**Key Changes**:
- Pydantic → Zod schemas
- FastAPI routes → Service class methods
- SQLAlchemy → Database adapter pattern

### General Ledger Module

**NextERP Location**: `backend/app/api/v1/general_ledger/`

**AXIS Location**: `packages/erp-core/src/modules/general-ledger/index.ts`

**Key Changes**:
- Python service classes → TypeScript service classes
- Pydantic schemas → Zod schemas
- SQLAlchemy queries → Database adapter queries

## Code Patterns

### Schema Definition

**Python (Pydantic):**
```python
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    username: str
    is_active: bool = True
```

**TypeScript (Zod):**
```typescript
import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  isActive: z.boolean().default(true),
});
```

### Service Methods

**Python:**
```python
def create_user(user_data: UserCreate):
    # Business logic here
    return user
```

**TypeScript:**
```typescript
static async createUser(userData: UserCreate): Promise<OperationResult> {
  // Business logic here
  return createSuccessResult(user);
}
```

### Validation

**Python:**
```python
user = UserCreate(**request.json())
```

**TypeScript:**
```typescript
const validation = validateAndParse(UserCreateSchema, requestData);
if (!validation.success) {
  return createErrorResult("Validation failed", validation.errors);
}
```

## Testing Strategy

1. **Unit Tests**: Test service methods in isolation
2. **Integration Tests**: Test with database adapters
3. **Contract Tests**: Validate Zod schemas match Python schemas

## Remaining Work

- [ ] Complete authentication service implementation
- [ ] Complete general ledger service implementation
- [ ] Add inventory module
- [ ] Add sales module
- [ ] Add purchasing module
- [ ] Add accounting module
- [ ] Integrate database adapters
- [ ] Add comprehensive error handling
- [ ] Add logging and monitoring

## Notes

- All business logic is framework-agnostic
- Database operations use adapter pattern (can swap providers)
- Validation is contract-first with Zod
- Type safety is enforced throughout
