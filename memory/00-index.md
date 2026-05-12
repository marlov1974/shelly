# Project Memory Index

This folder is the canonical long-term memory for the FTX and house-control work. It is intended to be read by ChatGPT or another AI before making design or code changes.

## AI start here

For a fresh AI/project session, read these first:

1. `memory/00-index.md`
2. `memory/01-current-state.md`
3. `memory/ftx-digitalt/00-index.md`
4. `memory/ftx-digitalt/00-file-map.md`

Then continue into the relevant domain-specific folder.

## Current active runtime devices

There are currently two active device manifests in `rt/devices/`.

- `rt/devices/8813bfdaa0c0.json` — VVX device; primary FTX runtime host.
- `rt/devices/80f3dac8bfec.json` — dampers / heat-pump optimizer runtime; separate optimizer/control track.

Do not assume the two devices use the same architecture or KVS namespace.

## Scope

- `ftx-digitalt/` is authoritative for the primary Shelly FTX runtime, installer, scripts, KVS, virtual components, GitHub deployment and coding standards.
- `optimizer-dampers/` is authoritative for the separate dampers / heat-pump optimizer runtime using `hp.*` KVS keys.
- `ftx-fysiskt/` is authoritative for the physical ventilation unit, airflow, pressure, VVX rotor, filters, temperature measurement, condensate risk and commissioning.
- `house-control/` is authoritative for heat pumps, brine loop, floor heating/cooling, pumps, valves and whole-house thermal control.
- `components/` is reusable technical reference for Shelly devices, networking, sensors and actuators.

## Read order for FTX Digital code changes

Before changing primary FTX runtime code, read:

1. `ftx-digitalt/00-index.md`
2. `ftx-digitalt/00-file-map.md`
3. `ftx-digitalt/03-runtime-model.md`
4. `ftx-digitalt/04-installer-bootstrap.md`
5. `ftx-digitalt/05-script-contracts.md`
6. `ftx-digitalt/06-kvs-and-components.md`
7. `ftx-digitalt/10-coding-standards.md`

## Read order for optimizer / dampers changes

Before changing dampers / heat-pump optimizer code, read:

1. `optimizer-dampers/00-index.md`
2. `optimizer-dampers/01-runtime-model.md`
3. `optimizer-dampers/02-kvs-contracts.md`
4. `optimizer-dampers/03-price-weather-model.md`
5. `optimizer-dampers/04-heat-pump-library.md`

## Read order for physical FTX reasoning

Before reasoning about airflow, temperature, pressure, VVX or commissioning, read:

1. `ftx-fysiskt/00-index.md`
2. `ftx-fysiskt/01-system-overview.md`
3. `ftx-fysiskt/03-airflow-and-pressure-model.md`
4. `ftx-fysiskt/04-fans-and-flow-calibration.md`
5. `ftx-fysiskt/09-measurement-methods.md`

## Governance rule

GitHub memory is the primary project memory. ChatGPT memory is secondary and may be incomplete. When code and memory disagree, code describes the implemented behavior, but the memory should be updated to explain the intended design.