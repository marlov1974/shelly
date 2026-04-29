# Debugging and Known Issues

## KVS persistence

KVS has shown unreliable persistence across reboot. Do not use KVS as durable installer version state. Use persistent virtual components for durable bootstrap state.

Current installer state:

```text
text:200 = Installer state
```

## Text logging removed

Runtime log output should use `print()` only. `Text.Set` logging was removed to save virtual component capacity and reduce unnecessary component writes.

## Shelly logs may omit calls

Observed Shelly logs do not always show every expected intermediate RPC call clearly. Functional output and KVS/component state should be used together with logs when debugging.

## No call record after self-stop

`No call record` messages can appear after a script stops itself. In observed tests these have usually been harmless when the script had already logged `DON` and stopped successfully.

## Out-of-memory risk

High-risk patterns:

- large JSON bodies in memory
- many nested closures
- large chunks
- repeated `JSON.parse` on large bodies
- multiple concurrent HTTP/RPC calls
- long-lived scripts with growing state

Mitigations:

- use one-shot workers
- keep chunks small
- use serial callback chains
- use timeouts/watchdogs
- avoid large arrays/objects
- avoid Text.Set logging loops

## GitHub raw polling

Do not poll GitHub raw files too frequently. Installer is run by master on ticks `1, 6, 11, ...`, normally every five minutes after startup. Installer quickly self-stops if the local device version matches the remote manifest.

## Script move/cleanup in GitHub

The GitHub tool cannot atomically rename/move files via `update_file`. Use fetch/create/delete in small batches.

## Component drift

Installer currently should create missing virtual components but should not aggressively mutate or delete existing ones. This avoids breaking Homey/UI/manual configuration unexpectedly.

## number:201 correction

`number:201` is Total power. It is not fan flow average. Average l/s is not currently a virtual component.

## Bootstrap behavior

Master must survive missing worker scripts and continue ticking. During bootstrap it is expected to log `NO poll`, `NO state`, `NO weather` or `NO brain` until installer has created the missing versioned scripts.