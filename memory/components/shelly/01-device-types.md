# Shelly Device Types

## Devices used or referenced

- Shelly Plus UNI: sensor inputs, 0-10 V readings, temperature/humidity, RPM pulse input, local switch outputs/LEDs.
- Shelly Pro Dimmer 0-10V: fan dimming and 0-10 V valve/actuator control.
- Shelly Pro 1PM: switching and power metering for loads such as pumps or VVX where applicable.
- Shelly virtual components: persistent UI/control points such as boolean, enum, number and text components.

## FTX device roles

Known FTX role pattern:

- supply UNI
- extract UNI
- process UNI
- supply fan dimmer
- extract fan dimmer
- heat valve/dimmer
- cool valve/dimmer
- VVX switch
- dampers control

## Design rule

Use Shelly devices as small edge devices with clear responsibility. Avoid turning a single script into a framework that owns too much behavior.