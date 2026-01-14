# Cursor Rules Guideline (Global + Delta Pattern)

Source: [Cursor Rules documentation](https://cursor.com/docs/context/rules) – project rules in `.cursor/rules`, `.mdc` frontmatter with `description`, `globs`, `alwaysApply`, and scoped, focused rules per idea.

---

## 1) Purpose

- Keep Cursor behavior **predictable and consistent** across the monorepo (Next.js, Express, Vite, Remix, Hono, kitchen sink).
- Follow Cursor’s best practice: **one canonical rule per idea**, everything else is **additive + scoped by `globs`**, no copy‑pasted content.
- Make this file the **single reference** for humans and machines when authoring `.cursor/rules/*.mdc`.

---

## 2) Rule Types We Use

- **Project Rules (`.cursor/rules/*.mdc` / `.md`)**  
  - Stored in `.cursor/rules`, version‑controlled, scoped by `globs` and/or `alwaysApply`.  
  - Based on Cursor docs: Project Rules sit alongside User/Team rules but are **project‑specific**.

- **AGENTS.md (optional)**  
  - Plain Markdown instructions (no frontmatter metadata) that apply in the directory where they live and below (nested behavior per docs).  
  - If used, must **not duplicate** `.cursor/rules` content; instead, reference canonical rules.

We do **not** document Team/User rules here; this file is strictly for project rules in this repo.

---

## 3) Architecture: Global + Delta Only

### 3.1 Global Constitution (Always Apply)

- Exactly **one** global shared rule file:
  - `.cursor/rules/00-global.always.mdc`
- Contains all shared doctrine:
  - DRY/KISS
  - monorepo boundaries (apps vs packages)
  - StratonHub/registry doctrine
  - Global eradication + duplication bans
- Any instruction that is needed in multiple places **must** live here.

### 3.2 Delta‑Only Rules

All other rules:

- MUST be **delta‑only** (additions on top of the global rule).
- MUST be scoped using `globs` to specific apps/packages.
- MUST NOT restate content from `00-global.always.mdc` or from other rules.

Required intro line in every non‑global rule:

> Applies on top of `00-global.always.mdc`. Do NOT restate global rules. Only add deltas for this scope.

---

## 4) Naming & Scoping Conventions

### 4.1 File Naming

- Delta rule naming pattern:
  - `{domain}.{topic}.delta.mdc`
- Examples:
  - `stratonhub.docs.delta.mdc`
  - `stratonhub.registry.delta.mdc`
  - `stratonhub.ui.diataxis.delta.mdc`

Avoid:

- `general.mdc`
- `misc.mdc`
- `rules2.mdc`

### 4.2 `globs` Discipline

- `globs` must be as tight as possible to avoid accidental cross‑app bleed.
- Good examples:
  - `apps/web-next/**/*.{ts,tsx,md,mdx}`
  - `apps/api-express/**/*.{ts,js}`
  - `packages/stratonhub/**/*.{md,mdx}`
- Bad:
  - `**/*`

---

## 5) Duplication Ban & Enforcement

- If the same instruction appears in 2+ rule files:
  - Delete duplicates.
  - Keep the canonical version only in `00-global.always.mdc`.
- Technical enforcement:
  - `jscpd` is configured to scan `.cursor/rules/**/*.{mdc,md}` and **hard‑fail CI** when duplication exceeds the configured thresholds.
  - On failure, resolve by **merging shared text into the global rule**, keeping delta rules minimal.

---

## 6) Canonical Templates (for Humans and Machines)

These templates are the **only shapes** new rules should follow. Tools and humans can copy/fill them without changing the structure.

### 6.1 Global Rule Template (`00-*.always.mdc`)

```md
---
description: "<short description of global rule purpose>"
alwaysApply: true
---

# <Global Rule Title> (Always Apply)

## Prime Directives
- <high‑level, non‑negotiable behaviors>

## Repo Discipline
- <shared architecture / boundaries>

## Quality Gates
- <high‑level checks that apply everywhere>
```

### 6.2 Delta Rule Template (`{domain}.{topic}.delta.mdc`)

```md
---
description: "<what this rule adds on top of global>"
globs:
  - "<scoped/path/patterns/**/*.{ts,tsx,md,mdx}>"
alwaysApply: false
---

> Applies on top of `00-global.always.mdc`. Do NOT restate global rules. Only add deltas for this scope.

## Purpose
- <what problem this delta rule solves>

## Rules
- <concrete, scoped instructions for this domain/topic>
```

---

## 7) How This Aligns With Cursor Docs

- **Project Rules in `.cursor/rules`**: We store rules as `.mdc`/`.md` files with frontmatter, as described in the [Rules](https://cursor.com/docs/context/rules) docs.
- **Frontmatter (`description`, `globs`, `alwaysApply`)**: We use these fields exactly as documented to control when rules apply and to keep them focused and scannable.
- **Scoped, focused rules**: We follow Cursor’s guidance to keep rules under control, avoid copying large style guides, and scope rules to relevant files via `globs` instead of global catch‑alls.
- **No duplication**: We rely on a single global rule plus delta‑only rules and a duplication detector, matching Cursor’s recommendation to avoid copying large blocks and to reference canonical sources.
