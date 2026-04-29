# Pressure Sensors

## FTX pressure role

Pressure sensors are used to estimate airflow and system balance.

## Known installation role

- Supply-side 0-10 V pressure signal to `ftx-supply-uni`.
- Extract-side 0-10 V pressure signal to `ftx-extract-uni`.
- The runtime converts voltage to Pa and then Pa to l/s.

## Pa to l/s model

Current practical relation:

```text
lps = K * sqrt(Pa)
```

Known calibration constants:

```text
K_SUPPLY_FAN = 11.6
K_EXTRACT_FAN = 12.1
```

These constants are empirical operating values, not universal physics.

## Voltage-to-pressure principle

The exact voltage-to-Pa conversion should be kept as a code constant in poll/runtime logic, not KVS-backed configuration.

## House pressure balance

A future indoor/outdoor differential pressure sensor could be used to trim supply as a function of extract to maintain neutral pressure. Expected pressures are small, so sensor range and stability matter.

## Open detail

Add when known:

```text
Manufacturer:
Model:
Pressure range:
Output range:
Supply voltage:
Which UNI input:
Tube/measurement point:
```