# ChatGPT Bootstrap Sequence

## Purpose

This file explains how a new ChatGPT or AI session must rebuild an accurate mental model of the repository.

The repository itself is the canonical long-term memory.

Memory files describe architectural intent and governance.

Runtime scripts and manifests describe the actual live implementation.

If memory files and runtime implementation differ, runtime implementation is considered more current unless explicitly marked otherwise.

---

# 1. Mandatory Bootstrap Entry Point

A new AI/chat session must begin with:

1. `README.md`
2. `memory/bootstrap-manifest.json`
3. every file listed in `memory/bootstrap-manifest.json` `read_order`, in order

This is mandatory before producing any user-facing answer.

The model must not answer, greet, ask clarifying questions, provide advice, summarize, or make partial claims before all mandatory bootstrap files have been read.

If any mandatory bootstrap step or file read fails, the model must stop and report:

```text
BOOTSTRAP FAILED
```

The report must include the missing step or file path and the reason.

The model must not silently continue with partial bootstrap context.

---

# 2. Bootstrap Manifest

The authoritative bootstrap file list is:

```text
memory/bootstrap-manifest.json
```

The manifest defines:

- repository
- ref
- mandatory/fail-closed behavior
- exact file read order
- runtime truth hierarchy
- governance rule for keeping the bootstrap current

Do not treat the read order in this Markdown file as authoritative. This file explains the bootstrap model. The manifest is the machine-readable source of truth for the actual mandatory file set.

---

# 3. Canonical Runtime Understanding

## Runtime model

The runtime is built around:

- one long-lived dispatcher (`master`)
- multiple one-shot workers
- KVS-based runtime state propagation
- explicit ownership boundaries
- deterministic sequencing

Normal cycle:

```text
poll -> state -> brain -> driver
```

Weather is periodic.

Installer and reboot are takeover flows.

## Ownership model

### poll

Owns:

- physical telemetry reads
- actuator state reads
- normalization into telemetry objects

### state

Owns:

- derived runtime state
- performance calculations
- selected UI metrics

### brain

Owns:

- desired control logic
- feature calculations
- target generation
- final intent generation

Brain writes desired state only.

Brain must not directly control actuators.

### driver

Owns:

- physical actuator application
- sequencing
- normalization
- safety normalization

Driver is the only layer allowed to apply physical outputs.

---

# 4. Architectural Principles

The repository strongly prefers:

- explicit contracts
- deterministic behavior
- versioned runtime units
- fixed ids
- minimal hidden state
- low heap pressure
- inspectable systems
- bounded ownership

Avoid:

- implicit coupling
- hidden side effects
- long callback chains
- mixed ownership
- runtime discovery during normal operation

---

# 5. Runtime Source of Truth

For runtime behavior, trust order is:

1. Runtime scripts/chunks
2. Recipes
3. Device manifests
4. Memory files
5. Historical discussion

The repository is expected to evolve continuously.

Architecture notes may lag implementation.

After bootstrap, claims about actual runtime behavior must be grounded in the relevant implementation files already read during bootstrap. If the user asks about an area outside the manifest, the relevant repo files must be read before making claims.
