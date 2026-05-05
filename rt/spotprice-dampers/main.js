// spotprice-dampers main 1.1.4-callback-stop
function writeDebug(body, reason, cb) {
  var s = String(body || "");
  var shortBody = s;
  if (shortBody.length > 220) shortBody = shortBody.substring(0, 220);
  kvsSet(KEY_PRICE_DEBUG_LEN, String(s.length), function () {
    kvsSet(KEY_PRICE_DEBUG, reason + " " + shortBody, function () {
      if (cb) cb();
    });
  });
}

function run() {
  readTibberToken(function (token) {
    if (!token) { selfStop(); return; }

    fetchTibberPrices(token, function (body) {
      if (!body) { selfStop(); return; }

      var values = parseTotals(body, FETCH_TOMORROW);
      if (!values || !values.length) {
        log("NO PRICES");
        writeDebug(body, "no_prices", function () {
          kvsSet(KEY_PRICE_STATUS, "no_prices", function () { selfStop(); });
        });
        return;
      }

      var blocks = blocksFromTotals(values);
      if (!blocks) {
        log("BAD COUNT " + values.length);
        writeDebug(body, "bad_count_" + values.length, function () {
          kvsSet(KEY_PRICE_STATUS, "bad_count_" + values.length, function () { selfStop(); });
        });
        return;
      }

      writePriceBlocks(blocks, function () {
        selfStop();
      });
    });
  });
}

run();
