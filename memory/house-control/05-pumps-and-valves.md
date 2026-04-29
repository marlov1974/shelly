# Pumps and Valves

## Known pump references

Discussed/observed pump classes include:

- Grundfos MAGNA3 32-100 180
- Wilo/Yonos Pico 25/1-8-180
- older Grundfos UPS / UPS32 family pumps

## Placement principle

- Use the stronger pump where hydraulic resistance and flow requirement are highest.
- Brine side may need the stronger pump if the loop/exchanger requires higher pressure or flow.
- Floor side should be sized to stable floor-circuit flow and comfort, not only maximum power transfer.

## Control principle

Pumps are smart/variable-speed. It is likely better to use their internal constant-pressure/constant-flow style modes where appropriate instead of trying to micro-control them via external switching.

## 0-10 V valves

0-10 V valves should be treated as analog actuators with separate enable/safety logic. Do not assume that valve percentage equals delivered thermal power without water temperature and flow context.