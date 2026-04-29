# Known Issues and Maintenance

## Sensors hanging

AM2302-class temperature/humidity sensor has shown hanging behavior and can recover when VCC is power-cycled. Pull-up resistor and power reset strategies have been discussed.

## Electrical/noise considerations

Signal wiring near 230 V can pick up noise. Use practical separation, short parallel runs where possible, and shielded cable where justified. Grounding the metal cabinet may improve stability.

## VOC events

Hair spray, perfume and ethanol/brine spill can produce elevated VOC/ppm-like readings. Avoid treating these as normal occupancy CO2 events.

## Filters

Filter condition materially affects pressure, flow and balance. Filter replacement should be logged and considered when comparing measurements.

## VVX motor

VVX motor is an old AC gearmotor. Treat as on/off unless future testing proves otherwise. Watch for rotor movement and RPM confirmation rather than assuming command equals run.

## Condensate

Cooling must remain conservative until condensate path and drainage are confirmed safe.