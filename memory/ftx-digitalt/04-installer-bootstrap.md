# Installer and Bootstrap

## Role

`installer` is the permanent bootstrap script. It is script id 1 and is the only script that is not auto-updated.

It can be started manually on an incomplete device. Once `master` exists, master starts installer periodically until the device is complete.

## Installer responsibilities

Installer:

1. Fetches the Shelly device id.
2. Fetches `rt/devices/<device-id>.json` from GitHub.
3. Ensures installer-state component exists.
4. Reads local installer state from `text:200`.
5. Compares local device version with remote `device_version`.
6. If complete, logs OK and self-stops.
7. If incomplete, finds the next missing versioned script package.
8. Builds exactly one package per run.
9. Starts master after build or completion.
10. Self-stops.

## Installer state

Installer state is stored in a persistent virtual text component:

```text
text:200 = Installer state
```

Compact JSON format:

```json
{"dv":1,"ok":1}
```

Meaning:

- `dv`: locally completed device version.
- `ok`: 1 when device is complete for that device version.

KVS is not used for installer version state because KVS has shown unreliable persistence across reboot.

## Build model

Installer builds one package per run.

When a build is required:

1. Stop master first.
2. Stop all scripts except installer.
3. Fetch package recipe.
4. Ensure recipe-owned virtual components exist.
5. Create target script if missing.
6. Write script code from chunks.
7. Set script config/name/boot flag.
8. Start master.
9. Self-stop.

## Completion model

Device version is not marked complete after each package. It is marked complete only when all expected versioned scripts exist and recipe-owned components have been ensured.

Master starts installer again on ticks `1, 6, 11, ...` until installer reaches completion.

## Script identity

Installer uses versioned script names rather than KVS version keys.

Examples:

```text
master_v1_0_0
poll_v3_3_0
state_v1_4_0
weather_v1_0_0
brain_v2_3_0
```

Installer itself is not included as an auto-updated package.

## Device manifest

A device manifest contains:

- `device_version`
- installer-state component definition
- expected scripts/packages

Example shape:

```json
{
  "device_version": 1,
  "state_component": {
    "type": "text",
    "id": 200,
    "name": "Installer state",
    "persisted": true,
    "default": "{\"dv\":0,\"ok\":0}"
  },
  "scripts": [
    {
      "role": "master",
      "version": "1.0.0",
      "name": "master_v1_0_0",
      "recipe": "rt/recipes/master.json",
      "boot": true
    }
  ]
}
```

## Safety rule

Installer should always try to start master before stopping itself, even after a failed build. If master is missing or broken, installer logs the failure and self-stops so it can be manually restarted.