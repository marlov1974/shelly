# shelly

Shelly script repository for Smart Home runtime systems.

The repository contains:

- runtime scripts for Shelly devices
- deployment/install logic
- architectural memory
- runtime contracts
- Home Assistant / FTX orchestration logic

---

# Canonical Long-Term Memory

Long-term project memory is stored directly in the repository.

Primary memory entry points:

- `memory/00-index.md`
- `memory/02-chatgpt-bootstrap.md`
- `memory/ftx-digitalt/00-index.md`

These files explain:

- architecture
- ownership
- runtime model
- KVS contracts
- coding standards
- current system structure

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
