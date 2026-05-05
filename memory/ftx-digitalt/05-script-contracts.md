# Script Contracts

## Naming convention

Runtime scripts are named with role and version:

```text
<role>_v<major>_<minor>_<patch>
```

Examples:

```text
boot_v1_0_0
master_v1_4_0
poll_v3_3_2
state_v1_4_1
weather_v1_0_1
brain_v2_4_2
driver_v1_0_1
reboot_v1_0_0
```

## Fixed script ids

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

Each auto-managed worker script must define its own `SCRIPT_ID` in its base chunk and use fixed-id `selfStop()` from `rt/common/script.js`.

## installer

Role:
- Permanent bootstrap and deployment installer.

Script id:
- Fixed id 1.

Lifecycle:
- One-shot when started manually or by master.
- Self-stops after completion or no-op.
- Not auto-updated.

Inputs:
- GitHub raw device manifest: `rt/devices/<device-id>.json`.
- GitHub recipe and chunks for the package being built.
- `text:200` installer state.

Outputs:
- Creates missing virtual components.
- Creates or reuses missing scripts on fixed ids.
- Writes script code from recipe chunks.
- Starts `master` when done if possible.
- Updates `text:200` only when the whole device version is complete.

Restrictions:
- Installer may use `Script.List` and more standalone code because deployment/discovery is its job.
- Installer is the recovery path and should remain manually maintained.

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
- Started by boot or installer.
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

## poll

Role:
- Reads physical/edge device statuses and writes normalized telemetry.

Script id:
- Fixed id 4.

Lifecycle:
- One-shot.
- Self-stops after writing telemetry.

Inputs:
- Shelly status from edge devices:
  - supply UNI
  - supply fan
  - extract UNI
  - extract fan
  - process UNI
  - heat dimmer
  - cool dimmer
  - VVX switch
  - dampers switch/device

Outputs:
- `ftx.tel.m`
- `ftx.tel.act`

Implementation note:
- `createPollCtx()` must expose object names used by features: `supply`, `extract`, `process`, `heat`, `cool`, `vvx`, `dmp`.

## state

Role:
- Derives run state and selected UI/performance outputs from telemetry.

Script id:
- Fixed id 5.

Lifecycle:
- One-shot.
- Self-stops after writing outputs.

Inputs:
- `ftx.tel.m`
- `ftx.tel.act`
- `ftx.state.hist` for VVX efficiency smoothing/history.

Outputs:
- `ftx.state.run`
- `ftx.state.hist`
- `number:201` Total power, W
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
- Command virtual components:
  - `boolean:200` On
  - `boolean:201` Nightmode
  - `enum:200` Mode
  - `number:200` Temp
- KVS:
  - `ftx.tel.m`
  - `ftx.tel.act`
  - `ftx.state.run`
  - `ftx.weather.act`
  - `ftx.mode_forced_state`

Outputs:
- `number:204` Target to house, C
- `ftx.intent.act`
- `ftx.mode_forced_state`

Internal architecture:
- `io-*` fills `ctx.cmd`, `ctx.inp`, `ctx.weather`, `ctx.forced`.
- `feature-*` writes independent signals to `ctx.sig`.
- `intent.js` merges/prioritizes signals into `ctx.intent`.
- `output.js` writes external state.

Restrictions:
- Brain must not call physical actuator RPCs directly.
- Brain writes desired full state, not deltas.

## driver

Role:
- Applies `ftx.intent.act` to physical actuators.

Script id:
- Fixed id 8.

Lifecycle:
- One-shot.
- Self-stops after applying outputs.

Input:
- `ftx.intent.act`

Outputs:
- RPC writes to:
  - dampers switch/device
  - supply fan dimmer
  - extract fan dimmer
  - VVX switch
  - heat dimmer
  - cool dimmer

Behavior:
- Reads intent using `rt/driver/io-input.js`.
- Normalizes intent in `rt/driver/normalize.js`.
- Respects `driver_inhibit`: if set, logs `INH` and self-stops without applying actuator outputs.
- Treats `on=0` as dominant over non-zero `pct`.
- Protects against simultaneous heat and cool: if both are requested, normalize disables both and marks thermal conflict.
- Applies either off sequence or on sequence from `rt/driver/sequence.js`.

## reboot

Role:
- Daily/full-device reboot orchestrator.

Script id:
- Fixed id 9.

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