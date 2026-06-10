# shelly

G1 Shelly runtime repository for the current Smart Home / FTX control system.

This repository remains the source of truth for the currently running Shelly-based Gen1 FTX runtime and related Shelly maintenance code.

G2 Smart Home development now lives in:

```text
marlov1974/smart-home
```

---

# Mandatory AI Bootstrap

For work in this repository:

1. Read this `README.md` first.
2. Read `memory/bootstrap-manifest.json`.
3. Read every file listed in `memory/bootstrap-manifest.json` `read_order`, in order.
4. If a task crosses into G2 design or implementation, also bootstrap `marlov1974/smart-home`.
5. If any mandatory bootstrap step or file read fails, stop and report `BOOTSTRAP FAILED` with the missing path and reason.

Runtime truth hierarchy for G1:

1. runtime scripts/chunks
2. recipes
3. device manifests
4. memory files
5. historical discussion

After bootstrap, claims about actual Gen1 runtime behavior must be grounded in the relevant implementation files.

---

# Repository Boundary

This repository owns:

- current Gen1 Shelly/FTX runtime
- Gen1 deployment/install logic
- Gen1 runtime contracts and KVS behavior
- current Shelly device topology used by Gen1
- physical FTX facts that are still used to maintain Gen1
- Gen2 proof-of-concept Shelly experiments that still physically live here until migrated or retired

This repository does not own new G2 solution design.

G2 owns:

- whole-house needs architecture
- Mac + Home Assistant + Shelly package workflow
- future VP/FTX/floor/VVB/VVC orchestration
- Codex-first package structure
- future G2 deploy artifacts

G2 belongs in `marlov1974/smart-home`.

---

# Current Primary Runtime

Current primary Gen1 FTX runtime device:

```text
rt/devices/8813bfdaa0c0.json
```

The device manifest defines:

- active runtime versions
- fixed script ids
- startup ownership
- recipe bindings
- deployment state

---

# Runtime Model

The Gen1 runtime uses:

- one long-lived dispatcher (`master`)
- multiple one-shot workers
- KVS-based runtime propagation
- deterministic sequencing
- explicit ownership boundaries
- Mac-side direct RPC deploy for code installation

Normal runtime flow:

```text
poll -> state -> brain -> driver
```

Weather runs periodically.

Mac deploy and reboot are takeover flows.

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
