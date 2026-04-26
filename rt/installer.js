// installer-watch 2.3.0-short-id-device-file
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
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
      if (!obj) { txt("W230 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function shortId(id) {
    var s = String(id || "");
    var p = s.lastIndexOf("-");
    if (p >= 0) return s.slice(p + 1);
    return s;
  }

  function verGet(name, cb) {
    Shelly.call("KVS.Get", { key: VK + name }, function (res, err) {
      if (err || !res) { cb(""); return; }
      cb(String(res.value || ""));
    });
  }

  function pkgAt(dev, pos) {
    if (!dev || !dev.packages || !dev.packages[pos]) return null;
    return dev.packages[pos];
  }

  function needJob(dev, pos, cb) {
    var p = pkgAt(dev, pos);
    if (!p) { cb(null); return; }
    verGet(p.name, function (old) {
      if (old !== String(p.version || "")) { cb(p); return; }
      needJob(dev, pos + 1, cb);
    });
  }

  function writeJob(job, cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: job }, function (res, err) {
      if (err) { txt("W230 JE"); cb(0); return; }
      cb(1);
    });
  }

  function run() {
    txt("W230 RN");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      var sid;
      var path;
      if (err || !info) { txt("W230 DIE"); return; }
      sid = shortId(info.id || info.mac || "");
      path = "rt/devices/" + sid + ".json";
      txt("W230 D " + sid);
      fetchJson(path, "D", function (dev) {
        if (!dev || !dev.packages) { txt("W230 DE"); return; }
        txt("W230 MX");
        needJob(dev, 0, function (job) {
          if (!job) { txt("W230 OK"); return; }
          writeJob(job, function (ok) {
            if (!ok) return;
            txt("W230 JOB " + job.name + " " + job.version);
            Shelly.call("Script.Start", { id: BUILD_ID }, function (res, err2) {
              if (err2) { txt("W230 STE1"); return; }
              txt("W230 ST " + job.name);
            });
          });
        });
      });
    });
  }

  run();
})();
