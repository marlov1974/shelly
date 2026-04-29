# Airflow and Pressure Model

## Purpose

This file describes the physical airflow and pressure model for the Karfax TOPIC-12 FTX system.

## Core relation

Airflow is estimated from pressure using an empirical K-factor model:

```text
lps = K * sqrt(Pa)
```

Current practical constants:

```text
K_SUPPLY_FAN = 11.6
K_EXTRACT_FAN = 12.1
```

These are operational calibration constants. They are not universal fan or duct constants.

## Fan balance

Normal control derives supply percentage from extract percentage rather than independently controlling both. Current documented normal rule:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

Earlier empirical rule, now superseded:

```text
supply_pct = 1.0333 * extract_pct - 3.667
```

Explicit overpressure/fireplace modes may override normal balancing.

## Pressure measurement interpretation

Pressure measurements can refer to different physical points and must not be mixed:

- pressure at/over a measurement nipple or stoss
- pressure across a fan
- duct/static pressure
- house indoor/outdoor differential pressure

Only comparable measurement points should be used for calibration.

## Historical capacity reference

Historical maximum airflow with old fans, clean filters and open terminals was about 300 l/s. After modifications, practical maximum is estimated around 250 l/s.

## Baseline extract observations

Earlier extract-side baseline tests with supply off and extract fan active showed roughly:

```text
85 V:  about 10 Pa at stoss, about 90 l/s
150 V: about 105 Pa at stoss, about 230 l/s
```

Measurements across the fan gave higher pressure values but were not directly valid as airflow measurements.

## House pressure idea

A future indoor/outdoor differential pressure sensor could trim supply as a function of extract to maintain neutral house pressure. The expected useful pressure range is small, so sensor stability and zero drift are critical.