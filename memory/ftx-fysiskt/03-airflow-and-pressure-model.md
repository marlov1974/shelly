# Airflow and Pressure Model

## Measurement philosophy

The airflow model is empirical. Values should be treated as practical control/commissioning references, not as laboratory-grade flow certification.

## Canonical locked baseline points

All nozzle/stos measurements are treated as equivalent regardless of house, valves and filters.

Stos flow proxy:

```text
85 V  -> ΔP = 20 Pa,  Q ≈ 110 l/s
150 V -> ΔP = 120 Pa, Q ≈ 240 l/s
```

Fan-side pressure across fan:

```text
85 V  -> ΔP_fan ≈ 90 Pa   (flow value invalid)
150 V -> ΔP_fan ≈ 380 Pa  (flow value invalid)
```

These four points are locked as reference for recreating flow method without the nozzle.

## Runtime flow calculation

Current digital telemetry stores:

```text
ftx.tel.m.pa.sup
ftx.tel.m.pa.ext
ftx.tel.m.ls.sup
ftx.tel.m.ls.ext
```

Known K-values used in the digital model:

```text
K_SUPPLY_FAN  = 11.6
K_EXTRACT_FAN = 12.1
```

Conceptual relation:

```text
l/s ≈ K * sqrt(Pa)
```

## Caution

Fan-side pressure and nozzle/stos flow are not interchangeable without calibration. Do not infer true flow from fan-side pressure unless the current calibration method explicitly supports it.

## Pressure balance idea

A future option is to measure pressure difference between indoor and outdoor to tune supply as a function of extract for neutral pressure. Expected pressure differences are likely small and require a suitable low-range differential pressure sensor.