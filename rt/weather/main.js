// weather main 1.0.1
var STATUS_TEXT_ID = 200;

function createCtx() {
  return { out: {} };
}

function setStatusText(s, cb) {
  Shelly.call("Text.Set", { id: STATUS_TEXT_ID, value: String(s || "") }, function () {
    if (cb) cb();
  });
}

function saveWeatherAct(ctx, cb) {
  log("KVS SET weather");
  kvsWriteObject(KEY_WEATHER_ACT, ctx.out, function (ok) {
    if (!ok) {
      cb(0);
      return;
    }
    log("KVS OK");
    cb(1);
  });
}

function writeStatus(ctx, cb) {
  var s = "W OK T=" + ctx.out.temp_now + " S=" + ctx.out.solar_kwh_today;
  setStatusText(s, cb);
}

function runOnce() {
  var ctx = createCtx();
  log("RUN BOT");

  featureDailySolar(ctx, function () {
    featureHourlyTemp(ctx, function () {
      saveWeatherAct(ctx, function () {
        writeStatus(ctx, function () {
          log("RUN DON");
          scheduleNextRun();
        });
      });
    });
  });
}

function scheduleNextRun() {
  if (weatherTimer) {
    Timer.clear(weatherTimer);
    weatherTimer = null;
  }

  weatherTimer = Timer.set(WEATHER_PERIOD_MS, false, function () {
    weatherTimer = null;
    runOnce();
  });
}

function boot() {
  log("BOOT");
  runOnce();
}

boot();

