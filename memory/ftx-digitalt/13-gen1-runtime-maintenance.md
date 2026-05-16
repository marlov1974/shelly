# Gen1 FTX Runtime Maintenance

## Purpose

This document separates the currently running FTX runtime generation from the upcoming Gen2 smart-home needs architecture.

Gen1 is the active production FTX runtime and must be kept alive, stable and understandable until the planned Gen2 transition at the end of May.

## Scope

Gen1 covers the current Shelly-based FTX runtime on the primary runtime host:

```text
rt/devices/8813bfdaa0c0.json
```

Canonical runtime flow:

```text
poll -> state -> weather/brain -> driver
```

The current runtime is script/recipe based and uses KVS to propagate state between one-shot workers.

## Shared FTX hardware truth

The physical FTX aggregate is not generation-specific.

Hardware documentation under `memory/ftx-fysiskt/` describes the physical system shared by both Gen1 and Gen2:

```text
- fans and airflow model
- VVX rotor
- heat battery
- cooling battery and condensate handling
- temperature and humidity sensor placement
- pressure / airflow measurement assumptions
- baseline physical measurements
```

Gen1 and Gen2 differ in control architecture, not in which physical FTX components exist. When discussing physical components, sensor placement, measured battery behavior or airflow calibration, use `memory/ftx-fysiskt/` as the shared hardware source for both generations.

## Current Gen1 character

Gen1 is not a needs-resolver architecture.

It currently consists of:

- `poll`: reads physical telemetry and actuator states.
- `state`: derives runtime/performance values and writes virtual components.
- `weather`: fetches weather values used by brain.
- `brain`: computes current desired FTX intent.
- `driver`: applies actuator commands.

The active implementation is always defined by runtime chunks, recipes and the device manifest. Memory files are secondary documentation.

## Maintenance rule

Gen1 changes should be limited to:

```text
- bug fixes
- stability fixes
- small calibration changes
- critical sensor/fallback corrections
- keeping the system safe and operational
```

Gen1 should not receive:

```text
- the Gen2 needs resolver
- whole-house cost optimization
- heat-pump/floor/VVC/VVB orchestration
- broad architectural rewrites
- experimental multi-system planning logic
```

Those belong to Gen2 documentation and later Gen2 implementation.

## Known Gen1 design constraints

Shelly runtime constraints:

```text
- low heap margin
- avoid arrays where possible
- avoid deep object trees
- keep callback chains short
- keep RPC/HTTP concurrency very low
- prefer deterministic one-shot workers
```

Gen1 code should remain simple and direct.

## Current Gen1 drift history

Recent Gen1 work included:

```text
- state_v1_6_3 writing Base power on number:201
- weather_v1_1_0 adding daily average outdoor temperature
- brain_v2_7.x thermal/fan/failsafe experiments
- supply ramping and supply-primary failsafe adjustments
```

These are Gen1 runtime maintenance/debugging changes, not Gen2 architecture.

## Gen1 operating philosophy

FTX Gen1 should remain a practical runtime controller:

```text
- maintain air exchange
- avoid obviously wrong heat/cool behavior
- avoid excessive fan operation
- keep target-to-house and heat/cool behavior understandable
- let bugs show as observable behavior rather than hiding them with broad defensive code
```

Do not introduce large generic safety wrappers or broad defensive normalizers unless a concrete Gen1 operational bug requires them.

## Boundary to Gen2

The following concepts are Gen2 and should not be mixed into Gen1 without an explicit migration decision:

```text
- Purge vs Anti Stale split
- Anti Damp / Dryness Policy as separate needs
- cost/spot-price optimizer as a global modulator
- VP L0-L5 coordination
- floor heating/cooling coordination
- VVB/VVC orchestration
- separate per-need hard/wish signals
- final whole-house resolver
```

If Gen1 needs a short-term patch inspired by Gen2, document it as a Gen1 compatibility patch and keep it local.
