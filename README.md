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
edge telemetry publishers -> state -> brain -> local device executors
```

Weather runs periodically.

Mac deploy and reboot are takeover flows.

---

# Runtime Ownership

## edge telemetry publishers

Each physical Shelly device samples its own local telemetry once per minute and
publishes a per-device KVS key to the VVX runtime host when any value crosses
its configured delta threshold.

## state

Reads per-device telemetry from VVX KVS, builds derived runtime state and
performance metrics, and writes compatibility aggregate telemetry.

## brain

Builds desired control intent. During the Gen1-to-G2 migration, brain writes
per-device intent keys only.

Brain must not directly control actuators.

## local device executors

Each physical actuator device runs a one-shot executor. Supply, heat, cool and
dampers also run a local master. Extract uses the existing house-air watchdog as
its scheduler, and VVX uses central `master_v1_7_0`, because Shelly allows only
three running scripts per device. Each executor reads its own
`ftx.intent.dev.*` key from VVX KVS and applies only that device's output if the
desired state differs from current state.

The old central driver and aggregate `ftx.intent.act` compatibility path are
retired.

Executor-health KVS keys are intentionally not added in this phase because
Shelly KVS has a 50-key limit. Verification uses existing intent keys, live
output status, `ftx.tel.act` and script status.

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
