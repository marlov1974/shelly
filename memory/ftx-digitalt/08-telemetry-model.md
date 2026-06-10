# Telemetry Model

## Source

`poll` reads Shelly device statuses and writes normalized telemetry to KVS. Current Gen1 FTX telemetry comes from Shelly Pro Sensor Add-ons on the supply and extract fan dimmers, not from the retired UNI devices.

## Measured telemetry: `ftx.tel.m`

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

RPM script-counter testing was rejected: tach events are too fast for stable Shelly script handling at fan rates, and the physical input path may filter or distort fast pulses. Runtime keeps `rpm.sup`, `rpm.ext` and `rpm.vvx` as intentional zero placeholders until firmware counter support or a different hardware solution exists.
