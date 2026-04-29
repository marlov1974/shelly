# Fans

## Role

Supply and extract fans are EC/dimmable fans controlled by 0-10 V dimming. RPM is measured and used for run confirmation.

## Known run threshold

```text
fan.run = 1 iff switch = 1 and pct > 10 and rpm > 250
```

## Empirical mapping

Fan percentage to RPM is empirical and non-perfect, especially near the top end where RPM can flatten or become nonlinear.

## Control principle

Normal operation derives supply from extract using a calibrated rule. Explicit overpressure modes such as fireplace may override normal balance mapping.