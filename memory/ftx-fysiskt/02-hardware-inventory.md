# Physical FTX Hardware Inventory

This file captures small but important hardware facts for the physical FTX installation: brands, models, roles, signals, electrical data and practical notes.

## Aggregate

- Physical unit: Karfax TOPIC-12.
- Type: FTX ventilation aggregate with rotating heat exchanger, supply/extract fans, heating battery, cooling battery and dampers.
- Practical current maximum airflow after modifications: about 250 l/s.
- Historical reference maximum with older fans, clean filters and open terminals: about 300 l/s.

## Rotating heat exchanger / VVX rotor

- Rotating heat exchanger: Heatex WA0540V-200-020-200-0-220.
- Function: rotating heat recovery wheel.
- Measurement: VVX RPM is measured as rotor pulse/RPM in the digital system.
- Run semantics: `vvx.run = 1` iff switch is on and measured RPM is above threshold.

## VVX motor

Motor identified from nameplate:

```text
Manufacturer: Japan Servo Co., Ltd.
Series: H MKII
Gearbox: 8H12.5FBN-2
Gear ratio: 12.5:1
No: 3417
Motor: IHT8PF25N-1
Type: geared induction motor
Power: 25 W
Voltage: 220 V AC
Current: 0.28 A
Frequency: 50 Hz
Duty: continuous
Motor speed before gearbox: 70-1400 rpm
Run capacitor: 12 uF
```

Wiring observation:

```text
2 supply conductors + protective earth to chassis
```

Control implication: treat as AC on/off unless future hardware proves safe variable-speed operation. Pulsing is possible conceptually but must be coordinated with heat control so the heating battery does not compensate during VVX off-periods.

## Current EC fans

Purchased/installed fans:

```text
Supply fan: ebm-papst RadiCal K3G250-RE07-07
Extract fan: ebm-papst RadiCal K3G250-RE09-07
```

Known common facts:

- Both are ebm-papst RadiCal EC fans.
- Both are similar in physical/electrical design.
- Both have tach output.
- Tach output is open collector.
- Tach output gives 1 pulse per revolution.
- Tach output is used for RPM measurement in the control system.
- Fan speed is controlled through 0-10 V / dimmer percentage in the digital model.

Canonical fan run semantics:

```text
fan.run = 1 iff switch = 1 and pct > 10 and rpm > 250
```

Known current fan calibration:

```text
K_SUPPLY_FAN = 11.6
K_EXTRACT_FAN = 12.1
lps = K * sqrt(Pa)
```

Current normal fan balance rule:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

Earlier empirical relationship, now superseded:

```text
supply_pct = 1.0333 * extract_pct - 3.667
```

## Original/previous AC fan motors

Original/previous fan motor information, verified from nameplate/photos:

```text
Manufacturer: Rosenberg Ventilatoren
Motor type: ED 106-50-2 AA2 KS0,6
Article no: L02-10665
Supply: 230 V, 50 Hz, single-phase AC
Insulation class: F
Protection class: IP54
Motor type: capacitor motor with external run capacitor
Bearing: standard 6002, 15 x 32 x 9 mm
Shaft diameter: 15 mm
Bearing seat: 32 mm
External run capacitor: ICAR Ecofill, 14 uF +/-5%, AC 450 V
Capacitor label also indicated 400/500 V, 50/60 Hz
```

These motors were used as supply and extract fans in the Karfax TOPIC-12 before the EC fan modernization.

## Damper actuators

Identified damper actuator:

```text
Siemens GCA121.1E
Supply: 24 V AC +/-20%, 50/60 Hz
Power: 8 VA
Spring return: yes
Type: NC
Torque: 16 Nm
Rotation: 90 degrees
Runtime motor: 90 s
Runtime spring return: 15 s
Protection: IP60
Connections: G/G0
Wires: 1=RD, 2=BK
```

Used for supply and extract dampers.

Current physical/digital decision:

- supply and extract dampers are wired/controlled together as one actuator group
- controlled through one switch output in the digital model
- digital semantics: `dmp.run = 1` iff damper switch is active

## Damper transformer

```text
Manufacturer/model: Hager Safety Transformer ST314
Function: 230 V to 12/24 V AC transformer
Power: 40 VA
Use: 24 V AC supply for damper actuators
```

## Heating and cooling valve actuators

Identified valve actuator from photos:

```text
Manufacturer: Siemens Building Technologies AG
Product family/label: HVAC Products
Model: SSB61
Supply: AC 24 V +/-20%, 50/60 Hz
Control signal: DC 0-10 V
Power: 2.5 VA
Runtime: 150 s
Country marking: Assembled in Sweden
Wire 1 red: G
Wire 8 grey: Y
Wire 2 black: G0
```

Role mapping from physical appearance:

```text
Cooling actuator: the clean SSB61 actuator
Heating actuator: the dirty SSB61 actuator
```

Known physical functions:

- heating battery with 0-10 V valve control and pump/load switching/power measurement in the digital model
- cooling battery with 0-10 V valve control and pump/load switching/power measurement in the digital model

Known control constraint:

- cooling is constrained by condensate/drain risk and should remain conservative until drainage is fully verified
- valve percentage is not the same as delivered thermal power

Open detail:

- exact pipe/rör dimensions for the 0-10 V water valves should be added when confirmed

## Sensors retained/used

Current known sensor classes:

- differential pressure sensors, 0-10 V, for supply/extract pressure
- fan RPM pulse/frequency measurements
- VVX rotor RPM pulse measurement, 1 pulse/rotation principle
- temperature sensors for outdoor/pre-VVX, house/extract, post-VVX, to-house, to-outdoor, brine and hotwater references
- CO2/VOC/RH sensor for house air quality

## CO2/VOC/PPM sensor

Identified PPM/CO2 sensor:

```text
Manufacturer: Siemens
Model: QPM2102
Role: house air-quality / ppm input for FTX control
```

Known behavior:

The air-quality sensor can report high ppm-like values from VOC events, not only human CO2. Known triggers:

- hair spray
- perfume
- ethanol/brine spill

Control implication: avoid treating all high ppm readings as occupancy-driven CO2. VOC-event handling or smoothing may be needed.

Open detail:

- exact ppm scaling and whether the value is max(CO2,VOC) or another combined representation should be documented

## Temperature/humidity sensors

Known issue:

- AM2302-class temperature/humidity sensor has shown hanging behavior
- sensor can recover when VCC is interrupted and restored
- AM2302B has been considered as a more stable replacement
- suggested pull-up: about 4.7 kohm between data and VCC, close to the sensor
- possible mitigation: power VCC via controllable UNI output if electrically suitable

Cable note for external thermometers:

```text
4 m Cat6 cable
all white wires = GND
brown = VCC
orange = data
blue/brown pair unused
```

Known external thermometer uses include:

- hot water
- brine
- supply air to house

## Pressure sensors

Identified pressure sensors:

```text
Manufacturer: Siemens
Model: QBM2030-5
Quantity: 2
Role: supply and extract differential pressure measurement
Signal: 0-10 V pressure measurement to Shelly Plus UNI
```

Known runtime usage:

- supply pressure channel to `ftx-supply-uni`
- extract pressure channel to `ftx-extract-uni`
- converted to Pa and l/s in poll/runtime logic

Open detail:

- confirm exact measurement range interpretation for QBM2030-5 in current wiring/config
- confirm which physical sensor is supply vs extract if not obvious from installation

## Shelly/edge hardware used around FTX

Known device roles/IPs:

```text
192.168.77.10  ftx-supply-fan
192.168.77.11  ftx-extract-fan
192.168.77.12  heat
192.168.77.13  cool
192.168.77.20  ftx-supply-uni
192.168.77.21  ftx-extract-uni
192.168.77.22  ftx-process-uni
192.168.77.30  ftx-dampers / hub
192.168.77.40  VVX control
```

Shelly Plus UNI usage:

```text
ftx-supply-uni:
- 0-10 V Pa supply
- supply air temperature before VVX / outdoor proxy
- supply air temperature after VVX
- supply fan RPM

ftx-extract-uni:
- 0-10 V Pa extract
- extract/house air temperature before VVX
- exhaust/to-outdoor temperature after VVX
- extract fan RPM

ftx-process-uni:
- 0-10 V future/current CO2/VOC input
- hotwater temperature
- brine temperature
- temperature after battery / to-house proxy
- VVX RPM
```

## Network hardware

```text
DIN-mounted switch: Teltonika TSW030
```

Known fact:

- DIN mount on the back
- takes about two DIN modules in width

## Open inventory gaps

These should be filled when exact labels/photos/order info are available:

- exact CO2/VOC/PPM output scaling and algorithm for Siemens QPM2102
- exact pressure range/config interpretation for Siemens QBM2030-5
- exact temperature sensor models and which are retained vs newly bought
- exact pipe/rör dimensions for heating/cooling valves
- exact Shelly model names per IP address if not already in config
- exact cable IDs/terminal mappings for all sensors and actuators