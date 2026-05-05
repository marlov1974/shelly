  // ---------------------------
  // Helpers
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
    if (FETCH_TOMORROW) d = new Date(d.getTime() + 86400000);
    return d;
  }

  function dateStr(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function urlForDate(d) {
    return "https://www.elprisetjustnu.se/api/v1/prices/" +
      d.getFullYear() + "/" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + "_" + PRICE_AREA + ".json";
  }

  function weekdayMon1(d) {
    var w = d.getDay();
    return w === 0 ? 7 : w;
  }

  function isHighLoadTime(month, weekday, hour) {
    return GRID_MODEL === "time_tariff" &&
      containsCsvInt(GRID_HIGH_MONTHS, month) &&
      containsCsvInt(GRID_HIGH_WEEKDAYS, weekday) &&
      hour >= GRID_HIGH_START_HOUR && hour < GRID_HIGH_END_HOUR;
  }

  function gridPriceIncVat(month, weekday, hour) {
    if (GRID_MODEL === "flat") return GRID_FLAT_SEK_PER_KWH_INC_VAT;
    if (GRID_MODEL === "time_tariff") return isHighLoadTime(month, weekday, hour) ? GRID_HIGH_SEK_PER_KWH_INC_VAT : GRID_LOW_SEK_PER_KWH_INC_VAT;
    return GRID_FLAT_SEK_PER_KWH_INC_VAT;
  }

  function totalPriceIncVat(spotPrice, month, weekday, hour) {
    var spotIncVat = SPOT_PRICE_IS_EX_VAT ? incVat(spotPrice) : spotPrice;
    return spotIncVat +
      incVat(RETAILER_MARKUP_SEK_PER_KWH_EX_VAT) +
      incVat(RETAILER_VARIABLE_COST_SEK_PER_KWH_EX_VAT) +
      incVat(ENERGY_TAX_SEK_PER_KWH_EX_VAT) +
      gridPriceIncVat(month, weekday, hour);
  }

  function kvSet(key, value, cb) {
    Shelly.call("KVS.Set", { key: key, value: String(value) }, function (res, err) {
      if (err) log("KVS.Set failed " + key);
      if (cb) cb(!err);
    });
  }

  function setStatus(s) {
    kvSet(KEY_PRICE_STATUS, s, null);
  }

