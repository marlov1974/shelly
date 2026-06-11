# Project Memory Index

This repository is the canonical long-term memory for the Gen1 Shelly/FTX runtime.

G2 Smart Home development now lives in:

```text
marlov1974/smart-home
```

Use this repository for current running Shelly runtime behavior and G1 maintenance. Use `smart-home` for new whole-house G2 architecture, requirements, package workflow and future Mac/Home Assistant/Shelly implementation.

---

# AI Bootstrap

A new AI session working on this repository should begin with:

1. `README.md`
2. `memory/bootstrap-manifest.json`
3. every file in the manifest `read_order`, in order

If the task crosses into G2, also bootstrap `marlov1974/smart-home`.

---

# Runtime Truth Hierarchy

Trust order for understanding actual Gen1 runtime behavior:

1. Runtime scripts/chunks
2. Recipes
3. Device manifests
4. Memory files
5. Historical discussion

Memory files describe intended architecture.

Runtime files describe actual implementation.

When they differ:

- implementation is normally newer
- memory should later be updated

---

# Active Runtime Devices

## Primary FTX runtime

- `rt/devices/8813bfdaa0c0.json`

Responsibilities:

- FTX runtime orchestration
- ventilation logic
- thermal control coordination
- VVX control
- actuator sequencing
- telemetry aggregation

Namespace:

- `ftx.*`

## Optimizer / dampers POC runtime

- `rt/devices/80f3dac8bfec.json`

Separate optimizer/control proof-of-concept architecture.

Namespace:

- `hp.*`

Important:

Do not assume the two runtimes share:

- contracts
- ownership
- KVS structure
- sequencing
- deployment model

The optimizer/dampers runtime may inform G2, but new G2 design and implementation belongs in `marlov1974/smart-home`.

---

# Domain Structure

## ftx-digitalt/

Primary Gen1 digital runtime architecture.

Contains:

- Mac-side direct deploy
- dispatcher runtime
- KVS contracts
- recipes
- runtime ownership
- deployment model
- coding standards

## optimizer-dampers/

Existing heat-pump and damper optimization proof-of-concept runtime.

## ftx-fysiskt/

Physical airflow and ventilation engineering used by current Gen1 and as source material for G2 migration.

## house-control/

Legacy/pre-split whole-house and heat-pump notes retained as source material. New G2 whole-house architecture belongs in `marlov1974/smart-home`.

## components/

Reusable Shelly and hardware references.

---

# Runtime Architecture Summary

The primary Gen1 FTX runtime uses:

- one long-lived dispatcher (`master`)
- multiple one-shot workers
- deterministic sequencing
- KVS state propagation
- explicit ownership boundaries

Normal runtime cycle:

```text
edge telemetry publishers -> state -> brain -> local device executors
```

Weather is periodic.

Mac deploy and reboot are takeover flows.

---

# Ownership Model

## poll

Owns physical telemetry reads.

## state

Owns derived runtime state.

## brain

Owns desired control logic.

Brain must not directly control hardware.

## local device executors

Own physical actuator application for their own devices.

Local executors are the only current apply layer.

---

# Architectural Invariants

The repository strongly prefers:

- deterministic systems
- explicit contracts
- fixed ids
- inspectable runtime behavior
- bounded ownership
- versioned runtime units
- low hidden state

Avoid:

- implicit coupling
- mixed ownership
- hidden runtime magic
- uncontrolled dynamic behavior
- direct actuator writes outside local executors

---

# Governance Rule

GitHub repository memory is primary for Gen1 runtime maintenance.

ChatGPT memory is secondary and potentially incomplete.

G2 decisions should be recorded in `marlov1974/smart-home`, not duplicated here unless needed for a Gen1 boundary note.
