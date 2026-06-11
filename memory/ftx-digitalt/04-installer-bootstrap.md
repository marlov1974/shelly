# Mac Direct Deploy and Bootstrap

## Role

The active Gen1 VVX runtime no longer uses a resident Shelly-side installer.

Code installation is now a Mac/Codex responsibility. The Mac reads the local
repository manifest and recipes, builds complete scripts locally, uploads them
to the VVX runtime host through Shelly RPC `Script.PutCode`, verifies live script
state, and then restarts `master`.

Current direct deploy tool:

```text
tools/g1_vvx_deploy.py
```

Current target:

```text
VVX runtime host: 192.168.77.40
operator URL:     http://192.168.86.240:8040/
device id:        8813bfdaa0c0
manifest:         rt/devices/8813bfdaa0c0.json
```

## Boot responsibilities

On physical device startup/reboot, `boot`:

1. Starts automatically.
2. Waits for the local system, network and other devices to stabilize.
3. Starts `master` by fixed id 3.
4. Self-stops.

Boot does not set any ventilation startup state. The physical devices are
expected to retain/restore their previous output states across reboot, including
VVX.

## Direct deploy responsibilities

The Mac deploy tool:

1. Reads `Shelly.GetDeviceInfo` from the target endpoint.
2. Verifies that the live device id ends with `8813bfdaa0c0`.
3. Reads `rt/devices/8813bfdaa0c0.json`.
4. Reads each selected package recipe locally.
5. Concatenates recipe chunks locally into one complete script body.
6. Stops local runtime scripts before writing selected script slots.
7. Writes code with bounded RPC upload chunks using `Script.PutCode`.
8. Sets script name and autostart flag from the manifest.
9. Writes the local deploy-state text component after successful upload.
10. Optionally deletes the obsolete `Installer` script at id 1.
11. Starts `master` when requested.

The Shelly device must not fetch runtime code from GitHub during normal deploy.

## Deploy state

The persistent text component remains:

```text
text:200
```

Compact JSON format:

```json
{"dv":31,"ok":1}
```

Meaning:

- `dv`: locally completed device version.
- `ok`: 1 when the Mac deploy tool has verified the selected deploy.

KVS is not used for deploy version state because KVS has shown unreliable
persistence across reboot.

## Script identity and fixed ids

Runtime scripts use versioned names and fixed ids.

Canonical active ids:

```text
2 boot
3 master
4 retired central poll slot; live VVX device reuses it for local VVX master
5 state
6 weather
7 brain
8 driver
9 reboot
```

Script id 1 is outside the central manifest and is used by the local VVX
telemetry publisher. If an obsolete `Installer` script remains on a live device,
it should be stopped and deleted only after `master` no longer schedules
installer.

Fixed ids are used to reduce heap pressure and to avoid `Script.List` during
normal runtime and worker self-stop. The Mac deploy tool may use `Script.List`
because deployment/discovery is its job.

Central VVX deploy must not stop slot 4. Slot 4 is no longer central poll; it is
the local VVX master when the local-driver migration is active.

## Device manifest

A device manifest contains:

- `device_version`
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
  "device_version": 31,
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
      "version": "1.5.0",
      "name": "master_v1_5_0",
      "recipe": "rt/recipes/master.json",
      "boot": false
    }
  ]
}
```

## Typical deploy workflow

For a runtime change:

```text
1. Edit runtime chunks.
2. Bump device_version and the changed script package version/name.
3. Run local static validation.
4. Run tools/g1_vvx_deploy.py plan.
5. Run tools/g1_vvx_deploy.py deploy for the changed role(s).
6. Verify live script list, KVS/runtime output and master health.
```

Example:

```bash
python3 tools/g1_vvx_deploy.py plan --role master,reboot --delete-installer
python3 tools/g1_vvx_deploy.py deploy --role master,reboot --delete-installer
```

## Safety rule

Direct deploy must verify target identity before live writes. It must not perform
actuator/output operations. Runtime behavior changes are limited to the script
code being deployed and the normal behavior of the restarted `master`.
