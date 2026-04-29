# Project Memory Index

This folder is the canonical long-term memory for the FTX and house-control work. It is intended to be read by ChatGPT or another AI before making design or code changes.

## Scope

- `ftx-digitalt/` is authoritative for Shelly runtime, installer, scripts, KVS, virtual components, GitHub deployment and coding standards.
- `ftx-fysiskt/` is authoritative for the physical ventilation unit, airflow, pressure, VVX rotor, filters, temperature measurement, condensate risk and commissioning.
- `house-control/` is authoritative for heat pumps, brine loop, floor heating/cooling, pumps, valves and whole-house thermal control.
- `components/` is reusable technical reference for Shelly devices, networking, sensors and actuators.

## Read order for FTX Digital code changes

Before changing runtime code, read:

1. `ftx-digitalt/00-index.md`
2. `ftx-digitalt/03-runtime-model.md`
3. `ftx-digitalt/04-installer-bootstrap.md`
4. `ftx-digitalt/05-script-contracts.md`
5. `ftx-digitalt/06-kvs-and-components.md`
6. `ftx-digitalt/10-coding-standards.md`

## Read order for physical FTX reasoning

Before reasoning about airflow, temperature, pressure, VVX or commissioning, read:

1. `ftx-fysiskt/00-index.md`
2. `ftx-fysiskt/01-system-overview.md`
3. `ftx-fysiskt/03-airflow-and-pressure-model.md`
4. `ftx-fysiskt/04-fans-and-flow-calibration.md`
5. `ftx-fysiskt/09-measurement-methods.md`

## Governance rule

GitHub memory is the primary project memory. ChatGPT memory is secondary and may be incomplete. When code and memory disagree, code describes the implemented behavior, but the memory should be updated to explain the intended design.