// inst.poll 1.0.0
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var SCRIPT_NAME = "inst.poll";
  var TEXT_ID = 201;
  var VK = "ftx.ver.";
  var JOB_KEY = "ftx.install.job";
  var BUILD_NAME = "inst.build";

  function txt(s) {
    print("inst.poll " + String(s || ""));
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
      if (!obj) { txt("IP100 " + tag + "E"); cb(null); return; }
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

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("IP100 LSE"); cb([]); return; }
      cb(res.scripts);
    });
  }

  function findByName(arr, name) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].name === name) return arr[i];
    }
    return null;
  }

  function selfStop() {
    Shelly.call("Script.List", {}, function (res, err) {
      var s;
      if (err || !res || !res.scripts) return;
      s = findByName(res.scripts, SCRIPT_NAME);
      if (!s || s.id === undefined) return;
      Shelly.call("Script.Stop", { id: s.id }, function () {});
    });
  }

  function createScript(pkg, cb) {
    txt("IP100 CR " + pkg.name);
    Shelly.call("Script.Create", { name: pkg.name }, function (res, err) {
      if (err || !res || res.id === undefined) { txt("IP100 CRE " + pkg.name); cb(null); return; }
      pkg.id = res.id;
      cb(pkg);
    });
  }

  function pkgAt(dev, pos) {
    if (!dev || !dev.packages || !dev.packages[pos]) return null;
    return dev.packages[pos];
  }

  function needJob(dev, scripts, pos, cb) {
    var p = pkgAt(dev, pos);
    var existing;
    if (!p) { cb(null); return; }

    existing = findByName(scripts, p.name);
    if (!existing) {
      createScript(p, cb);
      return;
    }

    p.id = existing.id;
    verGet(p.name, function (old) {
      if (old !== String(p.version || "")) { cb(p); return; }
      needJob(dev, scripts, pos + 1, cb);
    });
  }

  function startBuild(buildId, job) {
    Shelly.call("Script.Stop", { id: buildId }, function () {
      Timer.set(700, false, function () {
        Shelly.call("Script.Start", { id: buildId }, function (res, err2) {
          if (err2) { txt("IP100 STE " + buildId); selfStop(); return; }
          txt("IP100 ST " + job.name + " #" + buildId);
          selfStop();
        });
      });
    });
  }

  function writeJob(job, cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: job }, function (res, err) {
      if (err) { txt("IP100 JE"); cb(0); return; }
      cb(1);
    });
  }

  function run() {
    txt("IP100 RN");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      var sid;
      var path;
      if (err || !info) { txt("IP100 DIE"); selfStop(); return; }
      sid = shortId(info.id || info.mac || "");
      path = "rt/devices/" + sid + ".json";
      txt("IP100 D " + sid);
      fetchJson(path, "D", function (dev) {
        if (!dev || !dev.packages) { txt("IP100 DE"); selfStop(); return; }
        txt("IP100 MX");
        list(function (scripts) {
          var build = findByName(scripts, BUILD_NAME);
          if (!build || build.id === undefined) { txt("IP100 NOB"); selfStop(); return; }
          needJob(dev, scripts, 0, function (job) {
            if (!job) { txt("IP100 OK"); selfStop(); return; }
            writeJob(job, function (ok) {
              if (!ok) { selfStop(); return; }
              txt("IP100 JOB " + job.name + " " + job.version + " #" + job.id);
              startBuild(build.id, job);
            });
          });
        });
      });
    });
  }

  run();
})();
