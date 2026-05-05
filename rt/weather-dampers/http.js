// weather-dampers http 1.1.0
function fetchWeather(cb) {
  kvsSet(KEY_WEATHER_STATUS, "fetching", function () {
    Shelly.call("HTTP.GET", { url: weatherUrl(), timeout: 15 }, function (res, err) {
      if (err || !res || !res.body) {
        log("HTTP ERR");
        kvsSet(KEY_WEATHER_STATUS, "http_error", function () { cb(null); });
        return;
      }
      cb(String(res.body || ""));
    });
  });
}
