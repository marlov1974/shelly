# Script Contracts

## Naming convention

Runtime scripts are named with role and version:

```text
<role>_v<major>_<minor>_<patch>
```

Examples:

```text
master_v1_0_0
poll_v3_3_0
state_v1_4_0
weather_v1_0_0
brain_v2_3_0
```

`installer` is the exception. It is fixed at script id 1 and is not auto-updated.

## installer

Role:
- Permanent bootstrap and deployment installer.

Script id:
- Fixed id 1.

Lifecycle:
- One-shot when started manually or by master.
- Self-stops after completion or no-op.

Inputs:
- GitHub raw device manifest: `rt/devices/<device-id>.json`.
- GitHub recipe and chunks for the package being built.
- `text:200` installer state.

Outputs:
- Creates missing virtual components.
- Creates missing scripts.
- Writes script code.
- Starts `master` when done.
- Updates `text:200` only when the whole device version is complete.

## master

Role:
- Long-lived runtime scheduler and orchestrator.

Lifecycle:
- Boot-enabled.
- Runs a 60-second tick loop.

Inputs:
- Script list.
- Tick counters.

Outputs:
- Starts `poll`, `state`, `weather`, `brain`, later `driver`.
- Starts installer id 1 on due ticks.

Restrictions:
- Must not implement control logic.
- Must tolerate missing worker scripts.

## poll

Role:
- Reads physical/edge device statuses and writes normalized telemetry.

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

Virtual components:
- None owned by poll in current design.

## state

Role:
- Derives run state and selected UI/performance outputs from telemetry.

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
- Fetches weather data and writes current weather actuation/reference object.

Lifecycle:
- One-shot.
- Self-stops after writing weather KVS.

Inputs:
- Open-Meteo daily shortwave radiation.
- Open-Meteo hourly temperature.

Outputs:
- `ftx.weather.act = { solar_kwh_today, temp_now }`

Virtual components:
- None currently owned by weather.

## brain

Role:
- Computes control intent from commands, telemetry, weather and persisted forced-mode state.

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

## driver

Role:
- Applies `ftx.intent.act` to physical actuators.

Status:
- Not yet rebuilt in the new runtime/installer architecture.

Expected lifecycle:
- One-shot.
- Self-stop after applying outputs.

Expected input:
- `ftx.intent.act`

Expected output:
- RPC writes to fan dimmers, heat/cool dimmers, VVX switch and dampers.