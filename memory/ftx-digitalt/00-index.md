# FTX Digital Memory Index

This folder is the canonical repo-based long-term memory for the Shelly-based digital control system for the FTX aggregate.

The documentation in this folder must be readable without any external project memory. Current code, device manifests and recipes in `main` are the source of truth. If historical design ideas are preserved, they must be marked as obsolete historical notes or future design candidates.

## Current runtime architecture

Canonical fixed script ids:

```text
1 installer
2 boot
3 master
4 poll
5 state
6 weather
7 brain
8 driver
9 reboot
```

Current roles:

- `installer`: permanent deployment/bootstrap script, script id 1. It is manually maintained and not auto-updated.
- `boot`: only autostart script, script id 2. It waits for stabilization, starts master and self-stops.
- `master`: long-lived 15-second score dispatcher, script id 3.
- `poll`: one-shot telemetry reader, script id 4.
- `state`: one-shot derived state/performance script, script id 5.
- `weather`: one-shot weather fetcher, script id 6.
- `brain`: one-shot decision/control script, script id 7.
- `driver`: one-shot actuator application script, script id 8.
- `reboot`: one-shot reboot orchestrator, script id 9.

Worker scripts are one-shot and should self-stop after completion. Runtime logging is print-only via `log()`/`print()`. Virtual text components are not used for runtime logs. Installer state is stored in persistent `text:200`, not KVS.

## Recommended read order

1. `00-index.md`
2. `00-file-map.md`
3. `03-runtime-model.md`
4. `04-installer-bootstrap.md`
5. `05-script-contracts.md`
6. `06-kvs-and-components.md`
7. `07-control-logic.md`
8. `08-telemetry-model.md`
9. `10-coding-standards.md`
10. Relevant recipes in `rt/recipes/`
11. Relevant runtime chunks in `rt/**/`

## Current key design direction

The system minimizes concurrency and heap pressure by using one long-lived low-heap master dispatcher and short one-shot workers. Master starts exactly one worker per 15-second tick. Installer builds one package per run and master selects installer periodically until the device is complete.

## Primary current files

- Device manifest: `rt/devices/8813bfdaa0c0.json`
- Installer: `rt/installer/installer.js`
- Recipes: `rt/recipes/*.json`
- Runtime chunks: `rt/common/`, `rt/boot/`, `rt/master/`, `rt/poll/`, `rt/state/`, `rt/weather/`, `rt/brain/`, `rt/driver/`, `rt/reboot/`
- Documentation: `memory/ftx-digitalt/`