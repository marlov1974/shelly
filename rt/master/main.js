// master main 1.3.0-boot-reboot-slots
function getHourNowLocal() { return (new Date()).getHours(); }
function getMinuteNowLocal() { return (new Date()).getMinutes(); }

function rebootDue() {
  var h;
  var m;
  if (rebootStarted) return 0;
  h = getHourNowLocal();
  m = getMinuteNowLocal();
  if (h !== REBOOT_START_HOUR) return 0;
  if (m < REBOOT_START_MINUTE) return 0;
  if (m > REBOOT_END_MINUTE) return 0;
  return 1;
}

function weatherDue() {
  return tickCount > 0 && (tickCount % WEATHER_EVERY_TICKS) === 0;
}

function installerDue() {
  if (weatherDue()) return 0;
  return tickCount > 0 && (tickCount % INSTALL_EVERY_TICKS) === 0;
}

function runServiceSlot(cb) {
  if (rebootDue()) {
    rebootStarted = 1;
    log("SLOT reboot");
    startRebootSlot(function () { cb("reboot"); });
    return;
  }

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
    if (slot === "installer" || slot === "reboot") {
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
  Timer.set(1000, false, tick);
  Timer.set(TICK_MS, true, tick);
}

bootMaster();
