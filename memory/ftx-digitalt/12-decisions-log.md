# FTX Digital Decisions Log

## 2026-04 — One long-lived master

Decision:
- Use one long-lived `master` script for runtime orchestration.
- `poll`, `state`, `weather`, `brain` and later `driver` are one-shot scripts.

Reason:
- Reduces heap pressure and concurrency issues on Shelly/mJS.
- Makes each script easier to test and debug.

Status:
- Superseded by the later score-dispatcher master design. Master is still long-lived, but no longer runs a full chained cycle inside one 60-second tick.

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
- Add `weather` as separate one-shot script before brain.
- Weather writes `ftx.weather.act`.
- Weather must also run during startup before the first brain run.

Reason:
- Brain needs current weather reference data but should not perform external HTTP calls.
- Weather should not replace poll/state; it is an extra worker inserted before the normal control chain continues.

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

## 2026-04 — Boot is the only autostart script

Decision:
- `boot` is fixed at script id 2 and is the only script with Run on startup enabled.
- `boot` waits for stabilization, starts master, and self-stops.
- `master` is no longer autostart.

Reason:
- Physical device reboot should not force ventilation into a special startup mode.
- Devices are configured to restore previous physical output states after reboot, including VVX.
- Boot provides a controlled delay for network, sensors and other devices to stabilize.

## 2026-04 — Fixed runtime script ids

Decision:
- Runtime scripts use fixed ids:

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

Reason:
- Reduces heap pressure.
- Avoids `Script.List` during normal runtime.
- Enables worker `selfStop()` via fixed `SCRIPT_ID`.

## 2026-04 — Master v1.4 score dispatcher

Decision:
- Replace the chained 60-second master cycle with a 15-second score dispatcher.
- Each tick starts exactly one worker.
- At tick start, master stops the previously started worker if it is still running.
- All scores are decremented, the lowest score wins, and the selected worker's score is reset.

Initial scores:

```text
installer = 1
poll      = 2
state     = 3
weather   = 4
brain     = 5
driver    = 6
reboot    = 5760
```

Reset scores:

```text
poll/state/brain/driver = 4
installer              = 20
weather                = 240
reboot                 = 5760
```

Reason:
- Minimizes master heap usage.
- Removes long callback chains and full-cycle waiting logic.
- Allows weather to be inserted naturally without replacing poll/state.
- Provides a simple watchdog model for hanging worker scripts.

## 2026-04 — Reboot as score-driven takeover worker

Decision:
- `reboot` is fixed at script id 9 and selected by master through the score system roughly every 24 hours.
- Reboot is no longer tied to a specific wall-clock window.
- Reboot stops all other local scripts including master, waits 5 minutes, reboots remote devices, waits 5 minutes, then reboots the local device.

Reason:
- Recovers from long-lived Shelly memory/RPC degradation.
- Letting the reboot time drift is acceptable and avoids a fragile wall-clock dependency.

## 2026-04 — Standard GitHub action plan path

Decision:
- All future multi-file ChatGPT-generated repository changes should use the same plan file:

```text
tools/ChatGPT_Commit.yaml
```

Reason:
- The user should not need to paste a new YAML path into the GitHub Action each time.
- The `Commit ChatGPT changes` workflow defaults to this plan path.

## 2026-04 — Raw GitHub cache awareness

Decision:
- If installer sees an older remote `device_version` than the GitHub file on `main`, treat this first as raw GitHub caching.

Reason:
- `raw.githubusercontent.com` can briefly serve stale content after commit.
- In practice, waiting and rerunning installer resolved this.