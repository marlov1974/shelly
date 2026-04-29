# FTX Physical Decisions Log

## Locked airflow reference points

Decision:
- Stos/nozzle measurements are locked as flow-proxy reference points:
  - 85 V -> 20 Pa -> approx. 110 l/s
  - 150 V -> 120 Pa -> approx. 240 l/s
- Fan-side pressure points are locked separately:
  - 85 V -> approx. 90 Pa fan-side pressure
  - 150 V -> approx. 380 Pa fan-side pressure

Reason:
- These provide a stable reference for reconstructing the flow method without the nozzle/stos.

## Supply fan rule

Decision:
- Normal supply fan percentage is derived from extract fan percentage:

```text
supply_pct = round(0.9 * extract_pct - 1)
```

Reason:
- This is the current empirical normal-operation rule. Overpressure modes may override it.

## Cooling airflow cap

Decision:
- Cooling mode should cap fan level conservatively because of condensate drain risk.

Reason:
- The open drain hose can suffer reverse airflow and pooling at high airflow.

## VVX control

Decision:
- VVX is treated as on/off in the current design.

Reason:
- Current motor/control setup is fixed AC gearmotor operation. Pulsing may be explored later but requires heat coordination.