# Installer and Bootstrap

## Role

`installer` is the permanent deployment/bootstrap script. It is script id 1 and is the only script that is not auto-updated.

`boot` is the only autostart script. It is script id 2 and is auto-managed by installer like other runtime scripts.

## Boot responsibilities

On physical device startup/reboot, `boot`:

1. Starts automatically.
2. Waits for the local system, network and other devices to stabilize.
3. Starts `master` by fixed id 3.
4. Self-stops.

Boot does not set any ventilation startup state. The physical devices are expected to retain/restore their previous output states across reboot.

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
9. Starts master after build or completion when appropriate.
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

Master starts installer as its first selected score-dispatch worker after master start, and later periodically, until installer reaches completion.

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

Fixed ids are used to reduce heap pressure and to avoid `Script.List` during normal runtime and worker self-stop.

## Device manifest

A device manifest contains:

- `device_version`
- installer-state component definition
- expected scripts/packages
- fixed script id per package

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

Installer reads GitHub raw URLs. `raw.githubusercontent.com` can briefly serve cached content after a commit. If installer reports an older remote `device_version` than GitHub main shows, wait a short time and run installer again. A future installer improvement may add a cache-buster query parameter.

## Safety rule

Installer should always try to start master before stopping itself, even after a failed build. If master is missing or broken, installer logs the failure and self-stops so it can be manually restarted.