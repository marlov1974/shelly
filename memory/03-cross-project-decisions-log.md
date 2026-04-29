# Cross-Project Decisions Log

## 2026-04 — Split digital and physical FTX memory

Decision:
- FTX Digital runtime/design memory is separated from physical FTX aggregate memory.
- Shared platform/hardware facts are stored under `components/`.

Reason:
- The digital control system and physical aggregate have different change cadence, different failure modes and different reasoning needs.
- Keeping them separate reduces AI context drift.

## 2026-04 — GitHub memory is canonical long-term memory

Decision:
- Long-term project memory should live as Markdown files in GitHub.
- ChatGPT memory is useful but insufficient for large technical projects.

Reason:
- GitHub memory is versioned, inspectable, reusable by any AI, and co-located with code.

## 2026-04 — Shared component/platform memory

Decision:
- Shelly platform constraints, networking, sensors and actuators are documented under `components/` rather than repeated in each project area.

Reason:
- FTX Digital, FTX Physical and House Control reuse the same Shelly/network/sensor/actuator principles.