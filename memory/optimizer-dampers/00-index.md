# Optimizer Dampers — Index

## Purpose

This folder documents the separate dampers / heat-pump optimizer runtime.

This runtime is NOT the same as the primary FTX runtime.

It is a parallel optimization/control track using:

- Tibber spot prices
- Open-Meteo weather
- thermal battery / SOC model
- compact KVS payloads
- heat-pump optimization logic

## Primary runtime device

Primary active runtime host:

- `rt/devices/80f3dac8bfec.json`

## Runtime structure

Current runtime scripts:

```text
2 boot
3 master
4 spot
5 weather
6 op/prep
7 optimize
```

## KVS namespace

Uses `hp.*` keys.

This must not be mixed with:

- `ftx.*`
- `ftx.tel.*`
- `ftx.intent.*`

except where explicitly documented.

## Relationship to primary FTX runtime

This runtime currently depends on the primary FTX runtime for house telemetry.

It remotely reads:

- `ftx.tel.m`

from the VVX runtime host.

## Recommended read order

1. `01-runtime-model.md`
2. `02-kvs-contracts.md`
3. `03-price-weather-model.md`
4. `04-heat-pump-library.md`
