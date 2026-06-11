# Architecture Invariants

This file defines stable architectural invariants for the Smart Home runtime.

These rules are intended to remain stable across runtime evolution.

---

# 1. Ownership Invariants

## 1.1 poll owns telemetry

Only `poll` owns:

- physical reads
- telemetry normalization
- actuator-state reads

No other script should directly aggregate runtime telemetry.

---

## 1.2 state owns derived runtime state

Only `state` owns:

- runtime-derived metrics
- performance calculations
- historical aggregation
- efficiency calculations

---

## 1.3 brain owns desired control logic

Only `brain` owns:

- target logic
- ventilation logic
- thermal strategy
- feature evaluation
- desired runtime intent

Brain writes desired state only.

Brain must never directly control hardware.

---

## 1.4 physical application is explicit

Physical application may only happen in explicitly documented apply layers:

- apply actuators
- sequence hardware
- normalize actuator output
- resolve hardware conflicts

Current allowed apply layers are:

- central `driver`, using the aggregate `ftx.intent.act` compatibility key
- local device executors, using their own `ftx.intent.dev.*` key

No other script may directly apply hardware state.

---

# 2. Runtime Invariants

## 2.1 master is the only long-lived runtime

`master` is the runtime dispatcher.

Workers are one-shot.

Workers should normally:

- execute
- persist state
- self-stop

---

## 2.2 KVS is runtime propagation

KVS is primarily:

- runtime propagation
- inter-script communication
- current-state sharing

KVS is not intended as durable deploy state.

---

## 2.3 Fixed ids are intentional

Fixed script ids are architectural.

They are not accidental implementation details.

---

## 2.4 Runtime is deterministic

The repository strongly prefers:

- deterministic execution
- explicit sequencing
- bounded ownership
- inspectable runtime state

---

# 3. Forbidden Patterns

Avoid introducing:

- hidden runtime state
- implicit ownership
- dynamic runtime discovery during normal operation
- direct actuator writes outside documented apply layers
- mixed telemetry and control ownership
- uncontrolled async fanout
- persistent timer forests
- duplicated KVS ownership
- cross-domain coupling without explicit contracts

---

# 4. AI Governance

When memory files and implementation differ:

- implementation is usually newer
- memory should later be aligned

AI sessions should read runtime manifests and recipes before proposing runtime changes.
