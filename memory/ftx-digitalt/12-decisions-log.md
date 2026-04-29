# FTX Digital Decisions Log

## 2026-04 — One long-lived master

Decision:
- Use one long-lived `master` script for runtime orchestration.
- `poll`, `state`, `weather`, `brain` and later `driver` are one-shot scripts.

Reason:
- Reduces heap pressure and concurrency issues on Shelly/mJS.
- Makes each script easier to test and debug.

## 2026-04 — Installer as permanent bootstrap

Decision:
- Installer is fixed at script id 1 and is not auto-updated.
- Installer can be run manually on an incomplete device.
- Installer creates master and worker scripts step by step.

Reason:
- There must be one stable recovery path even if all auto-managed scripts are broken.

## 2026-04 — Collapse inst.poll and inst.build back into installer

Decision:
- Earlier split installer design was collapsed into one self-contained installer.

Reason:
- Runtime tests showed one-shot scripts and serial callback chains are stable enough.
- A single installer avoids overlapping install flows.

## 2026-04 — Installer builds one package per run

Decision:
- Installer builds exactly one missing package per invocation.
- Master starts installer repeatedly until device is complete.

Reason:
- Limits heap pressure and external HTTP/JSON workload per run.
- Makes failed builds easier to isolate.

## 2026-04 — Device version in text component, not KVS

Decision:
- Use persistent `text:200` for installer state, e.g. `{"dv":1,"ok":1}`.
- Do not use KVS for durable installer version state.

Reason:
- KVS has shown unreliable persistence across reboot.

## 2026-04 — Print-only logging

Decision:
- Runtime scripts log with `print()` only.
- `Text.Set` logging is removed.

Reason:
- Frees virtual component capacity.
- Reduces unnecessary component writes.

## 2026-04 — Brain signal bus

Decision:
- Replace `ctx.dx` with `ctx.sig` in brain.
- Features write signals/candidates/constraints.
- Intent layer resolves signals into final `ctx.intent`.

Reason:
- Cleaner separation between feature reasoning and actuator decision.
- Easier to discuss and modify features independently.

## 2026-04 — Weather as one-shot script before brain

Decision:
- Add `weather` as separate one-shot script between `state` and `brain`.
- Weather writes `ftx.weather.act`.

Reason:
- Brain needs current weather reference data but should not perform external HTTP calls.

## 2026-04 — Component ownership by recipe

Decision:
- Device manifest owns only device/bootstrap-level components.
- Script recipes own their script-specific virtual component contracts.

Reason:
- Keeps device manifest compact.
- Makes script contracts explicit and modular.

## 2026-04 — number:201 correction

Decision:
- `number:201` is Total power, W.
- It is not fan flow average.

Reason:
- Average l/s was never agreed as a virtual component and should remain in telemetry KVS unless explicitly added later.