// spotprice-dampers output 1.3.0-seasonal-fallback
function targetDateObj() {
  var d = new Date();
  if (FETCH_TOMORROW) d = new Date(d.getTime() + 86400000);
  return d;
}

function todayIsoLite() {
  var d = targetDateObj();
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate();
}

function nowIsoLite() {
  var d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate() + "T" + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
}

function fallbackSeasonSeries() {
  var d = targetDateObj();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  if (m === 11 || m === 12 || m === 1 || m === 2) return FALLBACK_WINTER_PRICE_2H;
  if (m === 3 && day <= 29) return FALLBACK_WINTER_PRICE_2H;
  if (m >= 4 && m <= 9) return FALLBACK_SUMMER_PRICE_2H;
  if (m === 10 && day <= 25) return FALLBACK_SUMMER_PRICE_2H;
  return FALLBACK_WINTER_PRICE_2H;
}

function writePriceSeries(series, source, status, cb) {
  kvsSet(KEY_PRICE_2H, series, function () {
    kvsSet(KEY_PRICE_DATE, todayIsoLite(), function () {
      kvsSet(KEY_PRICE_SOURCE, source, function () {
        kvsSet(KEY_PRICE_UPDATED, nowIsoLite(), function () {
          kvsSet(KEY_PRICE_STATUS, status, function () {
            log(status + " " + series);
            if (cb) cb();
          });
        });
      });
    });
  });
}

function writePriceBlocks(blocks, cb) {
  writePriceSeries(blocks.join(","), "tibber", "ok", cb);
}

function writeFallbackPrices(reason, cb) {
  writePriceSeries(fallbackSeasonSeries(), "fallback", reason || "fallback", cb);
}
