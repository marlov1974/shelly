# ChatGPT Bootstrap Sequence

## Purpose

This file exists to help a new ChatGPT session quickly rebuild an accurate mental model of the repository.

The repository itself is the canonical long-term memory.

Memory files describe architectural intent and governance.

Runtime scripts and manifests describe the actual live implementation.

If memory files and runtime implementation differ, runtime implementation is considered more current unless explicitly marked otherwise.

---

# 1. Read Order

A new session should normally read files in this order.

## 1. Repository root

- `README.md`

## 2. Global memory

- `memory/00-index.md`
- `memory/01-current-state.md`

## 3. FTX Digital memory

- `memory/ftx-digitalt/00-index.md`
- `memory/ftx-digitalt/00-file-map.md`
- `memory/ftx-digitalt/03-runtime-model.md`
- `memory/ftx-digitalt/05-script-contracts.md`
- `memory/ftx-digitalt/06-kvs-and-components.md`
- `memory/ftx-digitalt/10-coding-standards.md`

## 4. Actual runtime manifest

Read the active runtime manifest before reasoning about runtime behavior.

Current primary runtime:

- `rt/devices/8813bfdaa0c0.json`

Important:

The manifest defines:

- current device version
- actual active script versions
- recipe bindings
- fixed runtime ids
- startup ownership

## 5. Actual recipes and runtime chunks

Read recipes and central runtime chunks before proposing changes.

Core recipes:

- `rt/recipes/boot.json`
- `rt/recipes/master.json`
- `rt/recipes/p.json`
- `rt/recipes/state.json`
- `rt/recipes/weather.json`
- `rt/recipes/brain.json`
- `rt/recipes/driver.json`
- `rt/recipes/reboot.json`

Important runtime chunks:

- `rt/common/script.js`
- `rt/master/*`
- `rt/brain/*`
- `rt/driver/*`
- `rt/poll/*`
- `rt/state/*`

---

# 2. Canonical Runtime Understanding

## Runtime model

The runtime is built around:

- one long-lived dispatcher (`master`)
- multiple one-shot workers
- KVS-based runtime state propagation
- explicit ownership boundaries
- deterministic sequencing

Normal cycle:

```text
poll -> state -> brain -> driver
```

Weather is periodic.

Installer and reboot are takeover flows.

## Ownership model

### poll

Owns:

- physical telemetry reads
- actuator state reads
- normalization into telemetry objects

### state

Owns:

- derived runtime state
- performance calculations
- selected UI metrics

### brain

Owns:

- desired control logic
- feature calculations
- target generation
- final intent generation

Brain writes desired state only.

Brain must not directly control actuators.

### driver

Owns:

- physical actuator application
- sequencing
- normalization
- safety normalization

Driver is the only layer allowed to apply physical outputs.

---

# 3. Architectural Principles

The repository strongly prefers:

- explicit contracts
- deterministic behavior
- versioned runtime units
- fixed ids
- minimal hidden state
- low heap pressure
- inspectable systems
- bounded ownership

Avoid:

- implicit coupling
- hidden side effects
- long callback chains
- mixed ownership
- runtime discovery during normal operation

---

# 4. Runtime Source of Truth

For runtime behavior, trust order is:

1. Runtime scripts/chunks
2. Recipes
3. Device manifests
4. Memory files
5. Historical discussion

The repository is expected to evolve continuously.

Architecture notes may lag implementation.
