# KVS and Virtual Components

## KVS principles

KVS is used for runtime data sharing between one-shot scripts. It is not used as durable deploy-version storage because KVS has shown unreliable persistence across reboot.

Mac direct-deploy device-version state is stored in persistent `text:200`.

Runtime logs are print-only via `log()`/`print()`. Text components are not used for runtime logs.

## KVS keys

### `ftx.tel.dev.*`

Primary current telemetry. Edge devices publish one key per device to the VVX
runtime host:

```text
ftx.tel.dev.sup
ftx.tel.dev.ext
ftx.tel.dev.heat
ftx.tel.dev.cool
ftx.tel.dev.dmp
ftx.tel.dev.vvx
```

Each key has `v`, `device`, `uptime_s`, and device-specific telemetry. Fan and
dimmer devices include `act`; fan devices include pressure/temperature fields;
VVX and dampers include switch actuals. RPM is intentionally `0` where present.

Edge publish thresholds:

```text
pressure Pa  >= 10
temperature  >= 0.2 C
power W      >= 2
ppm          >= 20
RH           >= 2 percentage points
act pct      >= 1 percentage point
act on       exact change
```

If any field crosses threshold, the publisher writes the complete device
payload. Publishers also republish every 10 minutes as a low-rate heartbeat.

### `ftx.tel.m`

Compatibility aggregate measured/normalized telemetry built by `state` from
`ftx.tel.dev.*`.

Shape:

```json
{
  "t": {
    "house": 0,
    "out": 0,
    "to_house": 0,
    "post_vvx": 0,
    "to_outdoor": 0,
    "brine": 0,
    "hotwater": 0
  },
  "rpm": {
    "sup": 0,
    "ext": 0,
    "vvx": 0
  },
  "pa": {
    "sup": 0,
    "ext": 0
  },
  "ls": {
    "sup": 0,
    "ext": 0
  },
  "ppm": {
    "house": 0
  },
  "rh": {
    "house": 0
  }
}
```

### `ftx.tel.act`

Compatibility aggregate actual actuator states built by `state` from
`ftx.tel.dev.*`.

```json
{
  "sup":  { "on": 0, "pct": 0, "w": 0 },
  "ext":  { "on": 0, "pct": 0, "w": 0 },
  "vvx":  { "on": 0, "w": 0 },
  "heat": { "on": 0, "pct": 0, "w": 0 },
  "cool": { "on": 0, "pct": 0, "w": 0 },
  "dmp":  { "on": 0 }
}
```

Important: `pct` may be non-zero even when `on=0`. Consumers must treat `on=0` as dominant.

### `ftx.state.run`

Derived run booleans from `state`.

```json
{
  "sup": 0,
  "ext": 0,
  "vvx": 0,
  "heat": 0,
  "cool": 0,
  "dmp": 0
}
```

### `ftx.state.hist`

Short persisted history used for VVX efficiency smoothing.

Current shape:

```json
{
  "r0": 0,
  "r1": 0,
  "r2": 0
}
```

### `ftx.weather.act`

Weather reference object from `weather`.

```json
{
  "solar_kwh_today": 0,
  "temp_now": 0
}
```

### `ftx.intent.act`

Final full desired actuator state from `brain`. In the local-driver canary it is
kept as a legacy compatibility and rollback contract; central `driver` is
installed but not scheduled.

```json
{
  "driver_inhibit": 0,
  "sup":  { "on": 0, "pct": 0 },
  "ext":  { "on": 0, "pct": 0 },
  "vvx":  { "on": 0 },
  "heat": { "on": 0, "pct": 0 },
  "cool": { "on": 0, "pct": 0 },
  "dmp":  { "on": 0 }
}
```

This is a full desired state, not a delta.

### `ftx.intent.dev.*`

Per-device desired actuator state from `brain`, consumed by local device
executors on each physical actuator device.

Keys:

```text
ftx.intent.dev.sup
ftx.intent.dev.ext
ftx.intent.dev.heat
ftx.intent.dev.cool
ftx.intent.dev.dmp
ftx.intent.dev.vvx
```

Typical fan/dimmer shape:

```json
{
  "v": 1,
  "source": "brain",
  "ts": 1710000000,
  "device": "sup",
  "mode": "STD",
  "driver_inhibit": 0,
  "act": { "on": 1, "pct": 35 }
}
```

Typical switch shape:

```json
{
  "v": 1,
  "source": "brain",
  "ts": 1710000000,
  "device": "dmp",
  "mode": "STD",
  "driver_inhibit": 0,
  "act": { "on": 1 }
}
```

The per-device intent is a full desired state for one physical device, not a
delta. Local executors ignore missing, malformed, inhibited or stale intents.
The `ts` field is Unix time in seconds. The initial stale TTL is 300 seconds.
Executors read their current local output first and only call the local output
RPC if the desired state differs.

### `ftx.mode_forced_state`

Runtime state for forced-mode timeout/counter. This is not the command. The command comes from `enum:200 Mode`.

Typical shape:

```json
{
  "mode": "STD",
  "cycles": 0
}
```

## Virtual components

### Mac deploy/device owned

Updated by `tools/g1_vvx_deploy.py` after a verified deploy:

```text
text:200 Deploy state
```

Example value:

```json
{"dv":11,"ok":1}
```

### Brain owned

Defined in `rt/recipes/brain.json`:

```text
boolean:200 On
boolean:201 Nightmode
enum:200    Mode = STD, BST, FIRE, MAN
number:200  Temp, C
number:204  Target to house, C
```

### State owned

Defined in `rt/recipes/state.json`:

```text
number:201 Total power, W
number:202 VVX efficiency, %
number:203 Fan avg pct, %
```

## Explicit corrections

`number:201` is Total power. It is not fan average, fan flow average or l/s.

Average l/s is not currently a virtual component. Flow values remain in `ftx.tel.m.ls.sup` and `ftx.tel.m.ls.ext` unless a new component is explicitly added later.

## Component drift principle

Mac direct deploy should not aggressively mutate, rename or delete existing virtual components during normal deployment because component names/settings may be visible in Homey/UI/manual workflows.

If a component was created earlier with an obsolete name, direct deploy should not automatically rename it unless the change is explicitly in scope. The code-level semantic contract in this file and in the recipes is the source of truth.
