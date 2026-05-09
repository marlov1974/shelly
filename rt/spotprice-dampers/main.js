// spotprice-dampers main 1.2.0-fallback
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

function fallback(reason, body) {
  log("FALLBACK " + reason);
  writeDebug(body || "", reason, function () {
    writeFallbackPrices(reason, function () { selfStop(); });
  });
}

function run() {
  readTibberToken(function (token) {
    if (!token) { fallback("no_token", ""); return; }

    fetchTibberPrices(token, function (body) {
      if (!body) { fallback("no_body", ""); return; }

      var values = parseTotals(body, FETCH_TOMORROW);
      if (!values || !values.length) {
        fallback("no_prices", body);
        return;
      }

      var blocks = blocksFromTotals(values);
      if (!blocks) {
        fallback("bad_count_" + values.length, body);
        return;
      }

      writePriceBlocks(blocks, function () {
        selfStop();
      });
    });
  });
}

run();
