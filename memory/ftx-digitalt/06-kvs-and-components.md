# KVS and Virtual Components

## KVS principles

KVS is used for runtime data sharing between one-shot scripts. It is not used as durable installer-version storage because KVS has shown unreliable persistence across reboot.

Installer device-version state is stored in `text:200`.

## KVS keys

### `ftx.tel.m`

Measured/normalized telemetry from `poll`.

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

Actual actuator states from `poll`.

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

### `ftx.weather.act`

Weather reference object from `weather`.

```json
{
  "solar_kwh_today": 0,
  "temp_now": 0
}
```

### `ftx.intent.act`

Final control intent from `brain`, later consumed by `driver`.

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

### `ftx.mode_forced_state`

Runtime state for forced-mode timeout/counter. This is not the command. The command comes from `enum:200 Mode`.

## Virtual components

### Installer/device owned

- `text:200` Installer state. Example: `{"dv":1,"ok":1}`.

### Brain owned

- `boolean:200` On
- `boolean:201` Nightmode
- `enum:200` Mode, values: `STD`, `BST`, `FIRE`, `MAN`
- `number:200` Temp, house setpoint
- `number:204` Target to house

### State owned

- `number:201` Total power, W
- `number:202` VVX efficiency, %
- `number:203` Fan avg pct, %

## Explicit correction

`number:201` is Total power. It is not fan flow average. Average l/s has not been agreed as a virtual component and should remain in `ftx.tel.m.ls.sup/ext` unless explicitly added later.

## Logging

No runtime logging should use Text components. Logging is print-only through `log()`.