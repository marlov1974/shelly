// spotprice-dampers http 1.1.2-tibber-auth-header
function fetchTibberPrices(token, cb) {
  kvsSet(KEY_PRICE_STATUS, "fetching", function () {
    Shelly.call("HTTP.Request", {
      method: "POST",
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
