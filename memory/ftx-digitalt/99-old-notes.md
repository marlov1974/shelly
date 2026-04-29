# FTX Digital Old Notes

This file captures superseded approaches and mistakes that should not drive new implementation.

## Superseded installer split

An earlier architecture split installation into:

- `inst.schedule`
- `inst.poll`
- `inst.build`

This was useful while learning Shelly resource constraints and callback patterns, but has been superseded by one self-contained `installer` at script id 1 plus long-lived `master`.

## Text.Set logging

Runtime logging previously used virtual Text components. This has been removed. Use print-only logging.

## KVS version keys

Earlier installer versions used `ftx.ver.<script>` KVS keys. This has been superseded by:

- device completion state in `text:200`
- versioned script names such as `brain_v2_3_0`

## number:201 mistake

`number:201` was temporarily mislabeled as fan flow average. This is wrong. It is Total power, W.

## Old weather chunks

Older weather/common chunks may remain in the repository until cleanup. Active weather recipe should use the current modular weather structure documented in `09-weather-model.md` and the active `rt/recipes/weather.json`.