# Heat Pump Operating Schedules — Memory File v1.0

## Purpose

Canonical reference for the two heat pumps' physical command mappings, logical operating levels, and baseline scheduling rules.

This file belongs to `memory/house-control/` because it describes the physical and functional heat-pump control concept. The runtime optimizer implementation may also reference `memory/optimizer-dampers/04-heat-pump-library.md`.

---

## Physical command model

Each heat pump is controlled through two external digital inputs.

The two inputs form a 2-bit command code:

```text
00
01
10
11
```

Notation:

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

VP1 is primarily treated as:

```text
- low-temperature machine
- efficient base-load heat pump
- everyday heating machine
- domestic-hot-water-oriented machine through 20/52
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

VP2 is primarily treated as:

```text
- boost machine
- top-load heat pump
- pool / warm-water charging machine
- aggressive recovery machine after thermal deficit
```

---

## Logical winter operating levels

The physical VP commands are abstracted into logical system levels for scheduling and optimization.

```text
L0 = OFF
L1 = 0/28
L2 = 0/32
L3 = 30/28
L4 = 30/32
L5 = 36/36
```

These are conceptual system levels for the combined VP1 + VP2 system. They do not always map one-to-one to one physical heat-pump command.

---

## Approximate planning model

The following values are planning values and must be calibrated against measured operation.

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

The scheduler should select:

```text
- which 2h blocks are active
- which logical level L0–L5 each active block should use
```

The quarter-hour runtime should only apply the current block decision.

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

---

## Summer operation concept

In summer, the heat pumps should primarily act as:

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

In winter, the scheduler should use levels `L1`–`L5` to match heating demand, price level and thermal deficit.

Typical interpretation:

```text
L1 / L2 = maintain / efficient low demand
L3      = normal economy heating
L4      = standard winter operation / recovery
L5      = aggressive recovery during cold periods or cheap electricity
```

---

## Optimization principle

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

## Important layering rule

Quarter-hour execution must not itself choose the cheapest blocks.

Correct layering:

```text
1. block-level optimizer decides selected 2h blocks and levels
2. quarter-hour runtime only looks up the current block decision
3. driver translates the decision into VP1/VP2 outputs
```

This keeps runtime scripts small, deterministic and debuggable.
