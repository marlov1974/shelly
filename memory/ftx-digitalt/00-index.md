# FTX Digital Memory Index

This folder is the canonical repo-based long-term memory for the current Gen1 Shelly-based digital control system for the FTX aggregate.

Current code, device manifests, recipes and Mac deploy tooling in `main` are the source of truth for Gen1 runtime behavior.

New G2 Smart Home architecture and implementation now belongs in:

```text
marlov1974/smart-home
```

Historical or proof-of-concept G2-related notes in this repository are retained only as migration/source material unless explicitly referenced by a current G1 maintenance task.

## Generation boundary

```text
Gen1 = current running Shelly/FTX runtime maintenance in this repo
Gen2 = future Smart Home architecture and package workflow in marlov1974/smart-home
```

Gen1 is the currently running FTX runtime and is documented here:

```text
memory/ftx-digitalt/13-gen1-runtime-maintenance.md
```

Do not add new G2 whole-house design here. Add it to `marlov1974/smart-home`.

## Primary runtime device

Primary active runtime host:

- `rt/devices/8813bfd99f54.json`

This device runs the canonical Gen1 FTX runtime:

- Mac-side direct deploy
- boot
- master
- edge telemetry publishers
- state
- weather
- brain
- local device executors
- reboot

## Gen2 POC runtime warning

There is currently another active runtime device in this repository:

- `rt/devices/80f3dac8bfec.json`

That runtime is a proof-of-concept track for dampers / heat-pump / spot-price / optimizer work.

It:

- uses `hp.*` KVS keys
- has separate architecture
- uses separate recipes/chunks under `rt/recipes/dampers/`
- uses runtime folders such as `rt/spotprice-dampers/`, `rt/weather-dampers/`, `rt/prep-dampers/`, `rt/optimize-dampers/` and `rt/scripts/dampers/`
- is NOT part of the primary Gen1 FTX runtime pipeline
- may inform G2 migration, but must not be treated as final G2 architecture

Do not assume all runtime code in `rt/` belongs to the same architecture.

## Current runtime architecture

Canonical fixed script ids:

```text
2 boot
3 master
4 retired central poll slot; unused on live VVX
5 state
6 weather
7 brain
8 reboot
edge local masters/executors on physical actuator devices
```

Current roles:

- `boot`: only autostart script, script id 2. It waits for stabilization, starts master and self-stops.
- `master`: long-lived 15-second score dispatcher, script id 3.
- Edge telemetry publishers: long-running scripts on physical devices that publish `ftx.tel.dev.*` to dampers-hub KVS.
- `poll`: retired legacy one-shot telemetry reader formerly on script id 4. It is not in the active manifest and is not scheduled by master. Live VVX slot 4 is intentionally unused after cleanup.
- `state`: one-shot derived state/performance script, script id 5.
- `weather`: one-shot weather fetcher, script id 6.
- `brain`: one-shot decision/control script, script id 7.
- `driver`: retired central actuator application path formerly on script id 8 on the old VVX hub.
- Local device masters/executors: physical-device scripts that read per-device intent from local KVS and apply only local outputs.
- `reboot`: one-shot reboot orchestrator, script id 8.

Worker scripts are one-shot and should self-stop after completion. Runtime logging is print-only via `log()`/`print()`. Virtual text components are not used for runtime logs. Deploy state is stored in persistent `text:200`, not KVS.

## Recommended read order for Gen1 work

1. `00-index.md`
2. `00-file-map.md`
3. `03-runtime-model.md`
4. `04-installer-bootstrap.md`
5. `05-script-contracts.md`
6. `06-kvs-and-components.md`
7. `07-control-logic.md`
8. `08-telemetry-model.md`
9. `10-coding-standards.md`
10. `13-gen1-runtime-maintenance.md`
11. Relevant recipes in `rt/recipes/`
12. Relevant runtime chunks in `rt/**/`

## Current key design direction

The system minimizes concurrency and heap pressure by using one long-lived low-heap master dispatcher and short one-shot workers on the dampers hub. Physical devices use small local masters with prime-based schedules to start local publishers and one-shot executors without synchronized request storms. Mac/Codex installs code directly through bounded Shelly RPC uploads.

## Primary current files

- Device manifest: `rt/devices/8813bfd99f54.json`
- Mac direct deploy tool: `tools/g1_vvx_deploy.py`
- Recipes: `rt/recipes/*.json`
- Runtime chunks: `rt/common/`, `rt/boot/`, `rt/master/`, `rt/state/`, `rt/weather/`, `rt/brain/`, `rt/reboot/`
- Edge publisher sources: `rt/scripts/supply-fan/`, `rt/scripts/extract-fan/`, `rt/scripts/heat-dimmer/`, `rt/scripts/cool-dimmer/`, `rt/scripts/dampers/`, `rt/scripts/vvx/`
- Gen1 maintenance boundary: `memory/ftx-digitalt/13-gen1-runtime-maintenance.md`
- Gen2 source of truth: `marlov1974/smart-home`
