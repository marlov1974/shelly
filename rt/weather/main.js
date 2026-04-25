// weather main 1.0.0
function createCtx() {
  return { out: {} };
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

function runOnce() {
  var ctx = createCtx();
  log("RUN BOT");

  featureDailySolar(ctx, function () {
    featureHourlyTemp(ctx, function () {
      saveWeatherAct(ctx, function () {
        log("RUN DON");
        scheduleNextRun();
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

