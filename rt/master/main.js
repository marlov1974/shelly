// master main 1.0.0
function runRuntimeCycle(done) {
  startScriptByRole("poll", TIMEOUT_POLL_MS, function () {
    startScriptByRole("state", TIMEOUT_STATE_MS, function () {
      if (tickCount === 1 || (tickCount % WEATHER_EVERY_TICKS) === 0) {
        startScriptByRole("weather", TIMEOUT_WEATHER_MS, function () {
          startScriptByRole("brain", TIMEOUT_BRAIN_MS, function () {
            done();
          });
        });
        return;
      }
      startScriptByRole("brain", TIMEOUT_BRAIN_MS, function () {
        done();
      });
    });
  });
}

function tick() {
  if (cycleRunning) {
    log("SKIP busy");
    return;
  }

  cycleRunning = 1;
  tickCount = tickCount + 1;
  log("TICK " + tickCount);

  runRuntimeCycle(function () {
    if ((tickCount % INSTALL_EVERY_TICKS) === 0) {
      startInstaller(function () {
        cycleRunning = 0;
      });
      return;
    }
    cycleRunning = 0;
  });
}

function bootMaster() {
  log("BOT");
  Timer.set(3000, false, tick);
  Timer.set(TICK_MS, true, tick);
}

bootMaster();
