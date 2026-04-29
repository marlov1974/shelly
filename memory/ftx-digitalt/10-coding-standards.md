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

Avoid duplicating helpers across scripts unless a script must be fully standalone, such as `installer`.

## Logging

Use:

```javascript
log("message");
```

Do not use `Text.Set` for runtime logging. Virtual text components are reserved for durable state such as installer state.

## Versioned names

Runtime scripts should use versioned names:

```text
role_vX_Y_Z
```

Examples:

```text
master_v1_0_0
poll_v3_3_0
state_v1_4_0
weather_v1_0_0
brain_v2_3_0
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