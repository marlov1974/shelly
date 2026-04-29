// master main 1.2.0-slotted-60s
function weatherDue() {
  return tickCount > 0 && (tickCount % WEATHER_EVERY_TICKS) === 0;
}

function installerDue() {
  if (weatherDue()) return 0;
  return tickCount > 0 && (tickCount % INSTALL_EVERY_TICKS) === 0;
}

function runServiceSlot(cb) {
  if (weatherDue()) {
    log("SLOT weather");
    startScriptByRole("weather", TIMEOUT_WEATHER_MS, function () { cb("weather"); });
    return;
  }

  if (installerDue()) {
    log("SLOT installer");
    startInstallerSlot(function () { cb("installer"); });
    return;
  }

  log("SLOT pollstate");
  startScriptByRole("poll", TIMEOUT_POLL_MS, function () {
    startScriptByRole("state", TIMEOUT_STATE_MS, function () {
      cb("pollstate");
    });
  });
}

function runBrainDriver(cb) {
  startScriptByRole("brain", TIMEOUT_BRAIN_MS, function () {
    startScriptByRole("driver", TIMEOUT_DRIVER_MS, function () {
      cb();
    });
  });
}

function finishCycle() {
  waitUntilCleanup(function () {
    cleanupWorkers(function () {
      log("CLR");
      cycleRunning = 0;
    });
  });
}

function tick() {
  if (cycleRunning) {
    log("SKIP busy");
    return;
  }

  cycleRunning = 1;
  cycleStartMs = (new Date()).getTime();
  tickCount = tickCount + 1;
  log("TICK " + tickCount);

  runServiceSlot(function (slot) {
    if (slot === "installer") {
      finishCycle();
      return;
    }

    runBrainDriver(function () {
      finishCycle();
    });
  });
}

function bootMaster() {
  log("BOT");
  Timer.set(3000, false, tick);
  Timer.set(TICK_MS, true, tick);
}

bootMaster();
