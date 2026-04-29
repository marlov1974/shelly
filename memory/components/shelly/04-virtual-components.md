# Shelly Virtual Components

## Role

Virtual components are used for UI, command input, durable small values and user-visible derived metrics.

## Current FTX known components

- `boolean:200` On
- `boolean:201` Nightmode
- `enum:200` Mode, values currently documented as `STD`, `BST`, `FIRE`, `MAN`
- `number:200` Temp setpoint
- `number:201` Total power, W
- `number:202` VVX efficiency, %
- `number:203` Fan avg pct, %
- `number:204` Target to house, C
- `text:200` Installer state

## Rule

A virtual component ID must have one semantic meaning. Do not reuse an ID for a new purpose without explicitly migrating memory and code.

## Known correction

`number:201` is Total power. It must not be treated as average flow or fan average.