# Weather Model

## Role

`weather` is a one-shot script that runs between `state` and `brain` when due. It writes weather reference data to KVS so brain can adjust target/control logic.

## Output

Weather writes:

```json
{
  "solar_kwh_today": 0,
  "temp_now": 0
}
```

to:

```text
ftx.weather.act
```

## Data source

Weather uses Open-Meteo forecast endpoints.

Daily endpoint:

- `shortwave_radiation_sum`

Hourly endpoint:

- `temperature_2m`
- one forecast hour

## Location

Current coordinates:

```text
LAT = 59.6214405
LON = 17.7336153
```

## Solar model

Open-Meteo daily shortwave radiation is read in MJ/m² and converted to project-specific house solar-gain proxy:

```text
solar_kwh_today = round(shortwave_radiation_sum_MJ * SOLAR_GAIN_FACTOR_KWH_PER_MJ)
```

Current factor:

```text
SOLAR_GAIN_FACTOR_KWH_PER_MJ = 2.0
```

This is a control heuristic, not a physical kWh measurement.

## Temperature model

Weather reads current/near-current outdoor temperature from hourly `temperature_2m` and writes it as `temp_now`.

## Runtime cadence

Weather is not run every 60-second tick. Master runs weather:

- on tick 1 after boot/start
- then every `WEATHER_EVERY_TICKS`, currently 30 ticks

This gives brain weather input soon after reboot while avoiding unnecessary external HTTP calls.

## Brain usage

Brain reads `ftx.weather.act` in `io-weather.js` and uses it for weather bias during the configured weather-bias time window.

## Failure behavior

If HTTP or parsing fails, weather writes zero/fallback values and completes. It must self-stop even on failure.