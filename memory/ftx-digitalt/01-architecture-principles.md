# FTX Digital Architecture Principles

## One long-lived runtime script

`master` is the only long-lived runtime script. It owns cadence, ordering and timeouts. It does not contain control logic.

## One-shot workers

Worker scripts perform bounded work and then stop themselves:

- `poll`
- `state`
- `weather`
- `brain`
- `driver` later

## Installer as bootstrap root

`installer` is script id 1 and is not auto-updated. It can be started manually on an otherwise incomplete device. It creates scripts and components and starts `master` when enough runtime exists.

## Callback vs classic functions

- Shelly RPC, KVS and HTTP calls are asynchronous and must be callback-driven.
- Pure calculation functions should be classic/synchronous.
- Do not use fake blocking waits after RPC calls.
- Timers may be used for spacing and watchdogs, not as a substitute for completion callbacks.

## Print-only logging

Use `print()` via common `log()` helper. Do not use `Text.Set` for logging. Virtual components are scarce and should be reserved for commands, installer state and selected UI values.

## KVS role

KVS is runtime data sharing, not durable installer version state. Installer version state uses persistent virtual `text:200` because KVS has shown unreliable persistence across reboot.

## GitHub as deployment and memory source

GitHub contains:

- source chunks
- recipes
- device manifests
- project memory Markdown

The Shelly device pulls raw GitHub files through the installer.