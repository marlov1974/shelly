// === DEVICE: dampers-8813bfdaa0c0 / SCRIPT: spotprice v0.1.0 ===
// Purpose:
// - Fetch elprisetjustnu spot prices for one calendar day
// - Parse SEK_per_kWh without JSON.parse to reduce memory pressure
// - Convert 96 quarter-hour prices into 12 two-hour blocks
// - Add configurable variable charges
// - Store only final 12 total prices in KVS
(function () {
  "use strict";

  // ---------------------------
  // CONFIG - user adjustable
  // ---------------------------
  var PRICE_AREA = "SE3";
  var FETCH_TOMORROW = true; // daily run around 14:00 should normally fetch tomorrow

  // VAT and price source assumptions
  var VAT_RATE = 0.25;
  var SPOT_PRICE_IS_EX_VAT = true;

  // Retailer / elhandel, SEK/kWh ex VAT.
  // Tibber example: 0.06 SEK/kWh ex VAT = 0.075 inc VAT.
  var RETAILER_MARKUP_SEK_PER_KWH_EX_VAT = 0.06;
  var RETAILER_VARIABLE_COST_SEK_PER_KWH_EX_VAT = 0.00;

  // Energy tax, SEK/kWh ex VAT. Adjust per year/location.
  var ENERGY_TAX_SEK_PER_KWH_EX_VAT = 0.36;

  // Grid model:
  // "flat"        = same variable grid transfer fee all hours
  // "time_tariff" = high/low transfer fee based on months, weekdays and hours
  var GRID_MODEL = "time_tariff";

  // Grid fees are configured inc VAT because Swedish grid tariff tables are usually published inc VAT.
  var GRID_FLAT_SEK_PER_KWH_INC_VAT = 0.305;
  var GRID_HIGH_SEK_PER_KWH_INC_VAT = 0.765;
  var GRID_LOW_SEK_PER_KWH_INC_VAT = 0.305;

  // High-load definition. Monday=1 ... Sunday=7.
  var GRID_HIGH_MONTHS = "1,2,3,11,12";
  var GRID_HIGH_WEEKDAYS = "1,2,3,4,5";
  var GRID_HIGH_START_HOUR = 6;
  var GRID_HIGH_END_HOUR = 22;

  // v0.1: public holiday exceptions are not implemented.
  var GRID_USE_HOLIDAY_EXCEPTIONS = false;

  // KVS keys
  var KEY_PRICE_2H = "hp.price.2h";
  var KEY_PRICE_DATE = "hp.price.date";
  var KEY_PRICE_AREA = "hp.price.area";
  var KEY_PRICE_STATUS = "hp.price.status";
  var KEY_PRICE_UPDATED = "hp.price.updated";

  // ---------------------------
  // helpers
  // ---------------------------
  function log(s) {
    print("spotprice " + String(s || ""));
  }

  function pad2(n) {
    n = Number(n);
    return n < 10 ? "0" + n : String(n);
  }

  function round3(n) {
    return Math.round(n * 1000) / 1000;
  }

  function incVat(v) {
    return v * (1 + VAT_RATE);
  }

  function containsCsvInt(csv, value) {
    return ("," + csv + ",").indexOf("," + String(value) + ",") >= 0;
  }

  function nowIsoLite() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + "T" +
      pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  }

  function targetDateObj() {
    var d = new Date();
    if (FETCH_TOMORROW) d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    return d;
  }

  function dateStr(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function urlForDate(d) {
    var y = d.getFullYear();
    var m = pad2(d.getMonth() + 1);
    var dd = pad2(d.getDate());
    return "https://www.elprisetjustnu.se/api/v1/prices/" + y + "/" + m + "-" + dd + "_" + PRICE_AREA + ".json";
  }

  // JS getDay: 0=Sunday ... 6=Saturday. Convert to Monday=1 ... Sunday=7.
  function weekdayMon1(d) {
    var w = d.getDay();
    return w === 0 ? 7 : w;
  }

  function isHighLoadTime(month, weekday, hour) {
    if (GRID_MODEL !== "time_tariff") return false;
    if (GRID_USE_HOLIDAY_EXCEPTIONS) {
      // Not implemented in v0.1. Keep normal weekday logic.
    }
    if (!containsCsvInt(GRID_HIGH_MONTHS, month)) return false;
    if (!containsCsvInt(GRID_HIGH_WEEKDAYS, weekday)) return false;
    if (hour < GRID_HIGH_START_HOUR || hour >= GRID_HIGH_END_HOUR) return false;
    return true;
  }

  function gridPriceIncVat(month, weekday, hour) {
    if (GRID_MODEL === "flat") return GRID_FLAT_SEK_PER_KWH_INC_VAT;
    if (GRID_MODEL === "time_tariff") {
      return isHighLoadTime(month, weekday, hour) ? GRID_HIGH_SEK_PER_KWH_INC_VAT : GRID_LOW_SEK_PER_KWH_INC_VAT;
    }
    return GRID_FLAT_SEK_PER_KWH_INC_VAT;
  }

  function totalPriceIncVat(spotPrice, month, weekday, hour) {
    var spotIncVat = SPOT_PRICE_IS_EX_VAT ? incVat(spotPrice) : spotPrice;
    var retailerIncVat = incVat(RETAILER_MARKUP_SEK_PER_KWH_EX_VAT) + incVat(RETAILER_VARIABLE_COST_SEK_PER_KWH_EX_VAT);
    var energyTaxIncVat = incVat(ENERGY_TAX_SEK_PER_KWH_EX_VAT);
    var gridIncVat = gridPriceIncVat(month, weekday, hour);
    return spotIncVat + retailerIncVat + energyTaxIncVat + gridIncVat;
  }

  function kvSet(key, value, cb) {
    Shelly.call("KVS.Set", { key: key, value: String(value) }, function (res, err) {
      if (err) log("KVS.Set failed " + key + " " + JSON.stringify(err));
      if (cb) cb(!err);
    });
  }

  function setStatus(s) {
    kvSet(KEY_PRICE_STATUS, s, null);
  }

  // Parse response body without JSON.parse. Only reads SEK_per_kWh values.
  function buildBlocksFromBody(body, d) {
    var key = '"SEK_per_kWh":';
    var pos = 0;
    var qCount = 0;
    var countInBlock = 0;
    var sum = 0;
    var blocks = [];
    var month = d.getMonth() + 1;
    var weekday = weekdayMon1(d);

    while (true) {
      var i = body.indexOf(key, pos);
      if (i < 0) break;
      i += key.length;

      var j = i;
      while (j < body.length) {
        var c = body.charAt(j);
        if ((c >= "0" && c <= "9") || c === "." || c === "-") j++;
        else break;
      }

      var spot = Number(body.substring(i, j));
      if (!isNaN(spot)) {
        var hour = Math.floor(qCount / 4);
        var total = totalPriceIncVat(spot, month, weekday, hour);
        sum += total;
        countInBlock++;
        qCount++;

        if (countInBlock === 8) {
          blocks.push(round3(sum / 8));
          sum = 0;
          countInBlock = 0;
        }
      }
      pos = j;
    }

    if (qCount !== 96 || blocks.length !== 12) {
      log("bad count q=" + qCount + " blocks=" + blocks.length);
      return null;
    }

    return blocks;
  }

  function saveBlocks(blocks, d) {
    var s = blocks.join(",");
    kvSet(KEY_PRICE_2H, s, function () {
      kvSet(KEY_PRICE_DATE, dateStr(d), function () {
        kvSet(KEY_PRICE_AREA, PRICE_AREA, function () {
          kvSet(KEY_PRICE_UPDATED, nowIsoLite(), function () {
            kvSet(KEY_PRICE_STATUS, "ok", function () {
              log("ok " + dateStr(d) + " " + s);
            });
          });
        });
      });
    });
  }

  function run() {
    var d = targetDateObj();
    var url = urlForDate(d);
    log("GET " + url);
    setStatus("fetching");

    Shelly.call("HTTP.GET", { url: url, timeout: 15 }, function (res, err) {
      if (err || !res || !res.body) {
        log("http error " + JSON.stringify(err || {}));
        setStatus("http_error");
        return;
      }

      var blocks = buildBlocksFromBody(res.body, d);
      if (!blocks) {
        setStatus("bad_count");
        return;
      }

      saveBlocks(blocks, d);
    });
  }

  run();
})();
