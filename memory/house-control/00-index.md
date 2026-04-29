# House Control Memory Index

This folder is for heat pumps, brine loop, floor heating/cooling, pumps, valves and future whole-house thermal control.

## Scope

- Mitsubishi heat pumps and their control constraints.
- Brine side and floor side pumping.
- Free cooling through heat exchanger.
- Dew point and condensation safety.
- Integration principles with the FTX Digital control model.

## Boundary

- Ventilation aggregate facts belong in `../ftx-fysiskt/`.
- Shelly runtime and KVS contracts belong in `../ftx-digitalt/`.
- Reusable pump, valve, sensor and networking facts belong in `../components/`.
