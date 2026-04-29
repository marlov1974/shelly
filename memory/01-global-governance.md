# Global Memory Governance

## Purpose

The `/memory` folder is a versioned long-term memory for the project. It exists so that ChatGPT or another AI can read the current architecture and continue work without relying on transient chat context.

## Authority

1. GitHub memory is the canonical design memory.
2. Source code is the canonical record of what is actually implemented.
3. When memory and code conflict:
   - use the code to understand current implementation;
   - use memory to understand intended architecture;
   - update memory or code so they converge.

## Update rule

Any material change to runtime architecture, installer behavior, virtual components, KVS schema, device topology, physical measurement method or control logic should update the relevant memory document.

## Separation rule

Do not mix physical-system facts with digital-runtime facts unless the dependency is explicit.

- Physical facts belong in `ftx-fysiskt/`.
- Runtime and code facts belong in `ftx-digitalt/`.
- Reusable hardware/platform facts belong in `components/`.
- Heat pump and house-level thermal control belong in `house-control/`.

## Style rule

Memory documents should be concise, factual and implementation-oriented. They should capture stable design decisions, current contracts, known constraints and rationale. Avoid dumping logs, transient debugging details or obsolete experiments except in `99-old-notes.md` or decisions logs.

## Before coding

Before making code changes, read the relevant index and design files. For FTX Digital code changes, start with:

1. `ftx-digitalt/00-index.md`
2. `ftx-digitalt/03-runtime-model.md`
3. `ftx-digitalt/04-installer-bootstrap.md`
4. `ftx-digitalt/05-script-contracts.md`
5. `ftx-digitalt/06-kvs-and-components.md`
6. `ftx-digitalt/10-coding-standards.md`