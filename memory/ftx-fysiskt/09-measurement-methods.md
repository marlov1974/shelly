# Measurement Methods

## General principle

Physical measurements should be documented with enough context to be comparable later. Always note:

- date/time
- fan command percentages
- filter condition
- damper state
- VVX on/off state
- outdoor temperature
- house/extract temperature
- measured pressure points
- sensor placement
- whether measurement is nozzle/stos, fan-side pressure or runtime telemetry

## Stos/nozzle measurements

Canonical locked reference points:

```text
85 V  -> ΔP = 20 Pa,  Q ≈ 110 l/s
150 V -> ΔP = 120 Pa, Q ≈ 240 l/s
```

These are flow-proxy points and are treated as equivalent regardless of house/valves/filters for future calibration reconstruction.

## Fan-side pressure measurements

Canonical locked fan-side points:

```text
85 V  -> ΔP_fan ≈ 90 Pa
150 V -> ΔP_fan ≈ 380 Pa
```

Flow from these fan-side points is considered invalid unless a specific reconstruction method is explicitly defined.

## Runtime telemetry method

Runtime telemetry reads pressure, RPM and flow values from the Shelly sensor network and stores them in `ftx.tel.m`.

Use telemetry for trend and control. Use physical measurement for calibration and validation.

## Temperature measurements

Temperature readings must always be interpreted in relation to sensor location and insulation. Water/pipe sensors are especially sensitive to air influence if not insulated.

## Before/after comparisons

For filter changes, fan changes and duct adjustments, compare only under reasonably similar conditions. Prefer same command levels and similar environmental temperatures.