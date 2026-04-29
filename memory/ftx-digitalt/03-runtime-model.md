# Runtime Model

## Core model

FTX Digital uses one long-lived runtime orchestrator and several one-shot worker scripts.

Long-lived:

- `master`

One-shot/self-stopping:

- `poll`
- `state`
- `weather`
- `brain`
- `driver` later
- `installer` when invoked manually or by master

## Master responsibility

Master owns the 60-second cadence. It starts worker scripts in order and waits for each script to stop before starting the next.

Master must not contain ventilation, thermal or business/control logic. It only handles:

- timing
- sequencing
- missing-script tolerance
- script start
- script timeout
- installer invocation

## Runtime order

Canonical runtime order:

```text
poll → state → weather when due → brain → driver later
```

Weather runs before brain because brain reads `ftx.weather.act`.

## Tick logic

Master ticks every 60 seconds.

- Runtime worker scripts are attempted every tick.
- Weather runs on tick 1 and then periodically.
- Installer runs on ticks `n*5+1`: 1, 6, 11, 16, etc.

Current default counters:

```text
TICK_MS = 60000
WEATHER_EVERY_TICKS = 30
INSTALL_EVERY_TICKS = 5
```

Installer due logic:

```text
(tickCount - 1) % INSTALL_EVERY_TICKS == 0
```

## Timeouts

Current intended default timeouts:

```text
poll:    25s
state:   10s
weather: 30s
brain:   10s
driver:  10s later
```

If a script times out, master should attempt `Script.Stop` and continue safely.

## Missing scripts

Master must survive missing worker scripts. If a role is missing, master logs `NO <role>` and continues. This is required because installer creates the runtime stepwise.

During bootstrap:

```text
installer creates master
master starts
master attempts missing workers and logs NO ...
master starts installer on tick 1
installer builds next package
master restarts
repeat until complete
```

## Script discovery

Master finds scripts by role/version prefix first, with fallback to legacy role name.

Examples:

```text
poll_v3_3_0
state_v1_4_0
weather_v1_0_0
brain_v2_3_0
```

Role prefix form:

```text
<role>_v<major>_<minor>_<patch>
```

## Self-stop

Worker scripts must self-stop after writing their outputs. Master waits until they are no longer running before starting the next step.

## Current limitation

Driver has not yet been rebuilt in the new architecture. Until driver is added, brain writes intent but no new driver step is applied by this master sequence.