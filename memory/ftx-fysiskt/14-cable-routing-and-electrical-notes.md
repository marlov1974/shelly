# Cable Routing and Electrical Notes

This file captures practical cable-routing and electrical details that are easy to lose but important for debugging.

## General principle

Signal wiring for 0-10 V, sensors and RPM should be kept separate from 230 V wiring where practical. Short parallel runs may work, but should be treated as possible noise sources if readings are unstable.

## Known discussion points

- 0.34 mm2 control cable is reasonable for low-current 0-10 V / sensor wiring.
- 0-10 V signal cable running in parallel with 230 V for short distances can pick up noise.
- The relevant 230 V cable in one discussion was before the EC fan drive, so mainly 50 Hz rather than high-frequency motor output.
- Separation of 1 cm is better than 5 mm, but practical routing and shielding also matter.
- Shielded Cat6 can be used as signal cable if the shield is grounded sensibly.
- Grounding the metal FTX cabinet improved the electrical reference/noise situation and may help sensor stability.

## Cabinet grounding

The FTX cabinet is metal. Grounding the cabinet is considered important both for safety and for reducing electrical noise/instability.

Observed debugging note: after power cycling the cabinet following grounding work, a previously stuck sensor restarted without physically touching its VCC wire. This suggests power-cycling/reset behavior may have been part of the recovery, not only a loose contact.

## Sensor power reset issue

AM2302-class temperature/humidity sensor has shown hanging behavior and can recover when VCC is interrupted and restored.

Potential mitigation concepts:

- pull-up resistor around 4.7 kohm between data and VCC, close to the sensor
- powering the sensor VCC via a controllable UNI output if electrically suitable
- explicit sensor power-cycle logic if the sensor stops responding

## 24 V AC / damper wiring

Siemens GCA121.1E damper actuator uses:

```text
G/G0, 24 V AC
1 = RD
2 = BK
```

Treat G/G0 as the 24 V AC supply pair. Do not assume DC polarity semantics unless the device/manual explicitly requires it.

## Routing documentation gap

The exact physical cable routes are not yet fully documented. Future updates should record:

- cable from each Shelly device to each sensor/actuator
- whether cable is shielded
- where shield/drain is grounded
- where cables run near 230 V
- approximate parallel-run length with mains wiring
- terminal numbers and wire colors
- which cabinet gland/duct each cable uses

## Recommended format for future cable entries

```text
Cable ID:
From:
To:
Signal/power type:
Cable type:
Conductors used:
Shield grounding:
Route:
Parallel 230 V exposure:
Terminal mapping:
Notes:
```