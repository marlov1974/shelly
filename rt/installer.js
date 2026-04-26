// installer-watch 2.2.0-minimal-generic
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
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) { cb(null); return; }
      cb(res.body);
    });
  }

  function jp(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function fetchJson(path, tag, cb) {
    get(path, function (body) {
      var obj = body ? jp(body) : null;
      if (!obj) { txt("W220 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function verGet(name, cb) {
    Shelly.call("KVS.Get", { key: VK + name }, function (res, err) {
      if (err || !res) { cb(""); return; }
      cb(String(res.value || ""));
    });
  }

  function getDevicePath(cb) {
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      if (err || !info) { txt("W220 DIE"); cb(null); return; }
      fetchJson(INDEX, "I", function (idx) {
        var p = null;
        if (!idx) { cb(null); return; }
        p = idx[String(info.id || "")];
        if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
        if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
        if (!p) txt("W220 NDF");
        cb(p || null);
      });
    });
  }

  function descAt(dev, pos) {
    var p = "s" + pos + "_";
    if (!dev[p + "name"]) return null;
    return {
      name: dev[p + "name"],
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
      needJob(dev, pos + 1, cb);
    });
  }

  function writeJob(job, cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: job }, function (res, err) {
      if (err) { txt("W220 JE"); cb(0); return; }
      cb(1);
    });
  }

  function startBuilder(cb) {
    Shelly.call("Script.Start", { id: BUILD_ID }, function (res, err) {
      if (err) { txt("W220 STE1"); if (cb) cb(0); return; }
      if (cb) cb(1);
    });
  }

  function next() {
    if (timer) Timer.clear(timer);
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { txt("W220 BZ"); return; }
    busy = true;
    txt("W220 RN");

    getDevicePath(function (path) {
      if (!path) { busy = false; next(); return; }
      fetchJson(path, "D", function (dev) {
        if (!dev || !dev.n) { txt("W220 DE"); busy = false; next(); return; }
        needJob(dev, 0, function (job) {
          if (!job) { txt("W220 OK"); busy = false; next(); return; }
          writeJob(job, function (ok) {
            if (!ok) { busy = false; next(); return; }
            txt("W220 JOB " + job.name + " " + job.version);
            startBuilder(function () {
              txt("W220 START " + job.name);
              busy = false;
              next();
            });
          });
        });
      });
    });
  }

  run();
})();
