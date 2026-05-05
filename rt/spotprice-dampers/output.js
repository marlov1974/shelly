// spotprice-dampers output 1.1.0-tibber
function todayIsoLite() {
  var d = new Date();
  if (FETCH_TOMORROW) d = new Date(d.getTime() + 86400000);
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate();
}

function nowIsoLite() {
  var d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate() + "T" + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
}

function writePriceBlocks(blocks) {
  var s = blocks.join(",");
  kvsSet(KEY_PRICE_2H, s, function () {
    kvsSet(KEY_PRICE_DATE, todayIsoLite(), function () {
      kvsSet(KEY_PRICE_SOURCE, "tibber", function () {
        kvsSet(KEY_PRICE_UPDATED, nowIsoLite(), function () {
          kvsSet(KEY_PRICE_STATUS, "ok", function () {
            log("OK " + s);
          });
        });
      });
    });
  });
}
