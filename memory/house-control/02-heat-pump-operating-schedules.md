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

## Heat pump idle power

Each heat pump draws approximately 50 W even when it is not actively producing heat, as long as it is powered/awake in a resting state.

Planning value:

```text
VP_IDLE_W = 50 W per heat pump
VP_IDLE_BOTH_W = 100 W for two heat pumps
```

Optimization implication:

```text
A heat pump that is active/available but resting is not electrically free.
The planner should include idle consumption when comparing schedules, especially when keeping both heat pumps awake across long non-producing periods.
```

This is different from delivered-heat COP. It is a fixed parasitic/standby load that affects cost even when no useful heat is produced.

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

Winter level interpretation:

```text
L1 / L2 = efficient low-power maintenance
L3      = economy heating
L4      = normal winter charging / recovery
L5      = aggressive recovery / boost
```

---

## Summer hot-water level offset trick

In summer, the sacred 00–02 block still exists so VP1 can restore its domestic-hot-water tank. However, VP1 must not accidentally produce house heat during this hot-water recovery block.

Therefore summer scheduling uses a shifted level model with a new lowest active level.

Summer lowest active level:

```text
L0 = VP1 20/52 + VP2 28/52
```

Interpretation:

```text
VP1 20/52 = near domestic-hot-water-priority mode without meaningful house-heating intent
VP2 28/52 = low/base hot-water capable support
```

The previous winter levels are shifted up by one step in the summer scheduler. This gives six usable scheduler levels while preserving an explicit low summer hot-water level.

Important rule:

```text
Summer L0 must not be accidentally upgraded by the monotonic level-upgrade algorithm.
```

Summer L0 is a deliberately protected lowest level for the sacred hot-water block, not a normal heating baseline.

---

## Approximate planning model

The following values are planning values and must be calibrated against measured operation.

The electrical input values below describe active operating levels and do not remove the need to account for heat-pump idle power during non-producing active/awake time.

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

## Period-dependent efficiency model

The level planning values above are base values. Gen2 optimization should also account for period-dependent efficiency.

The reason is that heat-pump efficiency depends on the system's thermal context, not only the chosen level:

```text
22–02 / night-heavy operation:
  The system may run heavier levels.
  House and floors can be cold.
  Boreholes may have rested before operation, but long heavy charging can reduce effective efficiency.
  Treat as base efficiency unless calibrated otherwise.

08–16 / daytime save period:
  The house mostly lives on heat stored during the night.
  The scheduler likely uses low levels or allows house temperature to fall.
  Lower thermal lift and gentler operation make all levels slightly more efficient than during 00–08.

16–00 / evening save plus limited charging:
  The system still mostly saves, but may perform some corrective charging.
  Levels are generally more efficient than the 00–08 charge period, unless heavy recovery is required.
```

Planning implication:

```text
Use the same logical levels, but apply a period efficiency factor to the level's COP / effective heat-per-kWh.
```

Initial conceptual factors, to be calibrated:

```text
00–08 charge period:       factor = 1.00
08–16 save period:         factor > 1.00
16–00 save/limited charge: factor > 1.00
```

The exact factors are not yet calibrated. They should be derived from measured VP power, delivered water temperature, house thermal response and borehole/brine behavior.

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

## Daily optimization periods

For high-level planning, the day is grouped into three periods:

```text
00–08:
  primary charging period

08–16:
  primary saving period

16–00:
  saving period with limited corrective charging
```

Each period may have a storage target. Period-level optimization chooses the lowest-cost block/level plan needed to reach the period target, while later periods are allowed to correct residual error.

---

## Forced / sacred blocks

Only one block is sacred:

```text
Block 1 = 00–02
```

Purpose:

```text
- give VP1 a daily opportunity to restore / charge its domestic-hot-water tank
- provide a stable night recovery opportunity independent of spot optimization
```

This gives:

```text
1 block/day
2 h/day
7 blocks/week
14 h/week
```

Block 7 / 12–14 is no longer sacred. It may still be selected by optimization when price, solar/midday behavior, domestic hot-water demand, pool demand or thermal-storage targets justify it, but it is not an always-selected block.

---

## Initial schedule seeds

The optimizer may seed blocks differently depending on season.

Winter start schedule:

```text
L5, L1, L1, L1
```

Summer start schedule:

```text
L0, L1, L1, L1
```

The summer seed uses protected L0 for the sacred 00–02 VP1 hot-water recovery behavior. The optimizer must not treat that L0 as an ordinary low heat level that can be upgraded accidentally.

---

## Summer operation concept

In summer, the heat pumps should primarily act as:

```text
- domestic hot water machines
- pool heating machines
```

They should normally not be used for house heating.

Default sacred schedule:

```text
00–02 active
```

Interpretation:

```text
00–02 = VP1 domestic-hot-water recovery opportunity using protected summer L0 / 20/52 behavior
```

Extra runtime should be added by optimization if domestic hot water and pool demand require more than the 14 h/week sacred baseline.

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

Summer exception:

```text
Protected summer L0 must not be accidentally upgraded by this monotonic upward scheduling process.
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
