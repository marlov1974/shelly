# Script Contracts

## Naming convention

Runtime scripts are named with role and version:

```text
<role>_v<major>_<minor>_<patch>
```

Examples:

```text
boot_v1_0_0
master_v1_5_0
master_v1_6_0
master_v1_7_0
master_v1_8_0
state_v1_4_1
state_v1_8_0
weather_v1_0_1
brain_v2_4_2
brain_v2_8_0
brain_v2_9_0
brain_v2_10_0
reboot_v1_0_0
reboot_v1_3_0
```

## Fixed script ids

Canonical fixed ids:

```text
2 boot
3 master
4 dampers local executor; outside central manifest
5 state
6 weather
7 brain
8 reboot
```

Each auto-managed worker script must define its own `SCRIPT_ID` in its base chunk and use fixed-id `selfStop()` from `rt/common/script.js`.

Script id 1 is outside the central manifest and is used by the local telemetry
publisher on the dampers hub. Other physical devices also use local script ids
outside this central manifest for their publishers, local masters and executors.

## boot

Role:
- Startup handoff script.

Script id:
- Fixed id 2.

Lifecycle:
- The only script with Run on startup enabled in the current device manifest.
- Waits for stabilization after physical boot/reboot.
- Starts master id 3.
- Self-stops.

Restrictions:
- Must not set a ventilation startup state.
- Must not alter actuator outputs.

## master

Role:
- Long-lived runtime scheduler and dispatcher.

Script id:
- Fixed id 3.

Lifecycle:
- Started by boot or Mac direct deploy.
- Runs a 15-second score-dispatch tick loop.

Inputs:
- Internal scores and counters.

Outputs:
- Starts exactly one worker per tick by fixed script id.
- Stops the previous worker at the beginning of the next tick if still running.

Restrictions:
- Must not implement control logic.
- Must not use `Script.List` during normal runtime.
- Must remain low-heap and avoid long nested callback chains.

Local-executor note:
- `master_v1_8_0` does not schedule or require central `driver`.
- Physical application is handled by local device executors reading
  `ftx.intent.dev.*`.
- `master_v1_8_0` schedules the dampers local executor id 4.
- VVX uses `master_vvx_v0_2_0` locally to start its publisher and executor.
- The old central `driver_v1_0_1` rollback script is retired and no longer
  installed in the active VVX manifest.

## edge telemetry publishers

Role:
- Long-running low-rate scripts on physical Shelly devices.

Lifecycle:
- Run on startup enabled on each physical edge device.
- Sample local `Shelly.GetStatus` every 60 seconds.
- Publish the complete per-device payload to dampers-hub KVS when any value crosses its delta threshold.
- Republish every 10 minutes as a heartbeat.

Active script names:
- `telemetry_publisher_supply_fan_v0_2_0`
- `telemetry_publisher_extract_fan_v0_2_0`
- `telemetry_publisher_heat_dimmer_v0_2_0`
- `telemetry_publisher_cool_dimmer_v0_2_0`
- `telemetry_publisher_dampers_v0_2_0`
- `telemetry_publisher_vvx_v0_2_0`

Inputs:
Outputs:
- `ftx.tel.dev.sup`
- `ftx.tel.dev.ext`
- `ftx.tel.dev.heat`
- `ftx.tel.dev.cool`
- `ftx.tel.dev.dmp`
- `ftx.tel.dev.vvx`

Implementation note:
- Central `poll` code remains in the repository as legacy source but is not in
  the active device manifest and is not scheduled by `master_v1_8_0`.

## edge local masters and executors

Role:
- Small local physical-device apply path for the Gen1-to-G2 migration.

Lifecycle:
- Supply, heat, cool and dampers use a long-running local master.
- Extract uses `house_air_sensor_watchdog_v0_2_0` as the long-running scheduler because watchdog + publisher + local master would exhaust the three-running-script limit.
- VVX uses `master_vvx_v0_2_0` as its local scheduler.
- Local executor is one-shot and started by its device-specific scheduler.
- Local executor self-stops after reading intent and applying or skipping.

Active script names:
- `master_supply_fan_v0_1_0`
- `executor_supply_fan_v0_1_0`
- `house_air_sensor_watchdog_v0_2_0`
- `executor_extract_fan_v0_1_0`
- `master_heat_dimmer_v0_1_0`
- `executor_heat_dimmer_v0_1_0`
- `master_cool_dimmer_v0_1_0`
- `executor_cool_dimmer_v0_1_0`
- `master_dampers_v0_1_0`
- `executor_dampers_v0_1_0`
- `executor_vvx_v0_1_0`

Live VVX id note:
- The VVX executor remains on id 10 and is scheduled by local
  `master_vvx_v0_2_0`.
- Live VVX slot 4 is intentionally unused after cleanup. Central poll has been
  removed from the live device.

Live extract id note:
- Extract fan slot 4 is intentionally unused after cleanup. Extract already runs
  the house air sensor watchdog and telemetry publisher, so the watchdog v0.2
  script owns the 43-second executor schedule.

Schedules:

```text
supply fan:  executor 41s, publisher 601s
extract fan: executor 43s via watchdog, publisher self-samples
cool:        executor 47s, publisher 613s
heat:        executor 53s, publisher 617s
VVX:         executor 59s via local master, publisher self-samples
dampers:     executor 61s, publisher 631s
```

Inputs:
- `ftx.intent.dev.sup`
- `ftx.intent.dev.ext`
- `ftx.intent.dev.heat`
- `ftx.intent.dev.cool`
- `ftx.intent.dev.dmp`
- `ftx.intent.dev.vvx`

Outputs:
- Local Shelly output RPC for exactly one physical device:
  - supply fan `Light.Set id=0`
  - extract fan `Light.Set id=0`
  - heat dimmer `Light.Set id=0`
  - cool dimmer `Light.Set id=0`
  - dampers `Switch.Set id=0`
  - VVX `Switch.Set id=0`

Restrictions:
- Executors must not apply any other device.
- Executors must ignore missing, malformed, inhibited or stale intent.
- Executors must read current local output and avoid redundant output RPC writes.
- Executors must not change config, schedules, scripts, network, KVS unrelated to their read key or actuator behavior outside their one local output.

## state

Role:
- Derives run state and selected UI/performance outputs from telemetry.

Script id:
- Fixed id 5.

Lifecycle:
- One-shot.
- Self-stops after writing outputs.

Inputs:
- `ftx.tel.dev.sup`
- `ftx.tel.dev.ext`
- `ftx.tel.dev.heat`
- `ftx.tel.dev.cool`
- `ftx.tel.dev.dmp`
- `ftx.tel.dev.vvx`
- `ftx.state.hist` for VVX efficiency smoothing/history.

Outputs:
- `ftx.state.run`
- `ftx.state.hist`
- compatibility telemetry: `ftx.tel.m`, `ftx.tel.x`, `ftx.tel.act`
- `number:201` Base power, W
- `number:202` VVX efficiency, %
- `number:203` Fan avg pct, %

## weather

Role:
- Fetches weather data and writes current weather reference object.

Script id:
- Fixed id 6.

Lifecycle:
- One-shot.
- Self-stops after writing weather KVS.
- Runs at startup before first brain run and periodically thereafter.

Inputs:
- Open-Meteo daily shortwave radiation.
- Open-Meteo hourly temperature.

Outputs:
- `ftx.weather.act = { solar_kwh_today, temp_now }`

## brain

Role:
- Computes full desired control intent from commands, telemetry, run state, weather and persisted forced-mode state.

Script id:
- Fixed id 7.

Lifecycle:
- One-shot.
- Self-stops after writing target and intent.

Inputs:
- Local dampers-hub command virtual components:
  - `boolean:200` On
  - `boolean:201` Nightmode
  - `enum:200` Mode
  - `number:200` Temp
- KVS:
  - `ftx.tel.dev.sup`
  - `ftx.tel.dev.ext`
  - `ftx.tel.dev.heat`
  - `ftx.tel.dev.cool`
  - `ftx.tel.dev.dmp`
  - `ftx.tel.dev.vvx`
  - `ftx.state.run`
  - `ftx.weather.act`
  - `ftx.mode_forced_state`

Outputs:
- `number:204` Target to house, C
- `ftx.intent.dev.sup`
- `ftx.intent.dev.ext`
- `ftx.intent.dev.heat`
- `ftx.intent.dev.cool`
- `ftx.intent.dev.dmp`
- `ftx.intent.dev.vvx`
- `ftx.mode_forced_state`

Internal architecture:
- `io-*` fills `ctx.cmd`, `ctx.inp`, `ctx.weather`, `ctx.forced`.
- `feature-*` writes independent signals to `ctx.sig`.
- `intent.js` merges/prioritizes signals into `ctx.intent`.
- `output.js` writes external state.

Restrictions:
- Brain must not call physical actuator RPCs directly.
- Brain writes desired full state, not deltas.

## reboot

Role:
- Daily/full-device reboot orchestrator.

Script id:
- Fixed id 8 on the dampers hub.

Lifecycle:
- One-shot takeover script selected by master score dispatcher.
- Does not self-stop in the normal path because it reboots the local device.

Behavior:
1. Stops all other local scripts, including master.
2. Waits 5 minutes.
3. Reboots remote Shelly devices.
4. Waits 5 minutes.
5. Reboots local device.

Purpose:
- Recover from long-lived memory/RPC degradation and keep the Shelly mesh stable.
