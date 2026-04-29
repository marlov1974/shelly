# Shelly Platform Constraints

## Memory and runtime

Shelly mJS memory is tight. Scripts must be small, deterministic and avoid unnecessary allocation.

Known constraints/principles:

- Avoid large JSON structures.
- Avoid recursion.
- Avoid Array.shift in constrained scripts.
- Avoid heavy helper frameworks.
- Keep RPC bursts small and preferably serial.
- Use one-shot scripts for bounded work.
- Keep the long-lived master small.

## KVS persistence caution

KVS is useful for runtime state exchange but has shown unreliable persistence across reboot. Do not use KVS as the only durable installer/version state.

## Logging

Current repo memory states runtime logging should be print-only. Earlier text-component ring logging exists historically, but should not be assumed current unless the relevant code/memory says so.

## Practical rule

When in doubt, reduce script size and reduce runtime concurrency.