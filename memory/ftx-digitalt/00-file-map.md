# FTX Digital File Map

This file maps the current repo structure needed to understand and continue FTX Digital development. The device manifest, recipes and Mac direct-deploy tool on `main` are the source of truth.

## Device manifest

### `rt/devices/8813bfdaa0c0.json`

Defines the deployable runtime for the VVX/FTX control device:

- `device_version`
- expected runtime scripts
- fixed script ids
- script versions and names
- recipe paths
- boot flags used by Mac direct deploy when setting script config

Current canonical ids from the manifest:

```text
2 boot
3 master
4 retired central poll slot; unused on live VVX
5 state
6 weather
7 brain
8 driver
9 reboot
edge local masters/executors on physical actuator devices
```

## Mac direct deploy

### `tools/g1_vvx_deploy.py`

Mac-side deployment/bootstrap tool for the active VVX runtime host.

Responsibilities:

- verifies live Shelly device id before writes
- reads `rt/devices/8813bfdaa0c0.json` locally
- reads recipe chunks locally
- writes selected fixed-id scripts with bounded RPC `Script.PutCode` chunks
- sets script name and boot flag from the device manifest
- writes persistent deploy state to `text:200`
- can stop/delete obsolete live `Installer` script id 1
- starts `master` after a successful deploy when requested
- does not manage slot 4; central poll is retired and live VVX slot 4 is intentionally unused

### `tools/g1_edge_script_deploy.py`

Mac-side deploy tool for standalone edge scripts on physical devices.
It creates or updates one named script, sets its enable flag, uploads bounded
chunks and optionally starts it. It can also reuse a known existing script id
with `--script-id` when a device has no free script slots and an inactive slot
has intentionally been retired.

## Recipes

Recipes define the chunk list and any recipe-owned virtual components for each script package.

### `rt/recipes/boot.json`

Builds the boot startup handoff script from:

```text
rt/common/wrapper.start.js
rt/boot/base.js
rt/common/script.js
rt/boot/main.js
rt/common/wrapper.end.js
```

### `rt/recipes/master.json`

Builds master from:

```text
rt/common/wrapper.start.js
rt/master/base.js
rt/common/script.js
rt/master/run.js
rt/master/main.js
rt/common/wrapper.end.js
```

Inconsistency to be aware of: this recipe contains `"boot": true`, but Mac direct deploy sets script boot config from the device manifest package entry, not from recipe `boot`. The current manifest sets master `boot: false`, so master is not the intended autostart script.

### `rt/recipes/p.json` legacy

Legacy central poll recipe. Central poll is retired from the active manifest and
is not scheduled by `master_v1_7_0`.

Builds old poll from:

```text
rt/common/wrapper.start.js
rt/poll/base.js
rt/common/script.js
rt/common/helpers.js
rt/poll/numbers.js
rt/common/kvs.js
rt/common/shelly.js
rt/poll/feature-supply.js
rt/poll/feature-extract.js
rt/poll/feature-process.js
rt/poll/feature-heat.js
rt/poll/feature-cool.js
rt/poll/feature-vvx.js
rt/poll/feature-dampers.js
rt/poll/output.js
rt/poll/main.js
rt/common/wrapper.end.js
```

### `rt/recipes/state.json`

Builds state from:

```text
rt/common/wrapper.start.js
rt/state/base.js
rt/common/script.js
rt/common/helpers.js
rt/common/kvs.js
rt/state/input-devices.js
rt/state/run-air.js
rt/state/run-process.js
rt/state/perf-power.js
rt/state/perf-vvx.js
rt/state/perf-fan.js
rt/state/output.js
rt/state/main.js
rt/common/wrapper.end.js
```

Owns these virtual number components:

```text
number:201 Total power, W
number:202 VVX efficiency, %
number:203 Fan avg pct, %
```

### `rt/recipes/weather.json`

Builds weather from:

```text
rt/common/wrapper.start.js
rt/weather/base.js
rt/common/script.js
rt/common/helpers.js
rt/common/kvs.js
rt/weather/url.js
rt/weather/http.js
rt/weather/parse.js
rt/weather/fetch.js
rt/weather/output.js
rt/weather/main.js
rt/common/wrapper.end.js
```

### `rt/recipes/brain.json`

Builds brain from:

```text
rt/common/wrapper.start.js
rt/brain/base.js
rt/common/script.js
rt/brain/modes.js
rt/common/helpers.js
rt/common/kvs.js
rt/brain/io-commands.js
rt/brain/io-inputs.js
rt/brain/io-weather.js
rt/brain/io-forced-mode.js
rt/brain/feature-forced-mode.js
rt/brain/feature-target.js
rt/brain/feature-ventilation.js
rt/brain/feature-failsafe.js
rt/brain/feature-thermal.js
rt/brain/feature-vvx.js
rt/brain/intent.js
rt/brain/output.js
rt/brain/main.js
rt/common/wrapper.end.js
```

Owns these virtual components:

```text
boolean:200 On
boolean:201 Nightmode
enum:200 Mode = STD, BST, FIRE, MAN
number:200 Temp, C
number:204 Target to house, C
```

### `rt/recipes/driver.json`

Builds driver from:

```text
rt/common/wrapper.start.js
rt/driver/base.js
rt/common/script.js
rt/common/helpers.js
rt/common/kvs.js
rt/driver/io-input.js
rt/driver/normalize.js
rt/driver/rpc.js
rt/driver/apply-dampers.js
rt/driver/apply-fans.js
rt/driver/apply-vvx.js
rt/driver/apply-thermal.js
rt/driver/sequence.js
rt/driver/main.js
rt/common/wrapper.end.js
```

### `rt/recipes/reboot.json`

Builds reboot from:

```text
rt/common/wrapper.start.js
rt/reboot/base.js
rt/common/script.js
rt/reboot/main.js
rt/common/wrapper.end.js
```

No missing recipe chunk files were identified in the current review.

## Common chunks

### `rt/common/wrapper.start.js`

Starts the self-contained script wrapper.

### `rt/common/wrapper.end.js`

Closes and invokes the self-contained script wrapper.

### `rt/common/script.js`

Common `log()` and fixed-id `selfStop()` helpers.

### `rt/common/helpers.js`

Common numeric, boolean, clamp and small utility helpers.

### `rt/common/kvs.js`

Thin KVS get/set wrappers.

### `rt/common/shelly.js`

HTTP status fetch and Shelly status parsing helpers used mainly by poll.

## Boot chunks

### `rt/boot/base.js`

Boot constants: script name/id, master id and startup delay.

### `rt/boot/main.js`

Waits for stabilization, starts master and self-stops.

## Master chunks

### `rt/master/base.js`

Master constants, fixed ids, score reset values and initial scores.

### `rt/master/run.js`

Minimal worker stop/start helpers, score decrement and worker selection.

### `rt/master/main.js`

15-second score-dispatch tick loop.

## Poll chunks

The `rt/poll/` folder is legacy source. It is not part of the active
`rt/devices/8813bfdaa0c0.json` manifest since device_version 32.

### `rt/poll/base.js`

Poll constants, target device IPs, calibration constants and poll context shape.

### `rt/poll/numbers.js`

Poll numeric normalization helpers.

### `rt/poll/feature-supply.js`

Reads supply UNI and supply fan; derives supply pressure, RPM, flow, temperatures and actual fan state.

### `rt/poll/feature-extract.js`

Reads extract UNI and extract fan; derives extract pressure, RPM, flow, temperatures and actual fan state.

### `rt/poll/feature-process.js`

Reads process UNI; derives house temperature/RH, CO2/VOC and VVX RPM.

### `rt/poll/feature-heat.js`

Reads heat dimmer actual state.

### `rt/poll/feature-cool.js`

Reads cool dimmer actual state.

### `rt/poll/feature-vvx.js`

Reads VVX switch actual state and power.

### `rt/poll/feature-dampers.js`

Reads damper switch/device actual state.

### `rt/poll/output.js`

Builds and writes `ftx.tel.m` and `ftx.tel.act`.

### `rt/poll/main.js`

Runs poll read sequence, writes telemetry, logs and self-stops.

## State chunks

### `rt/state/base.js`

State constants and context shape.

### `rt/state/input-devices.js`

Reads `ftx.tel.dev.*`, composes compatibility `ftx.tel.m`, `ftx.tel.x` and
`ftx.tel.act`, and applies house temp/RH fallbacks before run/perf calculation.

### `rt/state/run-air.js`

Derives supply/extract run booleans.

### `rt/state/run-process.js`

Derives VVX, heat, cool and damper run booleans.

### `rt/state/perf-power.js`

Calculates total power.

### `rt/state/perf-vvx.js`

Calculates/smooths VVX efficiency.

### `rt/state/perf-fan.js`

Calculates fan average percentage.

### `rt/state/output.js`

Writes `ftx.state.run`, `ftx.state.hist` and state-owned number components.

### `rt/state/main.js`

Runs state read/derive/write sequence and self-stops.

## Weather chunks

### `rt/weather/base.js`

Weather constants, location, API base URLs and context shape.

### `rt/weather/url.js`

Builds weather request URLs.

### `rt/weather/http.js`

HTTP helper for weather calls.

### `rt/weather/parse.js`

Parses weather API responses.

### `rt/weather/fetch.js`

Fetches daily/hourly weather data.

### `rt/weather/output.js`

Writes `ftx.weather.act`.

### `rt/weather/main.js`

Runs weather fetch/write sequence and self-stops.

## Brain chunks

### `rt/brain/base.js`

Brain script id/name and context shape.

### `rt/brain/modes.js`

Mode constants and forced-mode helpers.

### `rt/brain/io-commands.js`

Reads command virtual components.

### `rt/brain/io-inputs.js`

Reads telemetry and run state into brain inputs.

### `rt/brain/io-weather.js`

Reads `ftx.weather.act`.

### `rt/brain/io-forced-mode.js`

Reads/writes `ftx.mode_forced_state`.

### `rt/brain/feature-forced-mode.js`

Applies forced-mode timeout and resets mode to STD after max cycles.

### `rt/brain/feature-target.js`

Calculates target-to-house temperature and deltas.

### `rt/brain/feature-ventilation.js`

Calculates ventilation signals and `full_air_ready`.

### `rt/brain/feature-failsafe.js`

Calculates failsafe/freeze/wrong-direction constraints.

### `rt/brain/feature-thermal.js`

Calculates heat/cool demand and candidate percentages.

### `rt/brain/feature-vvx.js`

Current VVX candidate logic: VVX on when full air chain is ready.

### `rt/brain/intent.js`

Resolves signals into final full desired `ftx.intent.act`.

### `rt/brain/output.js`

Writes target, aggregate intent and per-device intents:

- `ftx.intent.act`
- `ftx.intent.dev.sup`
- `ftx.intent.dev.ext`
- `ftx.intent.dev.heat`
- `ftx.intent.dev.cool`
- `ftx.intent.dev.dmp`
- `ftx.intent.dev.vvx`

### `rt/brain/main.js`

Runs the brain sequence and self-stops.

## Driver chunks

### `rt/driver/base.js`

Driver script id/name, KVS input key and context shape.

### `rt/driver/io-input.js`

Reads `ftx.intent.act`.

### `rt/driver/normalize.js`

Normalizes intent, handles `on=0` dominance and disables both heat/cool on thermal conflict.

### `rt/driver/rpc.js`

HTTP/RPC helper functions for actuator calls.

### `rt/driver/apply-dampers.js`

Applies damper switch state.

### `rt/driver/apply-fans.js`

Applies supply and extract fan dimmer states.

### `rt/driver/apply-vvx.js`

Applies VVX switch state.

### `rt/driver/apply-thermal.js`

Applies heat and cool dimmer states.

### `rt/driver/sequence.js`

Defines on/off actuator application sequence.

### `rt/driver/main.js`

Reads, normalizes and applies intent, respects inhibit, logs and self-stops.

## Edge local driver scripts

### `rt/scripts/supply-fan/master_supply_fan_v0_1_0.js`

Local long-running scheduler for supply fan publisher and executor.

### `rt/scripts/supply-fan/executor_supply_fan_v0_1_0.js`

Reads `ftx.intent.dev.sup` and applies supply fan `Light.Set id=0` if needed.

### `rt/scripts/extract-fan/house_air_sensor_watchdog_v0_2_0.js`

Long-running extract fan watchdog for house temperature/RH sensor power cycling.
Also starts `executor_extract_fan_v0_1_0` every 43 seconds in the local-driver
canary.

### `rt/scripts/extract-fan/executor_extract_fan_v0_1_0.js`

Reads `ftx.intent.dev.ext` and applies extract fan `Light.Set id=0` if needed.

### `rt/scripts/heat-dimmer/master_heat_dimmer_v0_1_0.js`

Local long-running scheduler for heat publisher and executor.

### `rt/scripts/heat-dimmer/executor_heat_dimmer_v0_1_0.js`

Reads `ftx.intent.dev.heat` and applies heat dimmer `Light.Set id=0` if needed.

### `rt/scripts/cool-dimmer/master_cool_dimmer_v0_1_0.js`

Local long-running scheduler for cool publisher and executor.

### `rt/scripts/cool-dimmer/executor_cool_dimmer_v0_1_0.js`

Reads `ftx.intent.dev.cool` and applies cool dimmer `Light.Set id=0` if needed.

### `rt/scripts/dampers/master_dampers_v0_1_0.js`

Local long-running scheduler for dampers publisher and executor.

### `rt/scripts/dampers/executor_dampers_v0_1_0.js`

Reads `ftx.intent.dev.dmp` and applies dampers `Switch.Set id=0` if needed.

### `rt/scripts/vvx/executor_vvx_v0_1_0.js`

Reads `ftx.intent.dev.vvx` and applies VVX `Switch.Set id=0` if needed. In the
local-driver canary this one-shot script is scheduled by central
`master_v1_7_0`.

## Reboot chunks

### `rt/reboot/base.js`

Reboot script id/name, fixed ids, wait durations and target device IPs.

### `rt/reboot/main.js`

Stops local scripts, waits, reboots remote devices, waits and reboots local device.

## Memory files

### `memory/ftx-digitalt/00-index.md`

Entry point and current architecture overview.

### `memory/ftx-digitalt/00-file-map.md`

This practical file map.

### `memory/ftx-digitalt/01-architecture-principles.md`

Architecture principles and governance.

### `memory/ftx-digitalt/02-device-topology.md`

Device roles, IPs and topology.

### `memory/ftx-digitalt/03-runtime-model.md`

Runtime scheduling, boot/master/worker model and score dispatcher.

### `memory/ftx-digitalt/04-installer-bootstrap.md`

Mac direct deploy, boot and deployment model.

### `memory/ftx-digitalt/05-script-contracts.md`

Per-script contracts, inputs, outputs and restrictions.

### `memory/ftx-digitalt/06-kvs-and-components.md`

KVS and virtual component contracts.

### `memory/ftx-digitalt/07-control-logic.md`

Current brain/control implementation and future design candidates.

### `memory/ftx-digitalt/08-telemetry-model.md`

Telemetry schemas and run-state semantics.

### `memory/ftx-digitalt/09-weather-model.md`

Weather model notes.

### `memory/ftx-digitalt/10-coding-standards.md`

Coding rules for Shelly/mJS and repo changes.

### `memory/ftx-digitalt/11-debugging-and-known-issues.md`

Known issues and debugging guidance.

### `memory/ftx-digitalt/12-decisions-log.md`

Decision log.

### `memory/ftx-digitalt/99-old-notes.md`

Historical notes that should not be treated as current implementation unless explicitly promoted.
