# Condensate and Cooling Risk

## Core risk

The cooling battery has an open condensate drain hose to a floor drain and no confirmed water trap.

Risk model:

```text
High airflow / pressure difference
→ reverse airflow in condensate hose
→ drainage is hindered
→ 5–10 mm pooling can form in tray
→ leakage risk at joints or tray edges
```

## Control implication

Cooling mode must limit airflow rather than rely only on pressure calculations.

Current conservative v1 cap:

```text
When cooling battery is active, max fan level is capped to MEDIUM-equivalent level.
```

The cap can be adjusted after commissioning tests.

## Future improvement

Possible future improvement:

- water level sensor in drip tray
- better condensate drain/water trap solution
- physical verification of drain behavior at multiple fan speeds

## Digital link

The digital brain has cooling/failsafe constraints, including cooling ventilation cap. The physical reason is condensate drainage risk, not only thermal comfort.