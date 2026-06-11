// reboot main 1.4.0-dampers-hub
function httpGet(url, tag, cb) {
  Shelly.call("HTTP.GET", { url: url, timeout: 5 }, function (res, err) {
    if (err || !res) log("ERR " + tag);
    if (cb) cb();
  });
}

function rebootIp(ip, cb) {
  httpGet("http://" + ip + "/rpc/Shelly.Reboot", "RB " + ip, cb);
}

function stopId(id, cb) {
  if (id === SCRIPT_ID) { cb(); return; }
  Shelly.call("Script.Stop", { id: id }, function () {
    Timer.set(80, false, cb);
  });
}

function stopLocalWorkers(cb) {
  log("KILL local");
  stopId(BOOT_ID, function () {
    stopId(MASTER_ID, function () {
      stopId(STATE_ID, function () {
        stopId(WEATHER_ID, function () {
          stopId(BRAIN_ID, function () {
            stopId(LOCAL_EXECUTOR_ID, cb);
          });
        });
      });
    });
  });
}

function rebootRemotes(cb) {
  log("RB remote");
  rebootIp(IP_SUPPLY_FAN, function () {
    rebootIp(IP_EXTRACT_FAN, function () {
      rebootIp(IP_HEAT, function () {
        rebootIp(IP_COOL, function () {
          rebootIp(IP_VVX, cb);
        });
      });
    });
  });
}

function rebootSelf() {
  log("RB self");
  Shelly.call("Shelly.Reboot", {}, function () {});
}

function runReboot() {
  log("BOT");
  stopLocalWorkers(function () {
    log("WAIT local 300");
    Timer.set(LOCAL_SETTLE_MS, false, function () {
      rebootRemotes(function () {
        log("WAIT remote 300");
        Timer.set(REMOTE_SETTLE_MS, false, rebootSelf);
      });
    });
  });
}

runReboot();
