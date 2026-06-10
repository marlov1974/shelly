# Telemetry Model

## Source

Physical Shelly devices publish their own telemetry to the VVX runtime host.
Central `poll` is retired from the active master schedule.

Current primary telemetry keys:

```text
ftx.tel.dev.sup
ftx.tel.dev.ext
ftx.tel.dev.heat
ftx.tel.dev.cool
ftx.tel.dev.dmp
ftx.tel.dev.vvx
```

The `state` worker reads those per-device keys, derives run/performance state,
and writes compatibility aggregate telemetry to `ftx.tel.m`, `ftx.tel.x` and
`ftx.tel.act`.

## Per-device telemetry examples

Supply fan:

```json
{
  "v": 1,
  "device": "sup",
  "uptime_s": 123,
  "act": { "on": 1, "pct": 50, "w": 47 },
  "pa": 158,
  "rpm": 0,
  "temp": {
    "to_house": 18.3,
    "post_vvx": 17.8,
    "out": 8.8,
    "brine": 12.4,
    "brine_post_shunt": 13.1,
    "hotwater": 19.7,
    "hotwater_post_shunt": 20.1
  }
}
```

Extract fan:

```json
{
  "v": 1,
  "device": "ext",
  "uptime_s": 123,
  "act": { "on": 1, "pct": 57, "w": 48 },
  "pa": 148,
  "rpm": 0,
  "temp": { "to_outdoor": 11.3, "house": 19.9 },
  "rh": { "house": 42 },
  "ppm": { "house": 658 }
}
```

## Compatibility measured telemetry: `ftx.tel.m`

```json
{
  "t": {
    "house": 19.9,
    "out": 8.8,
    "to_house": 18.3,
    "post_vvx": 17.8,
    "to_outdoor": 11.3,
    "brine": 12.4,
    "hotwater": 19.7
  },
  "rpm": {
    "sup": 0,
    "ext": 0,
    "vvx": 0
  },
  "pa": {
    "sup": 158,
    "ext": 148
  },
  "ls": {
    "sup": 146,
    "ext": 147
  },
  "ppm": {
    "house": 658
  },
  "rh": {
    "house": 42
  }
}
```

## Actual actuator telemetry: `ftx.tel.act`

```json
{
  "sup":  { "on": 1, "pct": 50, "w": 47 },
  "ext":  { "on": 1, "pct": 57, "w": 48 },
  "vvx":  { "on": 1, "w": 30 },
  "heat": { "on": 0, "pct": 12, "w": 0 },
  "cool": { "on": 0, "pct": 100, "w": 0 },
  "dmp":  { "on": 1 }
}
```

Note: `pct` can remain non-zero even when `on=0`. Consumers must treat `on=0` as dominant.

## Flow values

`ls.sup` and `ls.ext` are stored in KVS. There is no agreed virtual component for average l/s. If average flow is needed in UI later, it must be explicitly added as a new decision.

## Power values

State computes total power and writes it to `number:201`. It is not a flow value.

Total power includes measured and estimated components, including idle and damper estimates when applicable.

## Run state

`state` derives run booleans and writes `ftx.state.run`:

```json
{
  "sup": 1,
  "ext": 1,
  "vvx": 1,
  "heat": 0,
  "cool": 0,
  "dmp": 1
}
```

Current run detection does not use RPM. Fan run uses:

```text
fan on + pct > 10 + pressure >= 5 Pa + measured fan power >= 5 W
```

VVX run uses:

```text
vvx on + measured power >= 10 W
```

## Normalization

Typical normalization targets:

- temperature: one decimal
- RH: integer percent
- CO2/VOC ppm: integer
- pressure Pa: integer
- flow l/s: integer
- fan RPM: integer, currently schema-compatible placeholder `0`
- VVX RPM: integer, currently schema-compatible placeholder `0`
- power W: integer

## Sensor Add-on conversions

Sensor Add-on analog inputs currently expose engineering values through `input:<id>.xpercent`:

- supply fan `input:100` / `Supply Pa 100` = supply Pa
- extract fan `input:100` / `Extract pa 100` = extract Pa
- extract fan `input:101` / `House ppm 101` = house CO2/VOC ppm-equivalent

Extract fan `switch:100` powers the house temp/RH sensor. Script
`house_air_sensor_watchdog_v0_1_0` on the extract fan checks once per minute and
cycles that switch off for 10 seconds if `temperature:105.tC` or
`humidity:105.rh` is missing, `null`, `n/a` or exactly zero.

RPM script-counter testing was rejected: tach events are too fast for stable Shelly script handling at fan rates, and the physical input path may filter or distort fast pulses. Runtime keeps `rpm.sup`, `rpm.ext` and `rpm.vvx` as intentional zero placeholders until firmware counter support or a different hardware solution exists.
