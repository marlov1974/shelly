# Control Logic

## Brain design principle

Brain is a one-shot decision script. It reads commands, telemetry, weather and runtime state, computes independent signals, then resolves them into final intent.

Architecture:

```text
io-*       -> ctx.cmd / ctx.inp / ctx.weather / ctx.forced
feature-* -> ctx.sig
intent     -> ctx.intent
output     -> KVS / virtual components
```

Features should not write final actuator intent. They write signals, candidates and constraints. The intent layer decides what wins.

## Modes

Mode command is read from `enum:200`.

Current modes:

- `STD`: normal automatic ventilation/control.
- `BST`: boost mode.
- `FIRE`: fireplace/positive-pressure mode.
- `MAN`: manual/inhibit mode; brain may write intent with `driver_inhibit=1` so driver does not apply automatic control.

## Forced mode state

Forced mode command is the mode value (`BST` or `FIRE`).

Forced mode runtime state is separate and stored in `ftx.mode_forced_state`. It tracks timeout/counter state for automatic return to `STD`. It is not the command itself.

## Target to house

Brain computes `target_to_house_c`, written to `number:204`.

Target calculation includes:

- house temperature setpoint from `number:200`
- current house temperature
- night setback when active
- weather bias when active
- dewpoint floor

## Weather bias

Brain reads `ftx.weather.act` from the weather script.

Inputs:

- `solar_kwh_today`
- `temp_now`

Weather bias shifts target temperature during the configured daytime window. The intent is to account for expected solar and outdoor-temperature effect on the house.

## Ventilation

Normal ventilation is driven by the maximum of:

- CO2/VOC-derived extract percentage
- temperature-error-derived extract percentage

Supply is normally derived from extract using the locked normal operation rule:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

Explicit overpressure modes such as `FIRE` may override this relationship.

## Full air ready

`sig.full_air_ready` means the air chain is actually running:

```text
dampers running + supply fan running + extract fan running
```

It is a readiness/safety signal used before enabling process tools such as VVX, heating and cooling.

## VVX

VVX is controlled on/off only. There is no analog or speed control available.

Brain compares theoretical off/on temperatures using an assumed VVX efficiency and selects the state that brings supply temperature closest to target, with bias according to whether the house generally needs heating or cooling.

Relevant signals include:

- `sig.vvx_candidate_on`
- `sig.t_vvx_off_theory_c`
- `sig.t_vvx_on_theory_c`
- `sig.vvx_cost_off`
- `sig.vvx_cost_on`

## Heating and cooling

Brain computes heat/cool demand and candidate percentages from target-vs-post-VVX and target-vs-to-house deltas.

Heating and cooling are constrained by:

- air readiness
- outdoor-temperature allow rules
- demand hysteresis
- current actual valve percentage

Heat/cool outputs are candidates until merged by the intent layer.

## Failsafe and constraints

Failsafe signals include:

- freeze guard based on post-VVX temperature
- wrong-direction ventilation reduction
- cooling ventilation cap

Constraints are applied in the intent layer, not directly in feature calculations.

## Intent resolution

Intent merges signals into final desired actuator state:

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

Priority principles:

- OFF wins over everything.
- MAN sets driver inhibit.
- Dampers/fans are started before process tools.
- Startup/freeze/failsafe may limit fans.
- BST/FIRE can override normal fan percentages.
- Heat/cool/VVX are applied only after readiness and constraints.