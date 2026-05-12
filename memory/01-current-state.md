# Current State

## Purpose

This document is intended to let a fresh AI session quickly recover the current runtime topology, active code paths and architectural split between the different Shelly runtimes.

## Active runtime devices

| Device id | Physical role | Runtime role | Manifest | Status |
|---|---|---|---|---|
| `8813bfdaa0c0` | VVX / FTX runtime host | Primary FTX runtime | `rt/devices/8813bfdaa0c0.json` | Active |
| `80f3dac8bfec` | Dampers / optimizer device | Heat-pump optimizer runtime | `rt/devices/80f3dac8bfec.json` | Active / experimental |

## Important architectural distinction

The two devices do NOT run the same architecture.

### 8813bfdaa0c0 — canonical FTX runtime

This is the primary production-style runtime.

Architecture:

- installer
- boot
- master
- poll
- state
- weather
- brain
- driver
- reboot

Characteristics:

- Uses `ftx.*` KVS namespace.
- Uses installer-generated scripts from recipes/chunks.
- Uses orchestration through `master`.
- Uses telemetry snapshots and intent-based control.
- Uses GitHub as source of truth for runtime assembly.

Primary memory location:

- `memory/ftx-digitalt/`

## 80f3dac8bfec — optimizer / dampers runtime

This is a separate optimization/control track.

Architecture:

- boot
- master
- spot
- weather
- op/prep
- optimize

Characteristics:

- Uses `hp.*` KVS namespace.
- Optimizes heat-pump plans from spot prices and weather.
- Reads telemetry from the primary FTX runtime remotely.
- Uses compact encoded KVS payloads for performance.
- Uses Tibber + Open-Meteo.

Primary memory location:

- `memory/optimizer-dampers/`

## Runtime status assumptions

### Primary FTX runtime

Current primary design assumptions:

- Single master tick orchestration.
- Stateless worker scripts.
- Poll -> State -> Weather -> Brain -> Driver pipeline.
- Driver owns all physical output ordering.
- Intent model is canonical actuator contract.

### Optimizer runtime

Current optimizer assumptions:

- 2h optimization blocks.
- Three daily periods.
- Monotonic greedy optimization.
- Thermal battery / SOC abstraction.
- VVX telemetry reused as house-temperature source.

## Repository governance

GitHub is the canonical long-term project memory.

ChatGPT memory may drift or become partial over time.

When recovering a new AI session:

1. Read memory first.
2. Then verify manifests.
3. Then verify recipe/chunk composition.
4. Then verify runtime code.
5. Then make changes.
