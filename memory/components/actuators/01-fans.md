# Fans

## Role

Supply and extract fans are EC/dimmable fans controlled by 0-10 V dimming. RPM is measured and used for run confirmation.

## Current EC fans

Installed fans:

```text
Supply fan: ebm-papst RadiCal K3G250-RE07-07
Extract fan: ebm-papst RadiCal K3G250-RE09-07
```

Known common facts:

- Both are ebm-papst RadiCal EC fans.
- Both are similar in design.
- Both have tach output.
- Tach output is open collector.
- Tach output gives 1 pulse per revolution.
- Tach output is used for RPM measurement in the control system.

## Original/previous AC fan motors

Original/previous Karfax TOPIC-12 fan motors:

```text
Manufacturer: Rosenberg Ventilatoren
Motor type: ED 106-50-2 AA2 KS0,6
Article no: L02-10665
Supply: 230 V, 50 Hz, single-phase AC
Insulation class: F
Protection class: IP54
Motor type: capacitor motor with external run capacitor
Bearing: 6002, 15 x 32 x 9 mm
External run capacitor: ICAR Ecofill, 14 uF +/-5%, AC 450 V
```

## Known run threshold

```text
fan.run = 1 iff switch = 1 and pct > 10 and rpm > 250
```

## Flow calibration

Current practical Pa-to-l/s calibration:

```text
K_SUPPLY_FAN = 11.6
K_EXTRACT_FAN = 12.1
lps = K * sqrt(Pa)
```

## Empirical mapping

Fan percentage to RPM is empirical and non-perfect, especially near the top end where RPM can flatten or become nonlinear.

Current normal supply/extract rule:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

Earlier superseded rule:

```text
supply_pct = 1.0333 * extract_pct - 3.667
```

## Control principle

Normal operation derives supply from extract using a calibrated rule. Explicit overpressure modes such as fireplace may override normal balance mapping.