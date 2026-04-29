# Fans and Flow Calibration

## Current control relationship

The current normal-operation supply fan rule is:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

This replaces an earlier relationship and is the current governing normal-drift rule for deriving supply from extract.

Explicit overpressure modes such as fireplace/kitchen may override normal mapping.

## Earlier empirical relationship

An earlier observed relationship was approximately:

```text
supply_pct = 1.0333 * extract_pct - 3.667
```

This is superseded by the current locked rule above.

## Runtime telemetry

Fan telemetry includes:

```text
rpm.sup
rpm.ext
pa.sup
pa.ext
ls.sup
ls.ext
```

Actual actuator telemetry includes:

```text
sup.on / sup.pct / sup.w
ext.on / ext.pct / ext.w
```

## Run thresholds

Canonical digital run semantics saved for fan run status:

```text
fan.run = 1 iff switch = 1 and pct > 10 and rpm > 250
```

The current state script derives run booleans from telemetry/actuals.

## Calibration caution

Filter condition, ducting, damper position and physical installation changes can affect flow/pressure results. Treat calibration constants as practical operating calibration, not universal fan laws.