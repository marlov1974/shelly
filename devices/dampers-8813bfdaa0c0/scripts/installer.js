// === DEVICE: dampers-8813bfdaa0c0 / SCRIPT: installer v0.2.0-timer-safe ===
// Purpose:
// - Lab installer for dampers device.
// - Downloads scripts from GitHub raw URLs.
// - Creates missing script slots, then writes code with Script.PutCode.
//
// Design notes:
// - Uses Timer.set between phases to avoid deep async recursion and make progress visible.
// - Does not pass code to Script.Create. It creates the slot first, then PutCode.
// - Writes hp.install.status at every major step for debugging.
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/devices/dampers-8813bfdaa0c0/scripts/";
  var STATUS_KEY = "hp.install.status";
  var LAST_KEY = "hp.install.last";

  var FILES = [
    { name: "boot",      path: "boot.js" },
    { name: "master",    path: "master.js" },
    { name: "spotprice", path: "spotprice.js" },
    { name: "weather",   path: "weather.js" }
  ];

  var idx = 0;
  var current = null;
  var currentCode = null;

  function log(s) { print("installer " + String(s || "")); }

  function later(ms, fn) {
    Timer.set(ms, false, fn);
  }

  function kvSet(key, value, cb) {
    Shelly.call("KVS.Set", { key: key, value: String(value) }, function (res, err) {
      if (err) log("KVS.Set failed " + key + " " + JSON.stringify(err));
      if (cb) cb(!err);
    });
  }

  function status(s, cb) {
    log(s);
    kvSet(STATUS_KEY, s, function () {
      kvSet(LAST_KEY, String(new Date().getTime()) + " " + s, cb);
    });
  }

  function fail(s) {
    status("fail " + s, null);
  }

  function listScripts(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) {
        log("Script.List failed " + JSON.stringify(err || {}));
        cb(null);
        return;
      }
      cb(res.scripts);
    });
  }

  function findScriptId(scripts, name) {
    var i;
    for (i = 0; i < scripts.length; i++) {
      if (scripts[i] && scripts[i].name === name) return scripts[i].id;
    }
    return null;
  }

  function httpGet(url, cb) {
    Shelly.call("HTTP.GET", { url: url, timeout: 15 }, function (res, err) {
      if (err || !res || !res.body) {
        log("HTTP.GET failed " + JSON.stringify(err || {}));
        cb(null);
        return;
      }
      cb(res.body);
    });
  }

  function putCode(id, name, code, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code }, function (res, err) {
      if (err) {
        log("Script.PutCode failed " + name + " " + JSON.stringify(err));
        cb(false);
        return;
      }
      cb(true);
    });
  }

  function createThenPut(name, code, cb) {
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res || res.id === undefined || res.id === null) {
        log("Script.Create failed " + name + " " + JSON.stringify(err || res || {}));
        cb(false);
        return;
      }
      var newId = res.id;
      status("created " + name + " id " + newId, function () {
        later(200, function () {
          putCode(newId, name, code, cb);
        });
      });
    });
  }

  function installCurrentCode() {
    listScripts(function (scripts) {
      if (!scripts) { fail("list " + current.name); return; }

      var id = findScriptId(scripts, current.name);
      if (id === null || id === undefined) {
        status("create " + current.name, function () {
          later(200, function () {
            createThenPut(current.name, currentCode, function (ok) {
              if (!ok) { fail("create_put " + current.name); return; }
              status("installed " + current.name, function () {
                idx++;
                current = null;
                currentCode = null;
                later(500, installNext);
              });
            });
          });
        });
      } else {
        status("put " + current.name + " id " + id, function () {
          later(200, function () {
            putCode(id, current.name, currentCode, function (ok) {
              if (!ok) { fail("put " + current.name); return; }
              status("installed " + current.name, function () {
                idx++;
                current = null;
                currentCode = null;
                later(500, installNext);
              });
            });
          });
        });
      }
    });
  }

  function installNext() {
    if (idx >= FILES.length) {
      status("ok", function () { log("done"); });
      return;
    }

    current = FILES[idx];
    currentCode = null;

    var url = BASE + current.path;
    status("fetch " + current.name, function () {
      later(200, function () {
        log("GET " + url);
        httpGet(url, function (code) {
          if (!code) { fail("fetch " + current.name); return; }
          currentCode = code;
          status("fetched " + current.name + " len " + code.length, function () {
            later(300, installCurrentCode);
          });
        });
      });
    });
  }

  status("start", function () {
    later(300, installNext);
  });
})();
