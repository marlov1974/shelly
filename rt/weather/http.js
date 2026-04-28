// weather http 1.0.0
function lenOfString(s) {
  if (typeof s !== "string") return 0;
  return s.length;
}

function httpGet(url, cb) {
  Shelly.call("HTTP.GET", { url: url, timeout: 10 }, function (res, err) {
    if (err || !res || !res.body) {
      log("HTTP ERR");
      cb(null);
      return;
    }
    cb(res.body);
  });
}
