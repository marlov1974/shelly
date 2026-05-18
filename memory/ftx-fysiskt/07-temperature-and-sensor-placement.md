# Temperature and Sensor Placement

## Canonical temperature channels

FTX telemetry uses:

```text
t.house       house/extract air before VVX
t.out         outdoor/supply air before VVX
t.post_vvx    supply air after VVX before battery
t.to_house    supply air to house after battery
t.to_outdoor  exhaust air after VVX to outdoor
t.brine       brine or cooling water reference
t.brine_post_shunt       brine after cooling shunt / chunt toward cooling battery
t.hotwater    heating water reference
t.hotwater_post_shunt    heating water after heating shunt / chunt toward heating battery
```

## Interpretation rule

A temperature channel is only meaningful together with sensor placement. Do not treat it as a perfect thermodynamic node if the sensor is exposed to ambient air, poorly insulated or affected by radiation.

## Known issue: water temperature measurement

Observed water temperature can be distorted if the thermometer is not insulated from surrounding air. Insulating the sensor/meter against air can materially improve the reading.

## House temperature

`t.house` is measured from extract/from-house air before VVX and acts as the house proxy for control logic.

## Outdoor proxy

The supply-side pre-VVX temperature acts as outdoor-air proxy when properly placed.

## Extract UNI temperature mapping

Current G1 extract UNI temperature mapping:

```text
temperature:100 = t.to_house
  unchanged; supply air to house after battery

temperature:101 = t.brine
  unchanged; brine reference before shunt/blending

temperature:102 = t.brine_post_shunt
  brine after cooling shunt / chunt toward cooling battery

temperature:103 = t.hotwater
  hot water / heating water reference before shunt/blending

temperature:104 = t.hotwater_post_shunt
  hot water after heating shunt / chunt toward heating battery
```

Notes:

```text
- temperature:102 used to be interpreted as hotwater in older G1 poll code.
- after the sensor move/install, hotwater is now temperature:103.
- post-shunt/chunt temperatures are available for diagnostics and later control logic.
```

## Design principle

Before changing control logic based on temperature, verify that the sensor represents the intended physical point.
