# FTX Physical Decisions Log

## 2026-02 — Practical max airflow

Decision: Use approximately 250 l/s as current practical maximum airflow after system modifications.

Reason: Historical maximum with old fans, clean filters and open terminals was about 300 l/s, but current modified system is estimated lower.

Implication: Control and commissioning should not assume 300 l/s is available.

## 2026-03 — Pa to l/s K values

Decision: Use `K_SUPPLY_FAN = 11.6` and `K_EXTRACT_FAN = 12.1` for practical Pa-to-l/s conversion.

Reason: These match the current empirical calibration direction.

Implication: `lps = K * sqrt(Pa)` remains the operational conversion model until recalibrated.

## 2026-04 — Current normal supply/extract mapping

Decision: Current documented normal mapping is `supply_pct = round(0.9 * extract_pct - 1)`.

Reason: This supersedes the earlier `1.0333 * extract_pct - 3.667` relationship.

Implication: Use the newer rule unless explicitly analyzing historical measurements or overpressure modes.

## 2026-04 — VOC/CO2 interpretation

Decision: High ppm-like readings from the combined VOC/CO2 sensor must not automatically be interpreted as human CO2.

Reason: Hair spray, perfume and ethanol/brine spill can create strong VOC readings.

Implication: Control logic may need VOC-event handling or smoothing to avoid excessive ventilation from short chemical events.

## 2026-04 — Cooling safety bias

Decision: Cooling should remain conservative where condensate handling or dew point margin is uncertain.

Reason: Moisture/condensation damage is a hard safety risk.

Implication: Limit cooling before chasing maximum thermal output.