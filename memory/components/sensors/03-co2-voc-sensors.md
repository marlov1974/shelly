# CO2/VOC Sensors

## Sensor behavior

The installed air-quality sensor reports a ppm-like value that may be the maximum or combined interpretation of CO2 and VOC channels. VOC events can therefore appear as high ppm.

## Current known role

- Used as house air-quality input for FTX control.
- Connected through the FTX sensor/UNI architecture.
- Exact model is not yet documented in memory and should be added from label/order information.

## Known VOC sources

- Hair spray can create high VOC readings for roughly an hour or more.
- Perfume tests produced visible VOC response.
- Ethanol-based brine spill can plausibly elevate VOC readings for several days.

## Interpretation rule

Do not interpret every high ppm value as human CO2. For VOC/CO2 combined sensors, distinguish occupancy-driven CO2 from chemical/VOC events when making control decisions.

## Control implication

CO2/VOC signal can be used for ventilation demand, but the control logic may need:

- smoothing
- event detection
- cap/decay behavior for short VOC events
- separate interpretation of long occupancy-driven CO2 vs short chemical spikes

## Open detail

Add when known:

```text
Manufacturer:
Model:
Output signal:
Scaling:
Supply voltage:
Which Shelly/UNI input:
Whether ppm is CO2, VOC-equivalent, max value, or combined vendor algorithm:
```