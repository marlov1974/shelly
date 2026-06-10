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

## Current Sensor Add-on temperature mapping

Current G1 runtime mapping after migration to fan Sensor Add-ons:

```text
ftx-supply-fan Sensor Add-on:

temperature:100 = t.to_house
  supply air to house after heating/cooling battery

temperature:101 = t.post_vvx
  supply air after VVX, before heating/cooling battery

temperature:102 = t.out
  outdoor / supply air before VVX proxy

temperature:103 = t.brine
  brine reference

temperature:104 = t.brine_post_shunt
  brine after cooling shunt / chunt toward cooling battery

temperature:105 = t.hotwater
  hot water / heating water reference

temperature:106 = t.hotwater_post_shunt
  hot water after heating shunt / chunt toward heating battery

ftx-extract-fan Sensor Add-on:

temperature:100 = t.to_outdoor
  exhaust air after VVX toward outdoor

temperature:105 = t.house
  house/extract proxy, currently may read N/A

humidity:105 = rh.house
  house RH proxy, currently may read N/A
```

When extract `temperature:105` or `humidity:105` reads N/A/error, Gen1 poll uses safe placeholders: `t.house=20.0 C` and `rh.house=60%`.

## Design principle

Before changing control logic based on temperature, verify that the sensor represents the intended physical point.
