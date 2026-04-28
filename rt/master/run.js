// master run 1.0.1-prefer-versioned
function findByRolePrefix(scripts, role) {
  var i;
  var prefix = role + "_v";
  for (i = 0; i < scripts.length; i++) {
    if (String(scripts[i].name || "").indexOf(prefix) === 0) return scripts[i];
  }
  for (i = 0; i < scripts.length; i++) {
    if (scripts[i].name === role) return scripts[i];
  }
  return null;
}

function waitUntilStopped(id, cb) {
  Timer.set(500, false, function () {
    Shelly.call("Script.List", {}, function (res, err) {
      var i;
      var s = null;
      if (err || !res || !res.scripts) { cb(0); return; }
      for (i = 0; i < res.scripts.length; i++) {
        if (res.scripts[i].id === id) { s = res.scripts[i]; break; }
      }
      if (!s) { cb(0); return; }
      if (!s.running) { cb(1); return; }
      waitUntilStopped(id, cb);
    });
  });
}

function startScriptByRole(role, timeoutMs, cb) {
  Shelly.call("Script.List", {}, function (res, err) {
    var s;
    var done = false;
    var timer = null;

    function finish(ok) {
      if (done) return;
      done = true;
      if (timer) Timer.clear(timer);
      cb(ok);
    }

    if (err || !res || !res.scripts) { log("LS ERR " + role); cb(0); return; }
    s = findByRolePrefix(res.scripts, role);
    if (!s || s.id === undefined) { log("NO " + role); cb(0); return; }

    log("ST " + role + " #" + s.id);
    Shelly.call("Script.Start", { id: s.id }, function (r, e) {
      if (e) { log("STE " + role); finish(0); return; }
      timer = Timer.set(timeoutMs, false, function () {
        log("TO " + role);
        Shelly.call("Script.Stop", { id: s.id }, function () { finish(0); });
      });
      waitUntilStopped(s.id, function (ok) { finish(ok); });
    });
  });
}

function startInstaller(cb) {
  log("ST installer #" + INSTALLER_ID);
  Shelly.call("Script.Start", { id: INSTALLER_ID }, function () {
    if (cb) cb();
  });
}
