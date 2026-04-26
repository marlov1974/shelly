// brain io-weather 2.0.0
function readWeather(ctx, cb) {
  kvsGet(KEY_WEATHER_ACT, function (v) {
    var w = (v && typeof v === "object") ? v : {};
    ctx.weather.solar_kwh_today = i(n(w.solar_kwh_today, 0));
    ctx.weather.temp_now_c = d1(n(w.temp_now, 0));
    cb();
  });
}
