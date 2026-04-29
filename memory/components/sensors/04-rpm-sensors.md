# RPM Sensors

## Role

RPM is used as a run confirmation for fans and VVX rotor.

## Canonical FTX run thresholds

```text
fan.run = 1 iff switch = 1 and pct > 10 and rpm > 250
vvx.run = 1 iff switch = 1 and rpm > 4
```

## Input pattern

Shelly Plus UNI can read pulse/frequency input for RPM. In previous FTX mappings, input:2 has been used for RPM measurement.

## Design rule

Run status should be derived from actual measured behavior, not only command/on state.