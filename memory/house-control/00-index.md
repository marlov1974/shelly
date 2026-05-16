# House Control Memory Index

This folder is for heat pumps, brine loop, floor heating/cooling, pumps, valves and future whole-house thermal control.

## Scope

- Mitsubishi heat pumps and their control constraints.
- Brine side and floor side pumping.
- Free cooling through heat exchanger.
- Dew point and condensation safety.
- Integration principles with the FTX Digital control model.
- Gen2 whole-house needs-based architecture.

## Generation boundary

Current FTX runtime maintenance belongs to Gen1 and is documented under:

```text
memory/ftx-digitalt/13-gen1-runtime-maintenance.md
```

Future whole-house needs-based coordination belongs to Gen2 and is documented here:

```text
memory/house-control/03-gen2-needs-architecture.md
```

Gen2 introduces needs-based coordination across:

```text
FTX, VP1/VP2, floor heating, floor cooling, VVB, VVC and spot-price optimization
```

Do not treat Gen2 documents as current runtime behavior until explicitly implemented and activated.

## Key documents

```text
00-index.md
02-heat-pump-operating-schedules.md
03-gen2-needs-architecture.md
```

## Boundary

- Ventilation aggregate facts belong in `../ftx-fysiskt/`.
- Current Shelly FTX runtime and KVS contracts belong in `../ftx-digitalt/`.
- Future whole-house coordination and heat-pump/floor/VVB/VVC integration belong here.
- Reusable pump, valve, sensor and networking facts belong in `../components/`.
