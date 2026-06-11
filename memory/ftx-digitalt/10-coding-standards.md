# Coding Standards

## Delivery rule

When new Shelly code is delivered, provide the full code for the relevant script/chunks. Avoid partial patches unless explicitly requested.

## Runtime structure

Use the established script pattern:

- `master` is long-lived.
- Worker scripts are one-shot.
- Worker scripts self-stop after completing their job.
- Runtime logging uses `print()` only through common `log()`.

## Callback rule

Shelly RPC, KVS and HTTP calls are asynchronous.

I/O functions that call Shelly/KVS/HTTP must take a callback and call it only when the async work is complete.

Do not do this:

```javascript
Shelly.call("RPC", {}, function (res, err) { ctx.value = res; });
wait(250);
```

The callback may not have run when the wait ends. A busy wait can also block the event loop.

Do this instead:

```javascript
function readSomething(ctx, next) {
  Shelly.call("RPC", {}, function (res, err) {
    ctx.value = (!err && res) ? res.value : 0;
    next();
  });
}
```

Timers may be used for spacing, watchdogs and delayed next steps, not as a substitute for callback completion.

## Classic functions

Pure calculations should be classic synchronous functions. Examples:

- normalization
- target calculations
- fan percentage calculations
- VVX cost comparison
- intent resolution

## Chunk size

Practical target sizes:

- common/helper chunks: preferably below 2 kB
- I/O chunks: preferably below 2–3 kB
- feature chunks: preferably below 2–4 kB
- total built script: preferably below 25–30 kB

These are practical Shelly/mJS heap guidelines, not hard protocol limits.

## Common helpers

Use common helpers where possible:

- `rt/common/script.js` for `log()` and self-stop helpers.
- `rt/common/helpers.js` for numeric and component wrappers.
- `rt/common/kvs.js` for KVS wrappers.
- `rt/common/shelly.js` for Shelly status parsing helpers.

Avoid duplicating helpers across runtime scripts unless a script must be fully standalone.

## Logging

Use:

```javascript
log("message");
```

Do not use `Text.Set` for runtime logging. Virtual text components are reserved for durable state such as Mac deploy state and operator-visible values.

## Versioned names

Runtime scripts should use versioned names:

```text
role_vX_Y_Z
```

Examples:

```text
master_v1_0_0
poll_v3_3_0
state_v1_4_1
weather_v1_0_1
brain_v2_4_2
reboot_v1_0_0
```

## Recipe structure

A recipe should contain:

- `boot`
- `components`
- `chunks`

Keep recipes compact. Component definitions may include type, id, name, persistence, default, enum options, number min/max/step/unit.

## GitHub operations

The GitHub connector cannot rename/move a file with `update_file`. Moving a file requires:

1. fetch old file
2. create new file at target path
3. delete old file using old SHA

Do this in small batches to avoid SHA/synchronization issues.

## Multi-file change method

Use two commit methods depending on change size.

### Direct connector writes

Use direct GitHub connector writes for:

```text
- one-off small changes
- large individual runtime chunks
- memory/documentation edits
- any change set larger than the YAML batch rule below
```

### YAML batch plan

For grouped deploy/runtime changes, prefer a planned GitHub Action flow when the change set is small enough.

Standard plan file:

```text
tools/ChatGPT_Commit.yaml
```

Standard workflow:

```text
.github/workflows/commit-chatgpt-changes.yml
```

Rule of thumb:

```text
YAML batch plan may contain up to 5 changed files.
More than 5 files should be handled with direct connector writes for the larger files,
then YAML only for the remaining small files and/or manifest bump.
```

Reason:

```text
The YAML method was introduced to avoid many manual approvals for multi-file commits.
However, ChatGPT/GitHub tool payloads have a practical size ceiling.
Tests showed small YAML plans work, while larger inline payloads can be blocked by the tool layer.
Use 5 files as the operational limit instead of trying to pack large commits into one YAML file.
```

Method:

1. ChatGPT writes a YAML plan into the repository and gets user approval through the normal GitHub write flow.
2. The user runs the manual GitHub Action from the GitHub app/web UI.
3. The Action applies the planned changes, commits them and pushes them.

For runtime deploys:

```text
- If the deploy change touches 5 files or fewer, YAML may carry the full change.
- If the deploy change touches more than 5 files, direct-write large/runtime chunks first.
- Use direct Mac deploy for the final verified live installation when runtime code changes.
```

Important rule:

```text
Changing runtime chunks alone is not enough for deployment.
Mac direct deploy uses rt/devices/<device-id>.json device_version and package version/name.
When runtime code changes, remember the manifest bump and deploy with tools/g1_vvx_deploy.py.
```

Smaller changes of one to three files can still be done directly through the GitHub connector when that is simpler.
