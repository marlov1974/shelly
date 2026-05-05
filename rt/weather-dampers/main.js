// weather-dampers main 1.1.0
function run() {
  fetchWeather(function (body) {
    if (!body) { selfStop(); return; }

    var w = buildWeather(body);
    if (!w) {
      log("PARSE ERR");
      kvsSet(KEY_WEATHER_STATUS, "parse_error", function () { selfStop(); });
      return;
    }

    writeWeather(w, function () {
      selfStop();
    });
  });
}

run();
