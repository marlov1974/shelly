// installer-watch 2.0.0-split-builder
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX = "rt/index.json";
  var TEXT_ID = 201;
  var PERIOD = 300000;
  var VK = "ftx.ver.";
  var JOB_KEY = "ftx.install.job";

  var BUILD_NAME = "installer-build";
  var BUILD_VERSION = "1.0.0";
  var BUILD_PATH = "rt/installer-build.js";

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
      txt("W200 HTO");
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
      if (!obj) { txt("W200 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("W200 LSE"); cb([]); return; }
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

  function verGet(name, cb) {
    Shelly.call("KVS.Get", { key: VK + name }, function (res, err) {
      if (err || !res) { cb(""); return; }
      cb(String(res.value || ""));
    });
  }

  function verSet(name, version, cb) {
    Shelly.call("KVS.Set", { key: VK + name, value: String(version || "") }, function () { cb(); });
  }

  function put(id, code, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code, append: false }, function (res, err) {
      if (err) { cb(0); return; }
      cb(1);
    });
  }

  function create(name, cb) {
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) { cb(null); return; }
      cb(res.id);
    });
  }

  function stop(id, cb) {
    Shelly.call("Script.Stop", { id: id }, function () { cb(); });
  }

  function start(id, cb) {
    Shelly.call("Script.Start", { id: id }, function () { if (cb) cb(); });
  }

  function ensureBuild(cb) {
    list(function (arr) {
      var id = find(arr, BUILD_NAME);
      function writeBuilder(scriptId) {
        if (scriptId === null || scriptId === undefined) { txt("W200 BE"); cb(null); return; }
        get(BUILD_PATH, function (code) {
          if (code === null) { txt("W200 BGE"); cb(null); return; }
          stop(scriptId, function () {
            put(scriptId, code, function (ok) {
              if (!ok) { txt("W200 BPE"); cb(null); return; }
              verSet(BUILD_NAME, BUILD_VERSION, function () {
                cb(scriptId);
              });
            });
          });
        });
      }

      verGet(BUILD_NAME, function (old) {
        if (id !== null && id !== undefined && old === BUILD_VERSION) {
          cb(id);
          return;
        }
        txt("W200 BI");
        if (id !== null && id !== undefined) { writeBuilder(id); return; }
        create(BUILD_NAME, writeBuilder);
      });
    });
  }

  function getDevicePath(cb) {
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      if (err || !info) { txt("W200 DIE"); cb(null); return; }
      fetchJson(INDEX, "I", function (idx) {
        var p = null;
        if (!idx) { cb(null); return; }
        p = idx[String(info.id || "")];
        if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
        if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
        if (!p) txt("W200 NDF");
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
      if (old !== String(d.version || "")) {
        cb(d);
        return;
      }
      list(function (arr) {
        var id = find(arr, d.name);
        if (id === null || id === undefined) { cb(d); return; }
        needJob(dev, pos + 1, cb);
      });
    });
  }

  function writeJob(job, cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: job }, function (res, err) {
      if (err) { txt("W200 JE"); cb(0); return; }
      cb(1);
    });
  }

  function next() {
    if (timer) Timer.clear(timer);
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { txt("W200 BZ"); return; }
    busy = true;
    txt("W200 RN");

    ensureBuild(function (buildId) {
      if (buildId === null || buildId === undefined) { busy = false; next(); return; }
      getDevicePath(function (path) {
        if (!path) { busy = false; next(); return; }
        fetchJson(path, "D", function (dev) {
          if (!dev || !dev.n) { txt("W200 DE"); busy = false; next(); return; }
          needJob(dev, 0, function (job) {
            if (!job) { txt("W200 OK"); busy = false; next(); return; }
            txt("W200 JOB " + job.name + " " + job.version);
            writeJob(job, function (ok) {
              if (!ok) { busy = false; next(); return; }
              start(buildId, function () {
                txt("W200 START " + job.name);
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
