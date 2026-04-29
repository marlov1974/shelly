# Known Issues and Maintenance

## Condensate drain risk

Cooling operation has a known condensate drain risk because the drain is an open hose to a floor drain without a confirmed water trap. High airflow can cause reverse airflow and hinder drainage.

Maintenance/validation:

- verify tray drainage at relevant fan speeds
- inspect for pooling and leakage after cooling operation
- consider water trap or water level sensor

## Filter sensitivity

Filter condition affects pressure, flow and fan balance. Filter changes should be documented with before/after pressure and flow data where possible.

## Sensor interpretation

Temperature sensors must be interpreted by physical placement. Water/pipe sensors should be insulated from air to reduce false readings.

## VVX motor/control

The VVX motor is a small AC geared induction motor. Current control is on/off. Do not assume analog speed control unless hardware is changed and verified.

## Airflow calibration

Runtime l/s values depend on calibration assumptions. Recalibrate or validate after major physical changes such as filter change, fan change, ducting change or damper adjustment.