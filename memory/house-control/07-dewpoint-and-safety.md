# Dew Point and Safety

## Dew point role

Dew point is the key safety limit for floor cooling and any cold surfaces. Cooling-water supply temperature must stay above dew point with margin.

## Recommended principle

Use a conservative margin. A practical initial rule is:

```text
minimum_floor_supply_C = dew_point_C + safety_margin_C
```

Initial safety margin should be at least 2-3 C unless empirical measurements justify less.

## Required inputs

- indoor temperature
- indoor relative humidity
- floor supply temperature
- optionally floor return temperature
- optionally surface/floor temperature

## Integration with FTX

FTX Digital already has house temperature and RH channels in telemetry. Those can be used for dew point decisions, but hydronic cooling should eventually have its own local safety checks as well.