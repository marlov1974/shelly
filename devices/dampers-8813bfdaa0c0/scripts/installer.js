// === DEVICE: dampers-8813bfdaa0c0 / SCRIPT: installer v0.1.0 ===
// Purpose:
// - Lab installer scaffold for dampers device.
// - Downloads scripts from GitHub raw URLs and creates/updates script slots by name.
//
// Note:
// - This is intentionally simple and should be tested on the lab device before relying on it.
// - Exact script-slot behavior may need adjustment depending on Shelly firmware/API responses.
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/devices/dampers-8813bfdaa0c0/scripts/";
  var STATUS_KEY = "hp.install.status";

  var FILES = [
    { name: "boot",      path: "boot.js" },
    { name: "master",    path: "master.js" },
    { name: "spotprice", path: "spotprice.js" },
    { name: "weather",   path: "weather.js" }
  ];

  function log(s) { print("installer " + String(s || "")); }

  function kvSet(key, value, cb) {
    Shelly.call("KVS.Set", { key: key, value: String(value) }, function (res, err) {
      if (err) log("KVS.Set failed " + key + " " + JSON.stringify(err));
      if (cb) cb(!err);
    });
  }

  function httpGet(url, cb) {
    Shelly.call("HTTP.GET", { url: url, timeout: 15 }, function (res, err) {
      if (err || !res || !res.body) { cb(null); return; }
      cb(res.body);
    });
  }

  function listScripts(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { cb([]); return; }
      cb(res.scripts);
    });
  }

  function findScriptId(scripts, name) {
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i] && scripts[i].name === name) return scripts[i].id;
    }
    return null;
  }

  function putScript(name, code, cb) {
    listScripts(function (scripts) {
      var id = findScriptId(scripts, name);
      if (id === null || id === undefined) {
        Shelly.call("Script.Create", { name: name, code: code }, function (res, err) {
          if (err) { log("create failed " + name + " " + JSON.stringify(err)); cb(false); return; }
          log("created " + name);
          cb(true);
        });
      } else {
        Shelly.call("Script.PutCode", { id: id, code: code }, function (res, err) {
          if (err) { log("put failed " + name + " " + JSON.stringify(err)); cb(false); return; }
          log("updated " + name);
          cb(true);
        });
      }
    });
  }

  function installOne(idx) {
    if (idx >= FILES.length) {
      kvSet(STATUS_KEY, "ok", function () { log("done"); });
      return;
    }

    var f = FILES[idx];
    var url = BASE + f.path;
    kvSet(STATUS_KEY, "fetch " + f.name, null);
    log("GET " + url);

    httpGet(url, function (code) {
      if (!code) {
        kvSet(STATUS_KEY, "fetch_failed " + f.name, null);
        log("fetch failed " + f.name);
        return;
      }

      kvSet(STATUS_KEY, "install " + f.name, null);
      putScript(f.name, code, function (ok) {
        if (!ok) {
          kvSet(STATUS_KEY, "install_failed " + f.name, null);
          return;
        }
        installOne(idx + 1);
      });
    });
  }

  kvSet(STATUS_KEY, "start", function () { installOne(0); });
})();
