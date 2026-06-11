# FTX Digital Device Topology

## Network principle

Shelly devices communicate over the internal FTX / technical network using `192.168.77.x` addresses.

Code between Shelly devices should use internal `192.168.77.x` addresses. External NAT/port-forward addresses are for manual testing and operator access only.

## Operator access principle

The operator is normally not on the same network as the Shelly devices.

The operator is outside the solution router, but NAT / port-forwarding rules exist in the firewall for the Shelly devices so they can still be reached from the operator side.

When giving manual browser/RPC URLs to the user, prefer the NAT pattern unless the user explicitly asks for the internal device URL.

External reachable base address when the operator is at home:

```text
192.168.86.240
```

Port-forwarding convention:

```text
external port = 80xx
xx = last octet of the internal Shelly IP address
```

Example:

```text
ftx-vvx internal IP: 192.168.77.40
operator URL:        http://192.168.86.240:8040/
```

Example KVS read through NAT:

```text
http://192.168.86.240:8040/rpc/KVS.Get?key=ftx.weather.act
```

Internal equivalent, only valid from inside the technical network:

```text
http://192.168.77.40/rpc/KVS.Get?key=ftx.weather.act
```

## Known devices

The AI/project memory should treat known Shelly device IP addresses as available project context.

- `ftx-supply-fan`: `192.168.77.10` → `http://192.168.86.240:8010/`
- `ftx-extract-fan`: `192.168.77.11` → `http://192.168.86.240:8011/`
- `ftx-heat-dim`: `192.168.77.12` → `http://192.168.86.240:8012/`
- `ftx-cool-dim`: `192.168.77.13` → `http://192.168.86.240:8013/`
- `ftx-supply-uni`: `192.168.77.20` → retired as Gen1 runtime telemetry source
- `ftx-extract-uni`: `192.168.77.21` → retired as Gen1 runtime telemetry source
- `ftx-process-uni`: `192.168.77.22` → retired as Gen1 runtime telemetry source
- `ftx-vvx`: `192.168.77.40` → `http://192.168.86.240:8040/`

## Current FTX telemetry source split

Gen1 runtime telemetry now comes from Shelly Pro Sensor Add-ons installed on the fan dimmers:

```text
192.168.77.10 ftx-supply-fan:
- light:0 = supply fan actual on/pct/power
- temperature:100 = t.to_house
- temperature:101 = t.post_vvx
- temperature:102 = t.out
- temperature:103 = t.brine
- temperature:104 = t.brine_post_shunt
- temperature:105 = t.hotwater
- temperature:106 = t.hotwater_post_shunt
- input:100 "Supply Pa 100" xpercent = supply pressure Pa

192.168.77.11 ftx-extract-fan:
- light:0 = extract fan actual on/pct/power
- temperature:100 = t.to_outdoor
- temperature:105 = t.house
- humidity:105 = rh.house
- input:100 "Extract pa 100" xpercent = extract pressure Pa
- input:101 "House ppm 101" xpercent = house CO2/VOC ppm-equivalent
- switch:100 = power feed for the house temp/RH sensor
```

Old UNI devices are no longer polled or rebooted by Gen1 runtime maintenance scripts.

The extract fan runs local script `house_air_sensor_watchdog_v0_2_0` to power-cycle
`switch:100` for 10 seconds if `temperature:105` or `humidity:105` is missing,
`null`, `n/a` or exactly zero. The script is local to the extract fan and does not
change primary VVX runtime actuator ownership. In the local-driver canary it also
starts the extract fan executor because the extract fan cannot run watchdog,
telemetry publisher, local master and executor within the three-running-script
limit.

## Runtime host

The current runtime and Mac direct-deploy architecture is running on the VVX device. The runtime model is generic enough to be moved, but current manifests and code paths should be checked before moving the runtime host.

Manual access to the current G1 runtime host / VVX device should normally use:

```text
http://192.168.86.240:8040/
```

## Network hardware

- Teltonika router provides the local technical network.
- Teltonika TSW030 DIN switch is used for local LAN distribution in the FTX control system.

## Rule

Runtime code should use internal `192.168.77.x` addresses.

User-facing troubleshooting URLs should usually use the operator NAT endpoint:

```text
http://192.168.86.240:80xx/
```

because the user is normally outside the solution router even when physically at home.
