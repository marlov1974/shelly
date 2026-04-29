# Baseline Measurements

This file preserves small but important measurement baselines so that future hardware changes can be compared against known states.

## Historical maximum capacity before current modifications

Historical maximum airflow with old fans, clean filters and open terminals:

```text
approximately 300 l/s
```

Current practical maximum after modifications:

```text
approximately 250 l/s
```

## Extract baseline with supply off

Baseline measurements with supply fan off and extract fan active.

### Strangled system / bathroom terminals closed

```text
B1: 85 V, stoss measurement
    DeltaP = 10 Pa
    Q approx 90 l/s

B2: 150 V, stoss measurement
    DeltaP = 105 Pa
    Q approx 230 l/s

B3: 85 V, measured across fan sides
    DeltaP_fan = 70 Pa
    Q invalid / not directly comparable

B4: 150 V, measured across fan sides
    DeltaP_fan = 340 Pa
    Q invalid / not directly comparable
```

### Open system

```text
B5: 85 V, stoss measurement
    DeltaP = 10 Pa
    Q approx 90 l/s

B6: 150 V, stoss measurement
    DeltaP = 105 Pa
    Q approx 230 l/s

B7: 85 V, measured across fan sides
    DeltaP_fan = 70 Pa
    Q invalid / not directly comparable

B8: 150 V, measured across fan sides
    DeltaP_fan = 340 Pa
    Q invalid / not directly comparable
```

## Interpretation

Stoss measurements and across-fan measurements are different measurement types. Across-fan pressure is useful for fan/system diagnostics but should not be used as direct airflow baseline unless a separate validated conversion exists.

## Current Pa-to-l/s calibration

```text
K_SUPPLY_FAN = 11.6
K_EXTRACT_FAN = 12.1
lps = K * sqrt(Pa)
```

## Supply/extract balance calibration

Earlier empirical supply mapping:

```text
supply_pct = 1.0333 * extract_pct - 3.667
```

Current documented simplified rule:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

The current rule should be used for normal operation unless recalibrated.

## Pump/water measurement note

When measuring hydronic flow/temperature, readings can be distorted by display resolution and sensor exposure to surrounding air. Water/flow baselines should state:

- pump mode/head
- displayed flow
- electric power
- whether the temperature sensor is insulated from air
- supply/return temperature point

## Future baseline format

Use this structure for every important measurement series:

```text
Date:
Hardware state:
Filter state:
Damper state:
VVX state:
Fan command:
RPM:
Pa:
Estimated l/s:
Temperatures:
CO2/VOC/RH:
Notes:
```