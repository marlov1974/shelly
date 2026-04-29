# House Control Principles

## General principles

- Keep hydronic safety local and conservative.
- Avoid relying on ventilation logic to prevent water-side condensation.
- Prefer stable pump modes and simple external enable/disable before complex modulation.
- Treat heat pumps, floor loop and FTX as coupled but distinct control domains.

## Thermal inertia

Floor heating/cooling has slow response. Control should avoid short cycling and overreacting to minute-level sensor noise.

## Coordination with FTX

The FTX can support house temperature through airflow, VVX, heating battery and cooling battery. House-control should avoid fighting the FTX, especially during cooling/heating transitions.

## Future supervisory logic

A future higher-level controller may decide overall mode:

- heat house
- neutral ventilation
- cool house through air
- cool house through floor
- use both air and floor cooling with dew point constraints

The low-level systems should remain safe if that supervisory layer fails.