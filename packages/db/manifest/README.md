# Manifest Database Adapter

Read-only adapter for materialized database.

## Purpose

The Manifest adapter provides read-only access to materialized views from the transactional database. It is designed for white-collar users (Quorum - CFO, CTO, CEO) who need analytics, reporting, and data extraction.

## Features

- **ACID**: Maintains data consistency
- **RBAC**: Role-based access control
- **Cross-App Search**: Search across all applications
- **Audit**: Complete audit trail
- **Predict**: Predictive analytics capabilities

## Usage

```typescript
import { ManifestAdapter } from "@axis/db-manifest";
import { NeonAdapter } from "@axis/db-neon";

// Create source adapter (transactional DB)
const sourceAdapter = new NeonAdapter();
await sourceAdapter.connect(config);

// Create manifest adapter (read-only)
const manifestAdapter = new ManifestAdapter(sourceAdapter);
await manifestAdapter.connect(manifestConfig);

// Execute read-only queries
const result = await manifestAdapter.query("SELECT * FROM materialized_view");
```

## Restrictions

- Only SELECT queries are allowed
- No transactions (read-only)
- Can be frontend-accessible (read-only)
