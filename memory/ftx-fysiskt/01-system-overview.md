# Physical System Overview

## Aggregate

The physical FTX unit is a Karfax TOPIC-12 ventilation aggregate.

Known major functions:

- supply air fan
- extract air fan
- rotating VVX heat exchanger
- heating battery
- cooling battery
- dampers
- condensate drain/tray

## Rotating heat exchanger

The VVX is identified as:

```text
Heatex WA0540V-200-020-200-0-220
```

The VVX is driven by a small AC gearmotor. See `05-vvx-rotor-and-efficiency.md` and `components/actuators/05-vvx-motor.md`.

## Digital/physical boundary

The physical aggregate provides temperatures, pressures, fan RPM, VVX RPM, CO2/VOC and humidity to the digital control system.

The digital system controls:

- fan dimming
- heating valve/dimmer
- cooling valve/dimmer
- VVX on/off
- dampers

## Important physical constraints

- Cooling is constrained by condensate drain risk.
- VVX is effectively on/off in current design.
- Fan flow/pressure calibration is empirical and must not be overinterpreted.
- Sensor placement matters; temperature values represent specific physical positions, not abstract perfect air streams.