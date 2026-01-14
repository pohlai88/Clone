# Zod Contract-First Optimization Plan (Rewritten)

## Executive Positioning

This plan positions **Zod not as a validation utility**, but as the **runtime enforcement layer of the system’s Canonical Law**. It is designed to support a **dual-kernel database architecture**, preserve **accounting-grade semantics**, enable **adapter-driven morphology**, and produce **living schemas** that safely power UI, API, and BI without semantic drift.

The system explicitly rejects API-first or schema-first design. Instead, it enforces the following canonical ordering:

**Metadata → Manifest → Living Schema → Schema Enforcement**

---

## 1. Canonical Doctrine

### 1.1 Metadata (Meaning Layer)

Metadata defines *what things mean* — independent of storage, transport, or presentation.

**Scope:**
- Accounting semantics (e.g., Revenue vs Other Income)
- Business concepts (Status, Role, Risk, Category)
- Reporting meaning (IFRS-aligned categories)

**Characteristics:**
- Human-readable
- Stable
- Slow-moving
- Never inferred from schemas

Metadata exists in two coordinated layers:

- **Business Metadata**: semantic meaning, accounting classification, labels
- **Technical Metadata**: type, format, constraints, sensitivity, indexing hints

No Zod schema may invent or redefine metadata.

---

### 1.2 Manifest (Declared Outcome Layer)

The **Manifest** is the system’s *declared, consumable reality*.

It is produced exclusively from transactional truth and expressed as **materialized views** in **Kernel Quarum**.

**Rules:**
- Read-only by policy
- Business-aliased
- Flattened and stable
- Optimized for UI, API, BI consumption

Consumers are forbidden from querying transactional tables directly.

---

### 1.3 Living Schema (Consumable Constraint Layer)

A **Living Schema** is a *read-only contract* generated from the Manifest and enriched with metadata.

It declares:
- Field constraints
- Allowed values
- Accounting category tags
- Privacy and security flags
- Presentation-safe labels

Living Schemas:
- Power dynamic UI rendering
- Enable safe customization
- Prevent UI from inventing meaning

Living Schemas never mutate data and never define truth.

---

### 1.4 Schema Enforcement (Zod)

Zod schemas are used **only to enforce declared contracts** at runtime:

- Write boundaries (transactional enforcement)
- Read boundaries (manifest consumption)
- Adapter ingress/egress

Zod does not define meaning. It enforces law.

---

## 2. Dual-Kernel Database Architecture

### 2.1 Kernel Cobalt (Transactional Kernel)

**Role:** Forge truth.

**Responsibilities:**
- Heavy writes and updates
- State transitions
- Accounting logic
- Audit append-only records
- RBAC and encryption decisions

**Rule:**
> If it mutates truth, it belongs in Cobalt.

Zod enforces invariants at write-time.

---

### 2.2 Kernel Quarum (Manifest Kernel)

**Role:** Declare truth.

**Responsibilities:**
- Materialized views derived from Cobalt
- Business-aliasing and normalization
- Query optimization for consumers

**Rule:**
> Quarum is not a cache. It is the Manifest.

Zod enforces contract stability at read-time.

---

## 3. Adapter & Morphology Strategy

### 3.1 Morphology Definition

**Morphology** is the controlled transformation of representation without loss of meaning.

Examples:
- Revenue vs Income vs Other Income
- Blue vs Denim Blue vs #0000FF
- ZZ vs zZ vs Zz
- REST vs tRPC vs GraphQL vs CSV

---

### 3.2 Adapter Law

An **Adapter** executes morphology.

Every boundary must have an adapter:

- Ingress adapters (external APIs, files, feeds)
- Egress adapters (REST, tRPC, BI exports)

Adapters:
- Parse
- Semantically map
- Normalize morphology
- Project into or out of the Manifest

APIs are transport surfaces — never semantic authorities.

---

## 4. Boundary Enforcement with Zod

Zod schemas must exist at all real boundaries:

- Environment variables
- Transactional writes (Cobalt)
- Manifest reads (Quarum)
- Adapter ingress/egress
- Server Actions
- Route handlers
- Cache
- Middleware
- UI consumption

Each schema must declare its authority level.

---

## 5. Governance Additions (Mandatory)

### 5.1 Schema Authority Tiers

```ts
/**
 * @authority: SOVEREIGN | REGISTRY | APPLICATION
 * @mutation: additive-only | restricted | free
 */
```

- **SOVEREIGN**: Audit, RBAC, Encryption, Ledger
- **REGISTRY**: Metadata, configs, stencils
- **APPLICATION**: Forms, UI, filters

---

### 5.2 Schema Freeze & Ratification

- Sovereign schemas are hashed
- Hash stored in repo or ledger
- CI fails on unauthorized change

---

### 5.3 Error Semantics Classification

```ts
type ErrorClass =
  | 'USER_INPUT'
  | 'BUSINESS_RULE'
  | 'SECURITY_VIOLATION'
  | 'GOVERNANCE_BREACH'
```

---

## 6. KPIs (Corrected)

Replace feature utilization metrics with:

- % of boundaries validated
- % of business invariants encoded
- % of manual validation eliminated
- % of consumers reading only from Manifest

---

## 7. Execution Order (Locked)

1. Sovereign layer (audit, RBAC, encryption)
2. Registry layer (metadata, stencils, configs)
3. Boundary layer (adapters, API, cache)
4. Experience layer (UI, customization)

---

## 8. Final Position

This plan elevates Zod from a validation tool to a **constitutional enforcement mechanism**.

With Metadata → Manifest → Living Schema → Enforcement,
Cobalt → Quarum separation,
and Adapter-driven morphology,

…the system becomes **auditable, adaptable, and semantically durable**.

