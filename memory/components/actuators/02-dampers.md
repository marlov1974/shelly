# Dampers

## Identified actuator

Siemens GCA121.1E spring-return damper actuator.

Known data:

```text
Supply: 24 V AC +/-20%, 50/60 Hz
Power: 8 VA
Torque: 16 Nm
Rotation: 90 degrees
Runtime motor: 90 s
Runtime spring return: 15 s
Protection: IP60
Type: spring return, NC
Connections: G and G0
Wires: 1=RD, 2=BK
```

## Control principle

Dampers are a prerequisite for safe fan operation. Startup sequence should open dampers before releasing normal fan/VVX/thermal operation.

## Runtime status

Canonical digital run semantics:

```text
dmp.run = 1 iff damper switch is active
```