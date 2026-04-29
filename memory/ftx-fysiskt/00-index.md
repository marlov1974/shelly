# FTX Physical Memory Index

This folder is for the physical FTX aggregate: airflow, pressure, fans, VVX rotor, filters, temperature sensors, condensate risk, measurements, hardware inventory, cable routing and commissioning results.

This area intentionally does not describe Shelly runtime architecture. Digital control belongs in `../ftx-digitalt/`.

## Known scope

- Physical ventilation unit: Karfax TOPIC-12.
- Rotating heat exchanger: Heatex WA0540V-200-020-200-0-220.
- VVX gearmotor: Japan Servo Series H MKII, identified from nameplate.
- Damper actuators: Siemens GCA121.1E.
- Supply/extract airflow and pressure measurement model.
- Sensor placement and temperature channel mapping.
- Condensate/cooling risk model.
- Hardware retained/bought/installed around the FTX.
- Baseline measurements before and after relevant hardware changes.
- Cable routing and electrical/noise notes.

## Read order for physical reasoning

Before reasoning about airflow/pressure/VVX/temperature issues, read:

1. `01-system-overview.md`
2. `02-hardware-inventory.md`
3. `03-airflow-and-pressure-model.md`
4. `04-fans-and-flow-calibration.md`
5. `05-vvx-rotor-and-efficiency.md`
6. `07-temperature-and-sensor-placement.md`
7. `08-condensate-and-cooling-risk.md`
8. `09-measurement-methods.md`
9. `13-baseline-measurements.md`
10. `14-cable-routing-and-electrical-notes.md`

## Boundary

- Physical facts and measurements belong here.
- Digital runtime, code and KVS contracts belong in `../ftx-digitalt/`.
- Shared Shelly/network/sensor/actuator details belong in `../components/`.