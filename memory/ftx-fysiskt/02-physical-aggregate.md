# Physical Aggregate

## Known aggregate

- Unit: Karfax TOPIC-12.
- Heat exchanger: rotating VVX, Heatex WA0540V-200-020-200-0-220.
- VVX drive: Japan Servo AC gearmotor with external/aggregate-side capacitor arrangement likely used.

## Main air streams

Conceptual temperature positions used by the digital system:

- `house`: extract air from house before VVX.
- `out`: outdoor air before VVX.
- `post_vvx`: supply air after VVX before heating/cooling battery.
- `to_house`: supply air after battery toward house.
- `to_outdoor`: extract/exhaust air after VVX toward outdoor.

## Actuated elements

- Supply fan.
- Extract fan.
- VVX motor/switch.
- Heating battery control.
- Cooling battery control.
- Dampers.

## Physical interpretation rule

Telemetry is position-specific. Do not treat a measured temperature as a generic system temperature unless its physical sensor location is known.