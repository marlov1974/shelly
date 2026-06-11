# Shared Concepts

## One-shot script

A script that is started by another script, performs one bounded job, writes its outputs and then stops itself. In FTX Digital, `state`, `weather`, `brain`, local executors and `reboot` are one-shot scripts.

## Master

The only long-lived runtime orchestrator. It owns the 60-second cadence and starts worker scripts sequentially. It must not contain thermal, ventilation or business control logic.

## Mac direct deploy / bootstrap

The active VVX runtime no longer uses a permanent Shelly-side installer. The Mac/Codex deploy tool reads the local manifest and recipes, uploads complete scripts through Shelly RPC, verifies the live device, updates deploy state and starts master.

## Recipe

A JSON build description for a script. It contains the boot flag, the virtual components owned by the script, and the ordered list of code chunks to concatenate into the final Shelly script.

## Device manifest

A JSON file per Shelly device. It contains the target `device_version` and expected versioned script packages for that device.

## Versioned script name

Runtime scripts include their version in the script name, e.g. `brain_v2_3_0`. The Mac deploy tool checks expected fixed ids and versioned names rather than relying on KVS version keys.

## KVS

Shelly key-value store. Used for runtime data sharing, not for durable deploy version state. KVS has shown unreliable persistence across reboot.

## Virtual component

A Shelly virtual component such as Boolean, Enum, Number or Text. Used for UI, Homey integration, durable user commands and selected measured values. Virtual components are scarce and should not be used for logging.

## Signal bus

Brain-internal design pattern. Features write independent signals to `ctx.sig`; the intent layer merges/prioritizes these into final actuator intent.

## Physical aggregate

The physical ventilation/heating/cooling system being controlled. Physical facts such as pressure, flow, filter status, VVX efficiency and condensate risk belong in the physical memory area, not in digital runtime design unless they drive control logic.
