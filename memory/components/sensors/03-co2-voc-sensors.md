# CO2/VOC Sensors

## Sensor behavior

The installed air-quality sensor reports a ppm-like value that may be the maximum or combined interpretation of CO2 and VOC channels. VOC events can therefore appear as high ppm.

## Known VOC sources

- Hair spray can create high VOC readings for roughly an hour or more.
- Perfume tests produced visible VOC response.
- Ethanol-based brine spill can plausibly elevate VOC readings for several days.

## Interpretation rule

Do not interpret every high ppm value as human CO2. For VOC/CO2 combined sensors, distinguish occupancy-driven CO2 from chemical/VOC events when making control decisions.