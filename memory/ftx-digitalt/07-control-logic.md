# Control Logic

## Current implementation status

This document describes the current implementation in `rt/brain/` on `main`. Future design ideas must be clearly separated from the current implementation.

Brain is a one-shot decision script. It reads commands, telemetry, weather and runtime state, computes independent signals, then resolves them into final intent.

Architecture:

```text
io-*       -> ctx.cmd / ctx.inp / ctx.weather / ctx.forced
feature-* -> ctx.sig
intent     -> ctx.intent
output     -> KVS / virtual components
```

Features should not write final actuator intent. They write signals, candidates and constraints. The intent layer decides what wins.

## Current brain execution flow

Current `rt/brain/main.js` flow:

```text
readCommands
-> readInputs
-> readWeather
-> readForcedMode
-> applyForcedModeTimeout
-> calcTarget
-> calcVentilation
-> calcFailsafe
-> calcThermal
-> calcVvx
-> buildIntent
-> writeTargetToHouse
-> writeIntent
-> selfStop
```

## Modes

Mode command is read from `enum:200`.

Current modes:

- `STD`: normal automatic ventilation/control.
- `BST`: boost mode.
- `FIRE`: fireplace/positive-pressure mode.
- `MAN`: manual/inhibit mode. Brain writes `driver_inhibit=1`, so driver does not apply automatic control.

## Forced mode state

`BST` and `FIRE` are forced modes.

Forced mode runtime state is separate from the command and is stored in:

```text
ftx.mode_forced_state
```

Typical shape:

```json
{"mode":"STD","cycles":0}
```

`applyForcedModeTimeout()` increments a cycle counter when the current command mode is a forced mode. After `FORCED_MODE_MAX_CYCLES`, it writes the command mode back to `STD`, resets the forced state and continues with `STD` behavior.

## Target to house

Brain computes `target_to_house_c`, written to:

```text
number:204 Target to house
```

Current target calculation:

1. Starts from house setpoint from `number:200`.
2. Applies house temperature error correction using current house temperature.
3. Applies night setback during the configured night window when `boolean:201 Nightmode` is active.
4. Applies weather bias during the configured daytime window using `ftx.weather.act`.
5. Calculates house dew point.
6. Applies dewpoint floor by taking max of target and dew point.
7. Calculates:
   - `supply_delta_post_c = target_to_house_c - t_post_vvx_c`
   - `delta_to_house_c = target_to_house_c - t_to_house_c`

## Weather bias

Brain reads `ftx.weather.act` from the weather script.

Inputs:

- `solar_kwh_today`
- `temp_now`

Weather bias shifts target temperature during the configured daytime window. The current implementation reduces target for high solar/warm weather and can increase target during colder weather relative to the neutral point.

## Ventilation

Normal ventilation is driven by the maximum of:

- CO2/VOC-derived extract percentage
- temperature-error-derived extract percentage

Supply is normally derived from extract using the locked normal operation rule:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

Explicit overpressure mode `FIRE` overrides the normal relationship.

Current standard ventilation constants are in `rt/brain/feature-ventilation.js`.

## Full air ready

`full_air_ready` means the air chain is actually running:

```text
full_air_ready = dmp_run && sup_run && ext_run
```

It is a readiness/safety signal used before enabling process tools such as VVX, heating and cooling.

## Current VVX logic

Current code in `rt/brain/feature-vvx.js` is intentionally simple:

```text
vvx_candidate_on = full_air_ready ? 1 : 0
```

Current implementation therefore means:

- VVX candidate is ON when the air chain is ready.
- VVX candidate is OFF when the air chain is not ready.
- Current code does not compare theoretical VVX ON/OFF temperatures.
- Current code does not optimize VVX against `target_to_house_c`.

## Heating and cooling

Current heat/cool demand is based on:

```text
target_to_house_c - post_vvx
```

Implementation details:

- `heat_demand` starts when `target_to_house_c - post_vvx` is above heat on-deadband.
- `cool_demand` starts when `target_to_house_c - post_vvx` is below negative cool on-deadband.
- If already active, smaller off-deadbands are used for hysteresis.
- Heat/cool candidate percentages are based on delta to actual to-house temperature and actual current percentage.
- Heat/cool candidates require `full_air_ready`.
- Driver normalize protects against simultaneous heat and cool by disabling both if both are requested.

## Failsafe and constraints

Failsafe signals include:

- freeze guard based on post-VVX temperature
- wrong-direction ventilation reduction
- cooling ventilation cap

Constraints are applied in the intent layer, not directly in feature calculations.

## Intent resolution

Brain writes a full desired state in `ftx.intent.act`, not a delta.

Output shape:

```json
{
  "driver_inhibit": 0,
  "sup":  { "on": 1, "pct": 0 },
  "ext":  { "on": 1, "pct": 0 },
  "vvx":  { "on": 0 },
  "heat": { "on": 0, "pct": 0 },
  "cool": { "on": 0, "pct": 0 },
  "dmp":  { "on": 1 }
}
```

Priority principles in current intent code:

- OFF wins over everything. If enable is off, base off intent is written.
- MAN sets `driver_inhibit`.
- If enabled, dampers and fans are requested on.
- If dampers are not running, fans start at start percentage.
- Freeze/failsafe can limit fan percentages.
- `BST` overrides fan pct to boost values.
- `FIRE` overrides fan pct to positive-pressure relation.
- VVX, heat and cool are written from candidates.

## Driver responsibility

Brain does not apply actuator RPCs. Driver reads `ftx.intent.act`, normalizes it and applies the desired actuator state.

Driver responsibilities include:

- respecting `driver_inhibit`
- treating `on=0` as dominant over non-zero `pct`
- preventing simultaneous heat and cool
- applying dampers, fans, VVX, heat and cool through RPC

## Future design candidate: VVX optimization

A future design candidate is to estimate theoretical supply temperature with VVX off/on and select the VVX state that brings supply closest to `target_to_house_c`, possibly with bias depending on whether the house generally needs heating or cooling.

This is not current implementation. Current implementation is air-readiness based only.