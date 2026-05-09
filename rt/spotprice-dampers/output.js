// spotprice-dampers output 1.2.0-fallback
function todayIsoLite() {
  var d = new Date();
  if (FETCH_TOMORROW) d = new Date(d.getTime() + 86400000);
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate();
}

function nowIsoLite() {
  var d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate() + "T" + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
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
  writePriceSeries(FALLBACK_PRICE_2H, "fallback", reason || "fallback", cb);
}
