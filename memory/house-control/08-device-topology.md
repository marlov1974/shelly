# House Control Device Topology

## Current direction

A separate Shelly/control cabinet may be used for heat pump and hydronic plant control. It should have its own stable technical Wi-Fi/network path, separate from but reachable by the FTX network.

## Networking notes

- Teltonika/RUT-style routers are used or considered for technical Wi-Fi.
- Technical devices should use stable 2.4 GHz settings.
- Prefer deterministic IP addressing for automation devices.
- FTX devices are known to reach each other over local IP; the same principle should apply to house-control devices.

## Future registry

A `config/house-control/device-registry.json` should eventually hold exact device IDs, IP addresses, component IDs and roles.