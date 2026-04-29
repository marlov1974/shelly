# Network Principles

## Principle

Automation devices should communicate over stable local IP. Devices in the FTX system are known to reach each other over local IP.

## Practical design

- Use deterministic/static IP addressing where possible.
- Keep technical device Wi-Fi conservative and stable.
- Prefer 2.4 GHz for legacy/IoT compatibility.
- Avoid depending on cloud connectivity for local control loops.

## Remote access

External access may use router/proxy/port-forwarding patterns for diagnostics, but runtime control should remain local.