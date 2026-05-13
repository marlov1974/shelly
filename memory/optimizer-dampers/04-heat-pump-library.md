# Heat Pump Library — Canonical Memory

## Purpose

This file documents the governing heat-pump control concept for the separate dampers / heat-pump optimizer runtime.

It is intended as canonical project memory for:

- two heat pumps controlled through external binary inputs
- logical heat-pump system levels
- 2h block scheduling
- minimum daily operation
- electricity-price-based optimization
- interaction with thermal storage such as house mass, domestic hot water and pool

This memory belongs to the `optimizer-dampers` track and uses the `hp.*` KVS namespace unless explicitly stated otherwise.

---

## Physical heat-pump control model

Each heat pump is controlled through two externally shortable digital inputs.

The two inputs form a 2-bit command code:

```text
00
01
10
11
```

Each code maps to a configured internal heat-pump mode.

The current notation is:

```text
flow_temperature / domestic_hot_water_temperature
```

Example:

```text
30/32 = 30 °C flow temperature and 32 °C domestic hot water target
```

---

## VP1 command mapping

```text
00 = 30/32
10 = 20/52
01 = OFF
11 = 36/52
```

Interpretation:

```text
00 = low / efficient heating operation
10 = near domestic-hot-water-priority mode
01 = heat pump off
11 = aggressive charging / high heat + high domestic hot water
```

VP1 is primarily treated as the efficient base-load machine.

Typical VP1 role:

```text
- low-temperature operation
- efficient base operation
- everyday heating
- domestic-hot-water-oriented operation through 20/52
```

---

## VP2 command mapping

```text
00 = 28/52
10 = 32/52
01 = UNUSED
11 = 36/52
```

Interpretation:

```text
00 = efficient base operation with low flow temperature and high domestic hot water target
10 = medium heating level
01 = unused / reserve
11 = max / boost mode
```

VP2 is primarily treated as the top-load and recovery machine.

Typical VP2 role:

```text
- boost operation
- top-load support
- pool charging
- domestic hot water support
- aggressive recovery after thermal deficit
```

---

## Logical system levels

The physical VP commands are abstracted into logical system levels for the scheduler / optimizer.

These levels describe the intended whole-system energy level for the combined VP1 + VP2 system.

```text
L0 = OFF
L1 = 0/28
L2 = 0/32
L3 = 30/28
L4 = 30/32
L5 = 36/36
```

These are conceptual operating levels and do not always map one-to-one to a single physical heat-pump command.

The optimizer should reason in terms of `L0` to `L5`, while the driver translates the chosen level into actual VP1/VP2 binary commands.

---

## Approximate planning performance per level

The following numbers are conceptual planning values and must be calibrated against measured operation before production use.

| Level | Label | Electrical input | COP | Heat output | Heat per 2h block |
|---|---|---:|---:|---:|---:|
| L1 | 0/28 | 0.8 kW | 5.5 | 4.4 kW | 8.8 kWh |
| L2 | 0/32 | 1.1 kW | 5.2 | 5.7 kW | 11.4 kWh |
| L3 | 30/28 | 1.8 kW | 5.2 | 9.4 kW | 18.8 kWh |
| L4 | 30/32 | 2.4 kW | 5.0 | 12.0 kW | 24.0 kWh |
| L5 | 36/36 | 7.5 kW | 3.6 | 27.0 kW | 54.0 kWh |

Interpretation:

```text
L1 / L2 = efficient low-power maintenance
L3      = economy heating
L4      = normal winter charging / recovery
L5      = aggressive recovery / boost
```

---

## Scheduling resolution

Planning resolution:

```text
2h blocks
```

Execution / telemetry resolution:

```text
15 minutes
```

The scheduler selects:

```text
- which 2h blocks should be active
- which logical level L0–L5 each active block should use
```

The quarter-hour runtime then applies the current block decision to actual device commands.

---

## Daily 2h block model

One day is divided into 12 blocks:

```text
1  = 00–02
2  = 02–04
3  = 04–06
4  = 06–08
5  = 08–10
6  = 10–12
7  = 12–14
8  = 14–16
9  = 16–18
10 = 18–20
11 = 20–22
12 = 22–24
```

---

## Forced / sacred blocks

The following blocks are always selected:

```text
Block 1 = 00–02
Block 7 = 12–14
```

This gives:

```text
2 blocks/day
4 h/day
14 blocks/week
28 h/week
```

Purpose:

```text
- ensure minimum daily thermal maintenance
- guarantee domestic hot water recovery opportunity
- maintain stable thermal reserves
- use statistically favorable night and midday price periods
```

These blocks are considered baseline operation, not optional price optimization.

---

## Minimum weekly runtime

The minimum weekly runtime is:

```text
28 h/week
```

Equivalent to:

```text
14 two-hour blocks/week
```

In design models this can be represented as:

```text
schedule_h = MAX(28, required_energy_kwh / available_heat_output_kw)
```

Earlier Excel design used:

```text
schedule_h = MAX(28, (pool_kwh + heat_kwh + ww_kwh) / 22)
```

where `22 kW` was a planning assumption for heat output.

---

## Thermal storage philosophy

The system intentionally uses thermal inertia as energy storage.

Thermal storage layers:

```text
1. house thermal mass
2. domestic hot water tanks
3. swimming pool
4. hydronic water volume / floor heating system
```

The pool is explicitly treated as a long-duration thermal battery that can shift heat production across days and potentially across the week.

The optimizer may therefore choose to produce more heat during cheap blocks and allow stored heat to cover later expensive blocks, as long as comfort and safety limits are respected.

---

## Summer operation concept

In summer the heat pumps should primarily act as:

```text
- domestic hot water machines
- pool heating machines
```

They should normally not be used for house heating.

Default summer forced schedule:

```text
00–02 active
12–14 active
```

Interpretation:

```text
00–02 = recovery / domestic hot water opportunity
12–14 = midday solar-price / pool-charging opportunity
```

Extra runtime should only be added if domestic hot water and pool demand require more than the 28 h/week baseline.

---

## Winter operation concept

In winter the scheduler should use levels `L1`–`L5` to match heating demand, price level and thermal deficit.

Typical interpretation:

```text
L1 / L2 = maintain / efficient low demand
L3      = normal economy heating
L4      = standard winter operation / recovery
L5      = aggressive recovery during cold periods or cheap electricity
```

---

## Optimization philosophy

The optimizer should be deterministic and simple.

Preferred principle:

```text
Monotonic upward scheduling
```

Meaning:

```text
- start with a low-energy baseline plan
- upgrade blocks step by step if more energy is required
- avoid downgrading already-selected blocks within the same optimization pass
```

Benefits:

```text
- simple to reason about
- stable thermal behavior
- suitable for constrained Shelly script execution
- easier debugging through KVS
```

---

## Price source v1

The simplified v1 price design does not use Tibber forecast or statistical price forecast.

Instead it should fetch only known electricity prices from:

```text
elprisetjustnu.se
```

Example API pattern:

```text
https://www.elprisetjustnu.se/api/v1/prices/YYYY/MM-DD_SE3.json
```

Price-fetch responsibilities:

```text
1. fetch known prices
2. normalize rows
3. aggregate prices into 2h blocks
4. write compact KVS payloads
5. stop
```

The price-fetch script must not optimize the heat-pump schedule.

---

## Price block aggregation

If source prices are hourly:

```text
2h block price = average of 2 hourly values
```

If source prices are quarter-hourly:

```text
2h block price = average of 8 quarter-hour values
```

If a block is incomplete:

```text
- mark it incomplete, or
- exclude it from optimization
```

The optimizer should only use complete enough blocks.

---

## KVS separation principle

The heat-pump optimizer runtime uses `hp.*` keys.

It must not mix runtime state with:

```text
ftx.*
ftx.tel.*
ftx.intent.*
```

except where explicitly documented.

Expected separation:

```text
price-fetch       -> writes price/block KVS
schedule-optimizer -> reads demand + prices and writes schedule KVS
driver             -> applies current schedule to heat-pump commands
```

---

## Conceptual KVS examples

Price blocks:

```json
{
  "src": "elprisetjustnu",
  "area": "SE3",
  "ts": 1735689600,
  "blocks": [
    {"t": "2025-01-01T00:00:00+01:00", "b": 1, "p": 1.42, "n": 2},
    {"t": "2025-01-01T02:00:00+01:00", "b": 2, "p": 1.31, "n": 2}
  ]
}
```

Schedule block example:

```json
{
  "ts": 1735689600,
  "blocks": [
    {"t": "2025-01-01T00:00:00+01:00", "b": 1, "on": 1, "lvl": 4},
    {"t": "2025-01-01T02:00:00+01:00", "b": 2, "on": 0, "lvl": 0}
  ]
}
```

Exact KVS keys are defined separately in the KVS contract file.

---

## Important implementation rule

Quarter-hour execution must not itself choose the cheapest blocks.

Correct layering:

```text
1. block-level optimizer decides selected 2h blocks and levels
2. quarter-hour runtime only looks up the current block decision
3. driver translates the decision into VP1/VP2 outputs
```

This keeps Shelly scripts small, deterministic and debuggable.
