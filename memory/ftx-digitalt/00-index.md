# FTX Digital Memory Index

This folder is the canonical long-term memory for the Shelly-based digital control system for the FTX aggregate.

## Current runtime architecture

- `installer` is permanent script id 1 and is manually maintained.
- `master` is the only long-lived runtime script.
- `poll`, `state`, `weather`, `brain` and later `driver` are one-shot scripts.
- One-shot scripts self-stop after completion.
- Logging is print-only. Virtual text components are not used for runtime logs.
- Installer state is stored in `text:200`, not KVS.

## Read before code changes

1. `03-runtime-model.md`
2. `04-installer-bootstrap.md`
3. `05-script-contracts.md`
4. `06-kvs-and-components.md`
5. `10-coding-standards.md`

## Current package roles

- `installer`: bootstrap and deployment installer, fixed at script id 1.
- `master`: 60-second scheduler/orchestrator.
- `poll`: reads devices and writes telemetry KVS.
- `state`: derives run state and selected UI numbers.
- `weather`: fetches weather and writes weather KVS.
- `brain`: computes control intent using signal-bus structure.
- `driver`: not yet rebuilt in the new architecture.

## Current key design direction

The system should minimize concurrency and heap pressure by using short one-shot scripts and a single long-lived master. Installer builds one package per run and master starts installer repeatedly until the device is complete.