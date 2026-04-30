# Runtime Model

## Current canonical runtime model

FTX Digital uses one long-lived runtime dispatcher and several one-shot worker scripts.

Long-lived:

- `master`

Autostart:

- `boot`

One-shot/self-stopping workers:

- `installer`
- `poll`
- `state`
- `weather`
- `brain`
- `driver`
- `reboot`

## Boot model

`boot` is the only script with Run on startup enabled.

On physical device startup/reboot:

1. `boot` starts automatically.
2. `boot` waits for the system to stabilize, including network, other devices and retained device states.
3. `boot` starts `master`.
4. `boot` self-stops.

No script should force a ventilation startup mode. Devices are configured to restore their previous physical on/off/dimmer state after reboot. This includes VVX. If VVX device reboots, VVX may stop for a few seconds, but ventilation should not deliberately change state because of that.

## Master responsibility

Master is a minimal scheduler/dispatcher only. It must not contain ventilation, thermal or business/control logic.

Master handles:

- fixed 15-second cadence
- choosing one worker per tick
- stopping the previously started worker if it is still running
- starting the selected worker by fixed script id
- no long callback chains
- no Script.List based discovery during normal runtime

## Current master design: score dispatcher

Master v1.4 uses a score-based dispatcher.

Every 15-second tick:

1. Stop the previous worker if it is still running.
2. Decrement all script scores by 1.
3. Select the worker with the lowest score.
4. Start exactly one worker script.
5. Reset the selected worker's score to its reset value.

This means master does not build a queue and does not wait for a full control chain to finish. Each worker gets one 15-second window. Normal latency is acceptable because ventilation, VVX, heat and cooling are slow systems.

## Script ids

Canonical fixed ids:

```text
1 installer
2 boot
3 master
4 poll
5 state
6 weather
7 brain
8 driver
9 reboot
```

Fixed ids are used to reduce heap pressure. Workers self-stop through `Script.Stop` using their own `SCRIPT_ID`, not by calling `Script.List`.

## Initial scores

Because master decrements scores at the beginning of each tick, initial scores are:

```text
installer = 1
poll      = 2
state     = 3
weather   = 4
brain     = 5
driver    = 6
reboot    = 5760
```

Expected first startup sequence:

```text
installer → poll → state → weather → brain → driver
```

Weather is intentionally run during startup before the first brain run, so brain can use fresh weather data.

## Reset scores

```text
poll/state/brain/driver = 4
installer              = 20
weather                = 240
reboot                 = 5760
```

At 15-second cadence this means:

```text
installer ≈ every 5 minutes
weather   ≈ every 60 minutes
reboot    ≈ every 24 hours
```

Reboot is no longer tied to a specific wall-clock time window. It is score based and may drift over time.

## Normal cadence

After startup, the normal control rhythm becomes:

```text
poll → state → brain → driver
```

Weather is inserted as an extra worker before the next relevant control cycle when its score becomes lowest. Weather does not replace poll/state; it just runs as an additional step and the normal poll/state/brain/driver flow continues.

Installer and reboot are different:

- Installer may reset/interrupt the flow. If it builds a package, it normally kills master and restarts the updated runtime.
- Reboot takes over and kills master.

## Worker contracts

Workers should:

- do one job
- write their outputs
- log `DON` or equivalent success marker
- call `selfStop()` using fixed `SCRIPT_ID`

Master does not depend on callbacks from workers. If a worker hangs, master stops it at the beginning of the next 15-second tick.

## Reboot model

`reboot` is a one-shot worker with script id 9.

When selected by master:

1. It stops all other local scripts, including master.
2. It waits 5 minutes to let the local device settle.
3. It reboots the other Shelly devices.
4. It waits 5 minutes for those devices to stabilize.
5. It reboots the local device.

After the local device reboots, only `boot` autostarts. Boot waits, starts master, and master begins again with installer as first selected worker.

## Missing scripts during bootstrap

During incomplete bootstrap, missing workers are expected. Installer builds one package per run. Once master exists, master's first tick runs installer, and installer continues creating missing packages until the device version is complete.

## Current implementation note

The current active design is `master_v1_4_0-score-dispatcher`. Earlier 60-second chained master designs are obsolete and kept only as historical context in old notes or commit history.