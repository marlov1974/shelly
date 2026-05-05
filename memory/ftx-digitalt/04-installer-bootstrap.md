# Installer and Bootstrap

## Role

`installer` is the permanent deployment/bootstrap script. It is script id 1 and is the only script that is not auto-updated by the repo deployment flow.

`boot` is script id 2 and is auto-managed by installer like the other runtime packages. It is the only intended autostart script in the device manifest.

## Boot responsibilities

On physical device startup/reboot, `boot`:

1. Starts automatically.
2. Waits for the local system, network and other devices to stabilize.
3. Starts `master` by fixed id 3.
4. Self-stops.

Boot does not set any ventilation startup state. The physical devices are expected to retain/restore their previous output states across reboot, including VVX.

## Installer responsibilities

Installer:

1. Fetches the Shelly device id via `Shelly.GetDeviceInfo`.
2. Derives the short device id.
3. Fetches `rt/devices/<device-id>.json` from GitHub raw.
4. Ensures the installer-state component exists.
5. Reads local installer state from `text:200`.
6. Compares local device version with remote `device_version`.
7. If complete, logs OK and self-stops.
8. If incomplete, finds the next missing expected versioned script package.
9. Builds exactly one package per run.
10. Starts master after build/completion when possible.
11. Self-stops.

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

When a build is required, current `rt/installer/installer.js` does this:

1. Calls `stopAll()`, which stops all local scripts except installer itself. There is no separate master-first stop step in the current code.
2. Fetches the target package recipe.
3. Ensures recipe-owned virtual components exist.
4. Creates or reuses the target script, normally by fixed id from the device manifest.
5. Stops the target script id before writing code.
6. Sets script config/name/boot flag from the manifest package entry.
7. Writes script code by appending chunks from the recipe.
8. Starts master if possible.
9. Self-stops.

## Components

Installer ensures:

- device-level installer state component from the device manifest, normally `text:200`
- recipe-owned virtual components from the package recipe being built

Installer creates missing components. It should not aggressively mutate or delete existing components because existing Homey/UI/manual configuration may depend on them.

## Completion model

Device version is not marked complete after each package. It is marked complete only when all expected versioned scripts exist with the expected names and fixed ids, and package components have been ensured during the install flow.

When no next missing package exists, installer writes:

```json
{"dv":<remote_device_version>,"ok":1}
```

Then it attempts to start master and self-stops.

## Script identity and fixed ids

Runtime scripts use versioned names and fixed ids.

Canonical ids:

```text
1 installer
2 boot
3 master
4 poll
5 state
6 weather
7 brain
8 driver
9 reboot
```

Examples:

```text
boot_v1_0_0
master_v1_4_0
poll_v3_3_2
state_v1_4_1
weather_v1_0_1
brain_v2_4_2
driver_v1_0_1
reboot_v1_0_0
```

Fixed ids are used to reduce heap pressure and to avoid `Script.List` during normal runtime and worker self-stop. Installer still uses `Script.List` because deployment/discovery is its job.

## Device manifest

A device manifest contains:

- `device_version`
- installer-state component definition
- expected scripts/packages
- fixed script id per package
- script version/name/recipe
- boot flag per package

Current primary manifest:

```text
rt/devices/8813bfdaa0c0.json
```

Example shape:

```json
{
  "device_version": 11,
  "state_component": {
    "type": "text",
    "id": 200,
    "name": "Installer state",
    "persisted": true,
    "default": "{\"dv\":0,\"ok\":0}"
  },
  "scripts": [
    {
      "role": "boot",
      "id": 2,
      "version": "1.0.0",
      "name": "boot_v1_0_0",
      "recipe": "rt/recipes/boot.json",
      "boot": true
    },
    {
      "role": "master",
      "id": 3,
      "version": "1.4.0",
      "name": "master_v1_4_0",
      "recipe": "rt/recipes/master.json",
      "boot": false
    }
  ]
}
```

## GitHub action workflow

For multi-file changes, the standard method is:

```text
tools/ChatGPT_Commit.yaml
```

The GitHub Action `Commit ChatGPT changes` defaults to this plan path. The user should not need to paste a new plan path for each change.

Use the YAML plan/action method for changes involving more than three files. Typical runtime changes touch at least:

- one or more code chunks
- recipe or manifest when versions change
- device manifest

## Raw GitHub cache note

Installer reads GitHub raw URLs from:

```text
https://raw.githubusercontent.com/marlov1974/shelly/main/
```

`raw.githubusercontent.com` can briefly serve cached content after a commit. If installer reports an older remote `device_version` than GitHub main shows, wait a short time and run installer again. A future installer improvement may add a cache-buster query parameter.

## Safety rule

Installer should always try to start master before stopping itself after a build or completion. If master is missing or broken, installer logs the failure and self-stops so it can be manually restarted.