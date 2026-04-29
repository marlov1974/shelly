// master main 1.2.1-fixed-id-low-memory
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
    startWeather(function () { cb("weather"); });
    return;
  }

  if (installerDue()) {
    log("SLOT installer");
    startInstallerSlot(function () { cb("installer"); });
    return;
  }

  log("SLOT pollstate");
  startPoll(function () {
    startState(function () {
      cb("pollstate");
    });
  });
}

function runBrainDriver(cb) {
  startBrain(function () {
    startDriver(function () {
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
