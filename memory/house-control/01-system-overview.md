# House Control System Overview

## Purpose

House control covers thermal systems outside the FTX aggregate: heat pumps, brine, floor heating/cooling, pumps, valves and future coordination between ventilation, heating and free cooling.

## Current known system parts

- New heat pumps with network/Wi-Fi adapters.
- Brine loop used for free cooling.
- Floor heating/floor cooling loop.
- Heat exchanger between brine and floor loop.
- Smart circulation pumps, including Grundfos MAGNA3 and Wilo/Yonos Pico class pumps.
- Shelly-based future control cabinet with separate technical Wi-Fi/networking.

## Design direction

The house-control system should eventually coordinate:

- indoor temperature target
- floor heating/cooling availability
- brine temperature and flow
- dew point/condensation safety
- ventilation support through FTX airflow and cooling/heating batteries

## Boundary to FTX

FTX Digital controls air-side ventilation, VVX, dampers and air batteries. House Control controls hydronic/thermal plant behavior. Shared facts such as house temperature, dew point and cooling permission may later be exchanged through KVS or a higher-level controller.