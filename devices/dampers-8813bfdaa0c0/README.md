# Dampers lab device – 8813bfdaa0c0

Purpose: lab device for VP / home-control support scripts on the dampers hub.

This device is intentionally separated from the current production scripts so that Installer, Boot, Master, Spotprice and Weather can be developed and tested without disturbing the running FTX control stack.

## Device

```text
Device role: dampers lab / VP optimizer support
Device id:   8813bfdaa0c0
Repo path:   devices/dampers-8813bfdaa0c0/
```

## Scripts

| Script | File | Purpose |
|---|---|---|
| Installer | `scripts/installer.js` | Creates/updates the lab scripts from GitHub raw URLs |
| Boot | `scripts/boot.js` | Starts selected lab scripts after boot |
| Master | `scripts/master.js` | Seeds basic KVS defaults and acts as lightweight hub script |
| Spotprice | `scripts/spotprice.js` | Fetches elprisetjustnu prices, converts to 12 two-hour total-price blocks and stores KVS |
| Weather | `scripts/weather.js` | Placeholder/scaffold for weather fetch and weather KVS output |

## Initial KVS keys

```text
hp.price.2h       string, 12 comma-separated prices, SEK/kWh incl. VAT and variable charges
hp.price.date     string, YYYY-MM-DD
hp.price.area     string, SE1/SE2/SE3/SE4
hp.price.status   string, ok/error/status
hp.price.updated  string, ISO-like timestamp if available
hp.weather.status string, weather script status
```

## Price model v1

`hp.price.2h` stores only final calculated prices, not raw spot prices.

Each value is SEK/kWh including:

```text
spot price + retailer variable markup + energy tax + grid transfer fee + VAT handling
```

Fixed monthly/yearly fees are excluded because they do not affect the optimization decision.

## Important note

These scripts are initial lab scaffolding and must be tested on the Shelly device before being treated as production-ready.
