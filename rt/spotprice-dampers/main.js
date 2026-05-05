// spotprice-dampers main 1.1.0-tibber
function run() {
  readTibberToken(function (token) {
    if (!token) { selfStop(); return; }

    fetchTibberPrices(token, function (body) {
      if (!body) { selfStop(); return; }

      var values = parseTotals(body, FETCH_TOMORROW);
      if (!values || !values.length) {
        log("NO PRICES");
        kvsSet(KEY_PRICE_STATUS, "no_prices", function () { selfStop(); });
        return;
      }

      var blocks = blocksFromTotals(values);
      if (!blocks) {
        log("BAD COUNT " + values.length);
        kvsSet(KEY_PRICE_STATUS, "bad_count_" + values.length, function () { selfStop(); });
        return;
      }

      writePriceBlocks(blocks);
      selfStop();
    });
  });
}

run();
