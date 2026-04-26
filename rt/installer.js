// installer-watch 2.1.1-builder-id-1
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX = "rt/index.json";
  var TEXT_ID = 201;
  var PERIOD = 300000;
  var VK = "ftx.ver.";
  var JOB_KEY = "ftx.install.job";
  var BUILD_ID = 1;

  var timer = null;
  var busy = false;

  function txt(s) {
    print("watch " + String(s || ""));
    Shelly.call("Text.Set", { id: TEXT_ID, value: String(s || "") }, function () {});
  }

  function get(path, cb) {
    var done = false;
    var watchdog = null;

    function finish(body) {
      if (done) return;
      done = true;
      if (watchdog) {
        Timer.clear(watchdog);
        watchdog = null;
      }
      cb(body);
    }

    watchdog = Timer.set(15000, false, function () {
      watchdog = null;
      txt("W211 HTO");
      finish(null);
    });

    Shelly.call("HTTP.GET", { url: BASE + path + "?v=" + String(Math.floor(Date.now() / 60000)), timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) { finish(null); return; }
      finish(res.body);
    });
  }

  function jp(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function fetchJson(path, tag, cb) {
    get(path, function (body) {
      var obj = body ? jp(body) : null;
      if (!obj) { txt("W211 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("W211 LSE"); cb([]); return; }
      cb(res.scripts);
    });
  }

  function find(arr, name) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].name === name) return arr[i].id;
    }
    return null;
  }

  function hasScriptId(arr, id) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].id === id) return 1;
    }
    return 0;
  }

  function verGet(name, cb) {
    Shelly.call("KVS.Get", { key: VK + name }, function (res, err) {
      if (err || !res) { cb(""); return; }
      cb(String(res.value || ""));
    });
  }

  function start(id, cb) {
    Shelly.call("Script.Start", { id: id }, function (res, err) {
      if (err) { txt("W211 STE " + id); if (cb) cb(0); return; }
      if (cb) cb(1);
    });
  }

  function getBuildId(cb) {
    list(function (arr) {
      if (!hasScriptId(arr, BUILD_ID)) {
        txt("W211 NOBUILD1");
        cb(null);
        return;
      }
      cb(BUILD_ID);
    });
  }

  function getDevicePath(cb) {
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      if (err || !info) { txt("W211 DIE"); cb(null); return; }
      fetchJson(INDEX, "I", function (idx) {
        var p = null;
        if (!idx) { cb(null); return; }
        p = idx[String(info.id || "")];
        if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
        if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
        if (!p) txt("W211 NDF");
        cb(p || null);
      });
    });
  }

  function descAt(dev, pos) {
    var p = "s" + pos + "_";
    if (!dev[p + "name"]) return null;
    return {
      name: dev[p + "name"],
      id: dev[p + "id"],
      version: dev[p + "version"],
      recipe: dev[p + "recipe"]
    };
  }

  function needJob(dev, pos, cb) {
    var d;
    if (pos >= dev.n) { cb(null); return; }
    d = descAt(dev, pos);
    if (!d) { needJob(dev, pos + 1, cb); return; }
    verGet(d.name, function (old) {
      if (old !== String(d.version || "")) { cb(d); return; }
      list(function (arr) {
        var id = find(arr, d.name);
        if (id === null || id === undefined) { cb(d); return; }
        needJob(dev, pos + 1, cb);
      });
    });
  }

  function writeJob(job, cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: job }, function (res, err) {
      if (err) { txt("W211 JE"); cb(0); return; }
      cb(1);
    });
  }

  function next() {
    if (timer) Timer.clear(timer);
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { txt("W211 BZ"); return; }
    busy = true;
    txt("W211 RN");

    getBuildId(function (buildId) {
      if (buildId === null || buildId === undefined) { busy = false; next(); return; }
      getDevicePath(function (path) {
        if (!path) { busy = false; next(); return; }
        fetchJson(path, "D", function (dev) {
          if (!dev || !dev.n) { txt("W211 DE"); busy = false; next(); return; }
          needJob(dev, 0, function (job) {
            if (!job) { txt("W211 OK"); busy = false; next(); return; }
            txt("W211 JOB " + job.name + " " + job.version);
            writeJob(job, function (ok) {
              if (!ok) { busy = false; next(); return; }
              start(buildId, function () {
                txt("W211 START " + job.name);
                busy = false;
                next();
              });
            });
          });
        });
      });
    });
  }

  run();
})();
