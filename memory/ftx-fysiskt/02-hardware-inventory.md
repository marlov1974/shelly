# Physical FTX Hardware Inventory

This file captures small but important hardware facts for the physical FTX installation.

## Aggregate

- Physical unit: Karfax TOPIC-12.
- Rotating heat exchanger: Heatex WA0540V-200-020-200-0-220.
- Practical current maximum airflow after modifications: about 250 l/s.
- Historical reference maximum with older fans, clean filters and open terminals: about 300 l/s.

## VVX rotor and motor

Rotating heat exchanger motor identified from nameplate:

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

Control implication: treat as AC on/off unless future hardware proves safe variable-speed operation.

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

## Fans

Current digital model assumes separate supply and extract EC/dimmable fans controlled by 0-10 V and measured by RPM.

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

## Sensors retained/used

Current known sensor classes:

- differential pressure sensors, 0-10 V, for supply/extract pressure
- fan RPM pulse/frequency measurements
- VVX rotor RPM pulse measurement, 1 pulse/rotation principle
- temperature sensors for outdoor/pre-VVX, house/extract, post-VVX, to-house, to-outdoor, brine and hotwater references
- CO2/VOC/RH sensor for house air quality

## CO2/VOC/PPM sensor behavior

The air-quality sensor can report high ppm-like values from VOC events, not only human CO2. Known triggers:

- hair spray
- perfume
- ethanol/brine spill

Control implication: avoid treating all high ppm readings as occupancy-driven CO2.

## Shelly/edge hardware used around FTX

Known device roles:

```text
192.168.77.10  supply fan
192.168.77.11  extract fan
192.168.77.12  heat
192.168.77.13  cool
192.168.77.20  supply UNI
192.168.77.21  extract UNI
192.168.77.22  process UNI
192.168.77.30  dampers
192.168.77.40  VVX
```

Shelly Plus UNI usage:

- supply UNI: supply pressure, supply temperatures and supply RPM
- extract UNI: extract pressure, extract temperatures and extract RPM
- process UNI: CO2/VOC future/current process input, water/brine/after-battery temperatures and VVX RPM

## Network hardware

- DIN-mounted switch: Teltonika TSW030.
- The TSW030 has DIN mount on the back and takes about two DIN modules in width.

## Open inventory gaps

These should be filled when exact labels/photos are available:

- exact current supply fan make/model
- exact current extract fan make/model
- exact CO2/VOC/RH sensor model
- exact 0-10 V pressure sensor make/model and range
- exact temperature sensor models and which are retained vs newly bought
- exact 0-10 V valve actuator models for heating/cooling
- exact Shelly model names per IP address if not already in config