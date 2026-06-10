# Fans and Flow Calibration

## Current control relationship

The current normal-operation control relationship is supply-primary:

```text
extract_pct = round((supply_pct + 1) / 0.9)
```

Equivalent reference relation:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

Supply percentage is selected first because ventilation is part of the house heating/cooling energy model. Extract follows supply during normal automatic operation.

Explicit overpressure modes such as fireplace/kitchen may override normal mapping.

## Earlier empirical relationship

An earlier observed relationship was approximately:

```text
supply_pct = 1.0333 * extract_pct - 3.667
```

This is superseded and should not be used as current control logic.

## Runtime telemetry

Fan telemetry includes:

```text
rpm.sup = 0 intentional placeholder
rpm.ext = 0 intentional placeholder
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
fan.run = 1 iff fan on = 1 and pct > 10 and pressure >= 5 Pa and fan power >= 5 W
```

The current state script derives run booleans from telemetry/actuals.

RPM is intentionally not used for runtime. Sensor Add-on script-based tach counters were live-tested and rejected because fan tach event rates are too fast for stable Shelly script handling; the physical input path may also include filtering/debounce/capacitance that suppresses or distorts pulses. Future RPM requires firmware counter support or a different hardware path.

## Calibration caution

Filter condition, ducting, damper position and physical installation changes can affect flow/pressure results. Treat calibration constants as practical operating calibration, not universal fan laws.
