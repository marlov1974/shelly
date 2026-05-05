// spotprice-dampers http 1.1.0-tibber
function fetchTibberPrices(token, cb) {
  kvsSet(KEY_PRICE_STATUS, "fetching", function () {
    Shelly.call("HTTP.POST", {
      url: TIBBER_URL,
      headers: tibberHeaders(token),
      body: tibberPayload(),
      timeout: 15
    }, function (res, err) {
      if (err || !res || !res.body) {
        log("HTTP ERR");
        kvsSet(KEY_PRICE_STATUS, "http_error", function () { cb(null); });
        return;
      }
      cb(String(res.body || ""));
    });
  });
}
