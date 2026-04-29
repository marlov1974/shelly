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
t.hotwater    heating water reference
```

## Interpretation rule

A temperature channel is only meaningful together with sensor placement. Do not treat it as a perfect thermodynamic node if the sensor is exposed to ambient air, poorly insulated or affected by radiation.

## Known issue: water temperature measurement

Observed water temperature can be distorted if the thermometer is not insulated from surrounding air. Insulating the sensor/meter against air can materially improve the reading.

## House temperature

`t.house` is measured from extract/from-house air before VVX and acts as the house proxy for control logic.

## Outdoor proxy

The supply-side pre-VVX temperature acts as outdoor-air proxy when properly placed.

## Design principle

Before changing control logic based on temperature, verify that the sensor represents the intended physical point.