# House Control Hardware Inventory

## Purpose

Canonical hardware inventory for Gen2 house-control systems outside the physical FTX aggregate itself.

This file documents the devices and physical components used for dampers, heat pumps, floor heating/cooling, brine and water control.

FTX aggregate hardware remains documented under:

```text
memory/ftx-fysiskt/
```

## Generation boundary

These hardware facts are physical installation facts. They may be used by both Gen1-adjacent POC code and Gen2 target design where relevant.

Control architecture differs between Gen1 and Gen2, but the installed hardware described here is the physical source of truth until changed and re-documented.

## Dampers power control

Current hardware:

```text
Shelly Pro 1PM
```

Function:

```text
- switches mains power to the 24 V AC transformer feeding the dampers
- measures damper/transformer power consumption
```

Important historical note:

```text
Earlier design used a Shelly Pro 2 and switched 24 V AC after the transformer.
That is obsolete.
Current design switches transformer supply power using Shelly Pro 1PM.
```

Interpretation:

```text
Damper power measurement is now transformer-side / supply-side power.
The Shelly Pro 1PM controls whether the 24 V AC damper transformer is energized.
```

## Floor cooling and heat-pump control hardware

### Shelly Pro Dimmer 0-10 V

Function:

```text
- controls shunt valve
- controls brine pump
```

This device provides analog control for the cooling/heating mixing side used by floor cooling / brine control.

### Shelly Pro 2

Function:

```text
- controls three-way valve selecting cooling or heating for the general floor zone
- controls floor-water pump for the general floor zone
```

Important operating detail:

```text
When the general floor zone is connected to cooling, it no longer has access to the heat pumps' internal pumps.
Therefore the dedicated floor-water pump is required in cooling mode.
```

### Shelly Plus Uni devices

There are two Shelly Plus Uni devices.

Function:

```text
- each controls one heat pump
- they measure water temperatures across the heat-pump / water system
```

Each heat pump has its own control/measurement Uni.

## Heat pumps

Installed heat pumps:

```text
2 x Mitsubishi Ecodan 11 kW
```

Observed/expected capacity note:

```text
Each unit can deliver approximately 16 kW under optimal conditions.
```

Scheduling and command modes are documented separately in:

```text
memory/house-control/02-heat-pump-operating-schedules.md
```

## Floor zones

The floor system has two main zones:

```text
1. General floors
2. Bathroom floors
```

### General floors

Capabilities:

```text
- heating
- cooling
```

Only the general floor zone can run cooling.

### Bathroom floors

Capabilities:

```text
- heating
```

The bathroom floor zone can continue heating while the general floor zone is cooling.

This is an important Gen2 coordination capability:

```text
General floors may provide cooling while bathroom floors maintain comfort heat.
```

## Design implications for Gen2

Gen2 must distinguish:

```text
- general floor cooling/heating mode
- bathroom floor heating mode
- heat-pump availability
- floor-water pump requirement when general floor is in cooling mode
- shunt/brine control through analog 0-10 V outputs
```

Gen2 must not assume that all floor zones share the same mode.

Gen2 must not assume the heat pumps' internal pumps can circulate the general floor loop when the general floor zone is switched to cooling.
