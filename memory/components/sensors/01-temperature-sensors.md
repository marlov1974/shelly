# Temperature Sensors

## FTX temperature channels

Canonical FTX telemetry temperature structure:

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
  }
}
```

## Placement meaning

Temperature values represent physical sensor placement, not abstract ideal states. Sensor insulation, air exposure and mounting can materially affect readings.

## Heat pump/floor system principle

Preferred measurements per heat pump/floor circuit:

- supply temperature to floor heating/cooling
- return temperature
- possibly DHW/hot water temperature if physically accessible