# Pressure Sensors

## FTX pressure role

Pressure sensors are used to estimate airflow and system balance.

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

## House pressure balance

A future indoor/outdoor differential pressure sensor could be used to trim supply as a function of extract to maintain neutral pressure. Expected pressures are small, so sensor range and stability matter.