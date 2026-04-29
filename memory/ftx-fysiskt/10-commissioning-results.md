# Commissioning Results

## Scope

This file should contain confirmed physical commissioning observations and test results.

## Current confirmed digital-runtime test observations

The following runtime observations are relevant but are not full physical commissioning results:

- Poll one-shot has successfully read device statuses and written `ftx.tel.m` / `ftx.tel.act`.
- State one-shot has successfully derived run state and written selected virtual number outputs.
- Brain one-shot has successfully produced reasonable low-ventilation intent in STD mode after command components were created.

## Physical commissioning to add

The FTX Physical memory should add:

- balanced flow points
- final fan percentage calibration
- pressure validation
- filter baseline
- cooling drain tests
- VVX efficiency baseline under known conditions
- heating/cooling battery response tests

## Note

Do not use this file for transient logs. Summarize stable commissioning conclusions only.