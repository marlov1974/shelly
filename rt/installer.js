// installer-watch 2.2.1-oneshot-debug
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX = "rt/index.json";
  var TEXT_ID = 201;
  var VK = "ftx.ver.";
  var JOB_KEY = "ftx.install.job";
  var BUILD_ID = 1;

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
      if (!obj) { txt("W221 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function verGet(name, cb) {
    Shelly.call("KVS.Get", { key: VK + name }, function (res, err) {
      if (err || !res) { cb(""); return; }
      cb(String(res.value || ""));
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
      if (err) { txt("W221 JE"); cb(0); return; }
      cb(1);
    });
  }

  function run() {
    txt("W221 RN");
    txt("W221 DI");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      if (err || !info) { txt("W221 DIE"); return; }
      txt("W221 DX");
      fetchJson(INDEX, "I", function (idx) {
        var path = null;
        if (!idx) return;
        path = idx[String(info.id || "")];
        if (!path && info.mac) path = idx[String(info.mac).toLowerCase()];
        if (!path && info.mac) path = idx[String(info.mac).toUpperCase()];
        if (!path) { txt("W221 NDF"); return; }
        txt("W221 IX");
        fetchJson(path, "D", function (dev) {
          if (!dev || !dev.n) { txt("W221 DE"); return; }
          txt("W221 MX");
          needJob(dev, 0, function (job) {
            if (!job) { txt("W221 OK"); return; }
            writeJob(job, function (ok) {
              if (!ok) return;
              txt("W221 JOB " + job.name + " " + job.version);
              Shelly.call("Script.Start", { id: BUILD_ID }, function (res, err2) {
                if (err2) { txt("W221 STE1"); return; }
                txt("W221 ST " + job.name);
              });
            });
          });
        });
      });
    });
  }

  run();
})();
