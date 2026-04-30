// master run 1.3.0-fixed-id-boot-reboot
function startScriptById(id, name, timeoutMs, cb) {
  log("ST " + name + " #" + id);

  Shelly.call("Script.Start", { id: id }, function (res, err) {
    if (err) {
      log("STE " + name);
      cb(0);
      return;
    }

    Timer.set(timeoutMs, false, function () {
      cb(1);
    });
  });
}

function startInstallerSlot(cb) { startScriptById(INSTALLER_ID, "installer", TIMEOUT_INSTALLER_MS, cb); }
function startRebootSlot(cb) { startScriptById(REBOOT_ID, "reboot", TIMEOUT_REBOOT_MS, cb); }
function startPoll(cb) { startScriptById(POLL_ID, "poll", TIMEOUT_POLL_MS, cb); }
function startState(cb) { startScriptById(STATE_ID, "state", TIMEOUT_STATE_MS, cb); }
function startWeather(cb) { startScriptById(WEATHER_ID, "weather", TIMEOUT_WEATHER_MS, cb); }
function startBrain(cb) { startScriptById(BRAIN_ID, "brain", TIMEOUT_BRAIN_MS, cb); }
function startDriver(cb) { startScriptById(DRIVER_ID, "driver", TIMEOUT_DRIVER_MS, cb); }

function waitUntilCleanup(cb) {
  var elapsed = (new Date()).getTime() - cycleStartMs;
  var delay = CLEANUP_AT_MS - elapsed;
  if (delay < 0) delay = 0;
  log("REST " + i(delay / 1000));
  Timer.set(delay, false, cb);
}

function stopId(id, cb) {
  if (id === MASTER_ID) { cb(); return; }
  Shelly.call("Script.Stop", { id: id }, function () {
    Timer.set(80, false, cb);
  });
}

function cleanupWorkers(cb) {
  stopId(INSTALLER_ID, function () {
    stopId(BOOT_ID, function () {
      stopId(POLL_ID, function () {
        stopId(STATE_ID, function () {
          stopId(WEATHER_ID, function () {
            stopId(BRAIN_ID, function () {
              stopId(DRIVER_ID, function () {
                stopId(REBOOT_ID, cb);
              });
            });
          });
        });
      });
    });
  });
}
