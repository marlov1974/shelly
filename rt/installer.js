// installer-watch 2.4.3-build-by-name
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var TEXT_ID = 201;
  var VK = "ftx.ver.";
  var JOB_KEY = "ftx.install.job";
  var BUILD_NAME = "build";

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
      if (!obj) { txt("W243 " + tag + "E"); cb(null); return; }
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
      if (err || !res || !res.scripts) { txt("W243 LSE"); cb([]); return; }
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

  function createScript(pkg, cb) {
    txt("W243 CR " + pkg.name);
    Shelly.call("Script.Create", { name: pkg.name }, function (res, err) {
      if (err || !res || res.id === undefined) { txt("W243 CRE " + pkg.name); cb(null); return; }
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
          if (err2) { txt("W243 STE " + buildId); return; }
          txt("W243 ST " + job.name + " #" + buildId);
        });
      });
    });
  }

  function writeJob(job, cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: job }, function (res, err) {
      if (err) { txt("W243 JE"); cb(0); return; }
      cb(1);
    });
  }

  function run() {
    txt("W243 RN");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      var sid;
      var path;
      if (err || !info) { txt("W243 DIE"); return; }
      sid = shortId(info.id || info.mac || "");
      path = "rt/devices/" + sid + ".json";
      txt("W243 D " + sid);
      fetchJson(path, "D", function (dev) {
        if (!dev || !dev.packages) { txt("W243 DE"); return; }
        txt("W243 MX");
        list(function (scripts) {
          var build = findByName(scripts, BUILD_NAME);
          if (!build || build.id === undefined) { txt("W243 NOB"); return; }
          needJob(dev, scripts, 0, function (job) {
            if (!job) { txt("W243 OK"); return; }
            writeJob(job, function (ok) {
              if (!ok) return;
              txt("W243 JOB " + job.name + " " + job.version + " #" + job.id);
              startBuild(build.id, job);
            });
          });
        });
      });
    });
  }

  run();
})();
