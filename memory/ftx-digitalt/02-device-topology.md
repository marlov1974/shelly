# FTX Digital Device Topology

## Network principle

Shelly devices communicate over the internal FTX network using `192.168.77.x` addresses.

For manual browser testing from the house network, port-forwarding through `192.168.86.240:80xx` may be used, where `xx` is the last octet of the internal `192.168.77.xx` address.

## Known devices

- `ftx-supply-fan`: `192.168.77.10`
- `ftx-extract-fan`: `192.168.77.11`
- `ftx-heat-dim`: `192.168.77.12`
- `ftx-cool-dim`: `192.168.77.13`
- `ftx-supply-uni`: `192.168.77.20`
- `ftx-extract-uni`: `192.168.77.21`
- `ftx-process-uni`: `192.168.77.22`
- `ftx-vvx`: `192.168.77.40`

## Runtime host

The current runtime/installer architecture is being built and tested on the VVX device. The runtime model is generic enough to be moved, but current manifests and code paths should be checked before moving the runtime host.

## Network hardware

- Teltonika router provides the local technical network.
- Teltonika TSW030 DIN switch is used for local LAN distribution in the FTX control system.

## Rule

Code between Shelly devices should use internal `192.168.77.x` addresses. External port-forward addresses are for manual testing only.