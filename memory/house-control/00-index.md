# House Control Memory Index

This folder is now legacy/source material after the G2 repository split.

New G2 whole-house architecture, requirements, package workflow and implementation belong in:

```text
marlov1974/smart-home
```

## Current role of this folder

The files in this folder are retained because they contain useful pre-split knowledge, especially:

- heat pump physical command mappings
- heat-pump operating schedules
- early Gen2 needs-based architecture discussion
- brine/floor/cooling notes that may need migration

They should be treated as source material for migration, not as the active G2 source of truth.

## Boundary

Current Gen1 FTX runtime maintenance belongs under:

```text
memory/ftx-digitalt/13-gen1-runtime-maintenance.md
```

Physical FTX aggregate facts belong under:

```text
memory/ftx-fysiskt/
```

New G2 Smart Home decisions belong under:

```text
marlov1974/smart-home
```

## Key legacy documents

```text
00-index.md
01-hardware-inventory.md
02-heat-pump-operating-schedules.md
03-gen2-needs-architecture.md
```

## Rule

Do not add new G2 design decisions here.

If a fact from this folder is still valid for G2, migrate or copy it into `marlov1974/smart-home` through an ordered G2 package.
