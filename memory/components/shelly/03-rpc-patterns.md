# Shelly RPC Patterns

## General principle

Prefer simple, explicit RPC calls with small payloads. Avoid large batches unless the device and script have enough memory margin.

## Recommended patterns

- Read remote status through `HTTP.GET` to local device IPs.
- Apply local actuator output before remote calls when sequencing matters, e.g. dampers first.
- Use bounded timeouts.
- Self-stop worker scripts after completing their RPC work.

## Failure handling

Scripts should tolerate missing devices or failed RPC calls by writing safe defaults or leaving outputs unchanged, depending on role.

## Concurrency

Limit concurrent RPCs. Earlier design discussions treated roughly 5-7 concurrent RPCs as a practical upper bound, but current direction favors serial or tightly bounded execution.