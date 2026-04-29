# Shared Concepts

## One-shot script

A script that is started by another script, performs one bounded job, writes its outputs and then stops itself. In FTX Digital, `poll`, `state`, `weather`, `brain`, `driver` and `installer` are one-shot scripts, except that `installer` is also the permanent bootstrap script at id 1.

## Master

The only long-lived runtime orchestrator. It owns the 60-second cadence and starts worker scripts sequentially. It must not contain thermal, ventilation or business control logic.

## Installer / bootstrap

The permanent script at id 1. It is manually installed and not auto-updated. It can run on an otherwise empty device, create missing scripts and components, build one package at a time, and start master.

## Recipe

A JSON build description for a script. It contains the boot flag, the virtual components owned by the script, and the ordered list of code chunks to concatenate into the final Shelly script.

## Device manifest

A JSON file per Shelly device. It contains the target `device_version`, installer-state component definition, and expected versioned script packages for that device.

## Versioned script name

Runtime scripts include their version in the script name, e.g. `brain_v2_3_0`. Installer checks presence of the expected versioned name rather than relying on KVS version keys.

## KVS

Shelly key-value store. Used for runtime data sharing, not for durable installer version state. KVS has shown unreliable persistence across reboot.

## Virtual component

A Shelly virtual component such as Boolean, Enum, Number or Text. Used for UI, Homey integration, durable user commands and selected measured values. Virtual components are scarce and should not be used for logging.

## Signal bus

Brain-internal design pattern. Features write independent signals to `ctx.sig`; the intent layer merges/prioritizes these into final actuator intent.

## Physical aggregate

The physical ventilation/heating/cooling system being controlled. Physical facts such as pressure, flow, filter status, VVX efficiency and condensate risk belong in the physical memory area, not in digital runtime design unless they drive control logic.