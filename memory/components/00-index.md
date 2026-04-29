# Components Memory Index

This folder contains reusable component knowledge that applies across FTX Digital, FTX Physical and House Control.

## Areas

- `shelly/` — Shelly platform, device types, RPC, virtual components and limitations.
- `networking/` — IP addressing, routers, switches and technical Wi-Fi.
- `sensors/` — temperature, pressure, CO2/VOC, humidity and RPM sensors.
- `actuators/` — fans, dampers, pumps, valves and VVX motor.

## Boundary

Component files describe generic behavior and known installed hardware. Project-specific runtime contracts belong in the relevant project folder.