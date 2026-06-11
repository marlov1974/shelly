# Runtime Source Of Truth

This repository intentionally separates:

- architectural memory
- runtime implementation
- deployment manifests and Mac deploy tooling
- operational state

Understanding the hierarchy is important.

---

# 1. Runtime Truth Order

For actual runtime behavior, trust order is:

1. Runtime chunks/scripts
2. Recipes
3. Device manifests
4. Memory files
5. Historical discussion

---

# 2. Runtime Chunks

Runtime chunks define:

- actual behavior
- actual sequencing
- actual ownership
- actual KVS writes
- actual safety behavior

Examples:

- `rt/brain/*`
- `rt/scripts/*/executor_*.js`
- `rt/master/*`

These files are authoritative for execution semantics.

---

# 3. Recipes

Recipes define:

- chunk composition
- script structure
- runtime packaging
- startup behavior
- component ownership

Recipes are authoritative for:

- runtime assembly
- deployment composition

---

# 4. Device Manifests

Device manifests define:

- active versions
- fixed script ids
- deployment state
- actual runtime bindings

The active runtime manifest should always be read before proposing runtime changes.

---

# 5. Memory Files

Memory files describe:

- intended architecture
- governance
- ownership rationale
- conceptual structure
- design philosophy

Memory files may lag implementation.

---

# 6. Historical Discussion

Historical discussion is lowest trust level.

It may describe:

- abandoned designs
- partial reasoning
- obsolete assumptions
- temporary experiments

Historical discussion should never override runtime implementation.
