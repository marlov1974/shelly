# House Control Decisions Log

## 2026-04 — Separate house-control memory area

Decision: Heat pumps, brine, floor heating/cooling and hydronic plant logic are separated from FTX Digital and FTX Physical memory.

Reason: These systems interact but have different safety constraints, devices and control time constants.

Implication: FTX Digital memory should not become the dumping ground for heat pump or floor-cooling design facts.

## 2026-04 — Conservative floor cooling safety

Decision: Floor cooling must be governed by dew point margin, not only room temperature demand.

Reason: Condensation risk is a hard safety limit.

Implication: Any future floor-cooling automation must include temperature/RH/dew-point logic and should bias toward undercooling.