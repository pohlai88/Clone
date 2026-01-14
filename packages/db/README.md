# AXIS Database Layer

Database abstraction layer with adapter pattern, contract-first validation, and dual-layer metadata architecture.

## Architecture

### Core Components

- **`@axis/db-core`**: Abstract interfaces, contracts (Zod schemas), and adapter pattern
- **`@axis/db-manifest`**: Read-only materialized database adapter
- **Adapters**: Neon, Supabase, Prisma, Azure SQL

### Key Features

1. **Adapter Pattern (Gang of 4)**: Plug-and-play database provider swapping
2. **Circuit Breakers**: Fault tolerance and automatic recovery
3. **Contract-First**: Zod schemas for all database operations
4. **Aliasing Mechanism**: Pre-defined aliases (Blue, hex, HSL, WebSocket) with registration system
5. **Dual-Layer Metadata**:
   - Transactional DB (write-heavy, for "Cobalt" users)
   - Manifest DB (read-heavy, materialized, for "Quorum" users)

## Usage

### Basic Adapter Usage

```typescript
import { NeonAdapter } from "@axis/db-neon";
import type { DatabaseConnection } from "@axis/db-core/contracts";

const adapter = new NeonAdapter();
await adapter.connect({
  host: "localhost",
  port: 5432,
  database: "mydb",
  user: "user",
  password: "password",
});

const result = await adapter.query("SELECT * FROM users");
```

### Manifest Adapter (Read-Only)

```typescript
import { ManifestAdapter } from "@axis/db-manifest";
import { NeonAdapter } from "@axis/db-neon";

const sourceAdapter = new NeonAdapter();
await sourceAdapter.connect(transactionalConfig);

const manifestAdapter = new ManifestAdapter(sourceAdapter);
await manifestAdapter.connect(manifestConfig);

// Only SELECT queries allowed
const result = await manifestAdapter.query("SELECT * FROM materialized_view");
```

### Aliasing System

```typescript
import { aliasRegistry } from "@axis/db-core/aliases";

// Check if alias exists
if (aliasRegistry.has("color.blue")) {
  const alias = aliasRegistry.get("color.blue");
}

// Request registration for missing alias
aliasRegistry.requestRegistration("custom.alias", (alias) => {
  console.log("Alias registered:", alias);
});
```

## Adapter Swapping

The adapter pattern enables seamless database provider swapping:

```typescript
// Start with Neon
let adapter = new NeonAdapter();
await adapter.connect(neonConfig);

// Switch to Supabase (no code changes needed)
adapter = new SupabaseAdapter();
await adapter.connect(supabaseConfig);
```

## Circuit Breakers

All adapters include circuit breaker protection:

- **CLOSED**: Normal operation
- **OPEN**: Too many failures, blocking requests
- **HALF_OPEN**: Testing if service recovered

Circuit breakers automatically recover after the reset timeout.

## Contract-First Validation

All database operations are validated using Zod schemas:

```typescript
import { DatabaseConnectionSchema } from "@axis/db-core/contracts";

const config = DatabaseConnectionSchema.parse({
  host: "localhost",
  port: 5432,
  database: "mydb",
  user: "user",
});
```

## Status

Phase 2 implementation complete. All adapters are placeholder implementations ready for:
- Database driver integration
- Transaction implementation
- Materialized view setup
- Full alias registration workflow
