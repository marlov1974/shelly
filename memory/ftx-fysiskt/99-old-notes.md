# FTX Physical Old Notes

This file is for superseded physical assumptions and historical notes.

## Superseded supply mapping

An earlier empirical mapping was approximately:

```text
supply_pct = 1.0333 * extract_pct - 3.667
```

This has been superseded by:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

## Flow caution

Older fan-side pressure readings should not be interpreted directly as flow unless a later calibration explicitly supports that interpretation.