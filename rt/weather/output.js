// weather output 1.0.0
function saveWeatherAct(ctx, cb) {
  log("KVS SET solar=" + ctx.act.solar_kwh_today + " temp=" + ctx.act.temp_now);
  kvsSet(KEY_WEATHER_ACT, ctx.act, function (ok) {
    if (!ok) { cb(0); return; }
    log("KVS OK");
    cb(1);
  });
}
