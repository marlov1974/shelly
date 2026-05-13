# shelly

Shelly script repository for Smart Home runtime systems.

---

# Mandatory AI Bootstrap

This repository is the primary source of truth for the Smart Home runtime systems.

For every new AI/chat session:

1. Read this `README.md` first.
2. Read `memory/bootstrap-manifest.json`.
3. Read every file listed in `memory/bootstrap-manifest.json` `read_order`, in order.
4. Do not answer, greet, ask clarifying questions, provide advice, or produce any other user-facing response before all mandatory bootstrap files have been read.
5. If any mandatory bootstrap step or file read fails, stop and report:

```text
BOOTSTRAP FAILED
```

Include the missing step or file path and the reason.

Do not continue with partial bootstrap context.

Runtime truth hierarchy:

1. runtime scripts/chunks
2. recipes
3. device manifests
4. memory files
5. historical discussion

After bootstrap, claims about actual runtime behavior must be grounded in the relevant implementation files. If a user asks about an area outside the bootstrap manifest, read the relevant repo files before making claims.

---

# Repository Contents

The repository contains:

- runtime scripts for Shelly devices
- deployment/install logic
- architectural memory
- runtime contracts
- physical FTX inventory and measurement memory
- Home Assistant / FTX orchestration logic

---

# Canonical Long-Term Memory

Long-term project memory is stored directly in the repository.

Primary memory entry points:

- `memory/bootstrap-manifest.json`
- `memory/00-index.md`
- `memory/02-chatgpt-bootstrap.md`
- `memory/ftx-digitalt/00-index.md`
- `memory/ftx-fysiskt/00-index.md`

These files explain:

- architecture
- ownership
- runtime model
- KVS contracts
- coding standards
- current system structure
- physical hardware inventory

---

# Important Principle

Memory files describe intended architecture.

Actual runtime scripts and manifests describe the current implementation.

When they differ:

- runtime implementation is normally more current
- memory files should later be updated to match

---

# Current Primary Runtime

Current primary FTX runtime device:

- `rt/devices/8813bfdaa0c0.json`

The device manifest defines:

- active runtime versions
- fixed script ids
- startup ownership
- recipe bindings
- deployment state

---

# Runtime Model

The runtime uses:

- one long-lived dispatcher (`master`)
- multiple one-shot workers
- KVS-based runtime propagation
- deterministic sequencing
- explicit ownership boundaries

Normal runtime flow:

```text
poll -> state -> brain -> driver
```

Weather runs periodically.

Installer and reboot are takeover flows.

---

# Runtime Ownership

## poll

Reads physical telemetry and actuator states.

## state

Builds derived runtime state and performance metrics.

## brain

Builds desired control intent.

Brain must not directly control actuators.

## driver

Applies physical actuator outputs.

Driver is the only physical apply layer.

---

# Coding Style

The repository strongly prefers:

- deterministic systems
- explicit contracts
- versioned runtime units
- bounded ownership
- inspectable runtime behavior
- low heap pressure

Avoid:

- implicit coupling
- hidden state
- runtime magic
- mixed ownership
- unnecessary dynamic discovery
