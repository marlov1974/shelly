# Free Cooling Logic

## Purpose

Free cooling uses cold brine through a heat exchanger to cool the floor loop.

## Basic energy relation

Cooling power depends on flow and temperature drop:

```text
P_kW ≈ 1.16 * flow_m3h * deltaT_C
```

This approximation is useful for water-side calculations. Brine properties differ slightly but are close enough for first-order reasoning.

## Control sequence draft

1. Confirm cooling demand from house temperature.
2. Confirm brine is cold enough.
3. Calculate indoor dew point.
4. Set minimum allowed floor supply temperature above dew point with safety margin.
5. Start pumps/enable valve.
6. Limit valve or pump curve if floor supply approaches dew point margin.
7. Stop cooling if humidity/dew point risk rises.

## Safety bias

The logic should bias toward safe undercooling. Condensation is a hard limit.