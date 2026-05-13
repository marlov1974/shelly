# Project Memory Index

This repository is the canonical long-term memory for the Smart Home platform.

The repository itself is designed to function as:

- architecture memory
- runtime memory
- deployment memory
- governance memory
- AI bootstrap memory

---

# AI Bootstrap

A new ChatGPT or AI session should begin here.

Primary bootstrap sequence:

1. `README.md`
2. `memory/00-index.md`
3. `memory/02-chatgpt-bootstrap.md`
4. `memory/01-current-state.md`
5. `memory/ftx-digitalt/00-index.md`
6. `memory/ftx-digitalt/00-file-map.md`

Then continue into the relevant domain.

---

# Runtime Truth Hierarchy

Trust order for understanding actual runtime behavior:

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

## Optimizer / dampers runtime

- `rt/devices/80f3dac8bfec.json`

Separate optimizer/control architecture.

Namespace:

- `hp.*`

Important:

Do not assume the two runtimes share:

- contracts
- ownership
- KVS structure
- sequencing
- deployment model

---

# Domain Structure

## ftx-digitalt/

Primary digital runtime architecture.

Contains:

- installer
- dispatcher runtime
- KVS contracts
- recipes
- runtime ownership
- deployment model
- coding standards

## optimizer-dampers/

Heat-pump and damper optimization runtime.

## ftx-fysiskt/

Physical airflow and ventilation engineering.

## house-control/

Whole-house thermal and energy control.

## components/

Reusable Shelly and hardware references.

---

# Runtime Architecture Summary

The primary FTX runtime uses:

- one long-lived dispatcher (`master`)
- multiple one-shot workers
- deterministic sequencing
- KVS state propagation
- explicit ownership boundaries

Normal runtime cycle:

```text
poll -> state -> brain -> driver
```

Weather is periodic.

Installer and reboot are takeover flows.

---

# Ownership Model

## poll

Owns physical telemetry reads.

## state

Owns derived runtime state.

## brain

Owns desired control logic.

Brain must not directly control hardware.

## driver

Owns physical actuator application.

Driver is the only apply layer.

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
- direct actuator writes outside driver

---

# Governance Rule

GitHub repository memory is primary.

ChatGPT memory is secondary and potentially incomplete.
