# Temperature and Sensor Placement

## Principle

Each temperature value represents a physical sensor location. Do not treat the name as a perfect abstract air-stream value unless the placement is known.

## Current temperature channel mapping

Supply UNI mapping:

```text
temperature:100 -> temp_supply_post_vvx_c
temperature:101 -> temp_outdoor_c
temperature:102 -> temp_exhaust_to_outdoor_c
```

Extract UNI mapping:

```text
temperature:100 -> temp_supply_to_house_c
temperature:101 -> temp_brine_c
temperature:102 -> temp_hotwater_c
```

These mappings reflect actual wiring after sensors were mounted inside the cabinet.

## Digital telemetry names

The digital telemetry object uses:

```text
t.house       = house/extract air reference
t.out         = outdoor air reference
t.to_house    = supply to house after battery
t.post_vvx    = supply after VVX before battery
t.to_outdoor  = exhaust to outdoor after VVX
t.brine       = brine/water temperature reference
t.hotwater    = hot water temperature reference
```

## Installed/available sensors

The project has 5 DS18B20 temperature sensors intended for Shelly The Pill / UNI style temperature measurement of air and heating/cooling battery water.

## Caution

Water temperature sensors can be influenced by surrounding air temperature if not insulated. Interpret water temperature cautiously unless the sensor is thermally coupled to the pipe and insulated from air.