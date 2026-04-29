# FTX Physical Memory Index

This folder is for the physical FTX aggregate: airflow, pressure, fans, VVX rotor, filters, temperature sensors, condensate risk, measurements and commissioning results.

This area intentionally does not describe Shelly runtime architecture. Digital control belongs in `../ftx-digitalt/`.

## Known scope

- Physical ventilation unit: Karfax TOPIC-12.
- Rotating heat exchanger: Heatex WA0540V-200-020-200-0-220.
- VVX gearmotor: Japan Servo Series H MKII, identified from nameplate.
- Supply/extract airflow and pressure measurement model.
- Sensor placement and temperature channel mapping.
- Condensate/cooling risk model.

## Read order for physical reasoning

Before reasoning about airflow/pressure/VVX/temperature issues, read:

1. `01-system-overview.md`
2. `03-airflow-and-pressure-model.md`
3. `04-fans-and-flow-calibration.md`
4. `05-vvx-rotor-and-efficiency.md`
5. `07-temperature-and-sensor-placement.md`
6. `08-condensate-and-cooling-risk.md`
7. `09-measurement-methods.md`

## Boundary

- Physical facts and measurements belong here.
- Digital runtime, code and KVS contracts belong in `../ftx-digitalt/`.
- Shared Shelly/network/sensor/actuator details belong in `../components/`.