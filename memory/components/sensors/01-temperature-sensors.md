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

## Physical meaning

```text
t.house       extract/from-house air before VVX
t.out         outdoor/supply air before VVX
t.post_vvx    supply air after VVX before battery
t.to_house    supply air to house after battery
t.to_outdoor  exhaust air after VVX to outdoor
t.brine       brine/cooling reference
t.hotwater    hot water/heating reference
```

## Cable mapping for external thermometers

Known 4 m Cat6 cable mapping for external thermometers:

```text
all white wires = GND
brown = VCC
orange = data
blue/brown pair unused
```

Known uses:

- hot water
- brine
- supply air to house

## Placement meaning

Temperature values represent physical sensor placement, not abstract ideal states. Sensor insulation, air exposure and mounting can materially affect readings.

## Known water-temperature issue

Observed water temperature can be distorted if the thermometer is not insulated from surrounding air. Insulating the sensor/meter against air can materially improve the reading.

## AM2302 / AM2302B notes

AM2302-class temperature/humidity sensor has shown hanging behavior and can recover when VCC is power-cycled.

Known/considered mitigation:

- AM2302B considered as a more stable replacement
- about 4.7 kohm pull-up between data and VCC, close to the sensor
- possible VCC power control through a UNI output if electrically suitable

## Heat pump/floor system principle

Preferred measurements per heat pump/floor circuit:

- supply temperature to floor heating/cooling
- return temperature
- possibly DHW/hot water temperature if physically accessible