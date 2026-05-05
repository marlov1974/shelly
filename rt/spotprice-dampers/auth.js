// spotprice-dampers auth 1.1.0-tibber
function readTibberToken(cb) {
  Shelly.call("Text.GetStatus", { id: TIBBER_TOKEN_TEXT_ID }, function (res, err) {
    var token = "";
    if (!err && res && res.value) token = String(res.value || "");
    if (!token) {
      log("NO TOKEN");
      kvsSet(KEY_PRICE_STATUS, "no_token", function () { cb(""); });
      return;
    }
    cb(token);
  });
}
