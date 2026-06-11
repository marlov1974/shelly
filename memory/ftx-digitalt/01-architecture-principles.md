# FTX Digital Architecture Principles

## One long-lived runtime script

`master` is the only long-lived runtime script. It owns cadence, ordering and timeouts. It does not contain control logic.

## One-shot workers

Worker scripts perform bounded work and then stop themselves:

- `state`
- `weather`
- `brain`
- local executors
- `reboot`

## Mac direct deploy as bootstrap/install path

The active VVX runtime no longer uses a resident Shelly-side installer. Mac/Codex installs or repairs runtime scripts with `tools/g1_vvx_deploy.py`, using local recipes and bounded Shelly RPC uploads.

## Callback vs classic functions

- Shelly RPC, KVS and HTTP calls are asynchronous and must be callback-driven.
- Pure calculation functions should be classic/synchronous.
- Do not use fake blocking waits after RPC calls.
- Timers may be used for spacing and watchdogs, not as a substitute for completion callbacks.

## Print-only logging

Use `print()` via common `log()` helper. Do not use `Text.Set` for logging. Virtual components are scarce and should be reserved for commands, deploy state and selected UI values.

## KVS role

KVS is runtime data sharing, not durable deploy version state. Mac deploy state uses persistent virtual `text:200` because KVS has shown unreliable persistence across reboot.

## GitHub as source, Mac as deployer

GitHub contains:

- source chunks
- recipes
- device manifests
- project memory Markdown

The Mac pulls/reads repository files locally and installs scripts on Shelly through RPC. The active VVX runtime host does not fetch GitHub raw files to install code.
