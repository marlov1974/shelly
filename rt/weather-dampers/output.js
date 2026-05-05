// weather-dampers output 1.1.0
function weatherDateTime() {
  var d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate() + "T" + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
}

function writeWeather(w, cb) {
  kvsSet(KEY_WEATHER_TEMP_C, String(w.temp), function () {
    kvsSet(KEY_WEATHER_SOLAR_WM2, String(w.solar), function () {
      kvsSet(KEY_WEATHER_DAY_AVG_TEMP_C, String(w.dayAvgTemp), function () {
        kvsSet(KEY_WEATHER_SOURCE, "open-meteo", function () {
          kvsSet(KEY_WEATHER_UPDATED, weatherDateTime(), function () {
            kvsSet(KEY_WEATHER_STATUS, "ok", function () {
              log("OK t=" + w.temp + " avg=" + w.dayAvgTemp + " solar=" + w.solar);
              if (cb) cb();
            });
          });
        });
      });
    });
  });
}
