# Telemetry Model

## Source

`poll` reads Shelly device statuses and writes normalized telemetry to KVS. Sensor conversion is generally performed on edge UNI devices where possible, so poll reads engineering values rather than raw volts/Hz when available.

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
    "sup": 1548,
    "ext": 1560,
    "vvx": 16
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

## Normalization

Typical normalization targets:

- temperature: one decimal
- RH: integer percent
- CO2/VOC ppm: integer
- pressure Pa: integer
- flow l/s: integer
- fan RPM: integer
- VVX RPM: integer
- power W: integer

## Edge conversions

Shelly Plus UNI devices should perform onboard conversions where configured:

- 0–10V to Pa for pressure
- Hz to RPM for fan/VVX rotational signals
- 0–10V to CO2/VOC ppm

Poll should not duplicate these conversions unless edge conversion is unavailable.