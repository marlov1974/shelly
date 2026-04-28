// inst.build 1.1.0-print-only
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var VK = "ftx.ver.";
  var JOB_KEY = "ftx.install.job";
  var SCRIPT_NAME = "inst.build";

  function log(s) { print(SCRIPT_NAME + " " + String(s || "")); }

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
      if (!obj) { log("IB110 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function findByName(arr, name) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].name === name) return arr[i];
    }
    return null;
  }

  function stop(id, cb) {
    Shelly.call("Script.Stop", { id: id }, function () { cb(); });
  }

  function put(id, code, append, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code, append: append }, function (res, err) {
      if (err) { cb(0); return; }
      cb(1);
    });
  }

  function setBoot(id, boot, cb) {
    Shelly.call("Script.SetConfig", { id: id, config: { enable: !!boot } }, function () { cb(); });
  }

  function verSet(name, version, cb) {
    Shelly.call("KVS.Set", { key: VK + name, value: String(version || "") }, function () { cb(); });
  }

  function jobClear(cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: {} }, function () { cb(); });
  }

  function selfStopLocal() {
    Shelly.call("Script.List", {}, function (res, err) {
      var s;
      if (err || !res || !res.scripts) return;
      s = findByName(res.scripts, SCRIPT_NAME);
      if (!s || s.id === undefined) return;
      Shelly.call("Script.Stop", { id: s.id }, function () {});
    });
  }

  function chunks(id, arr, pos, cb) {
    if (pos >= arr.length) { cb(1); return; }
    log("IB110 W " + pos + "/" + arr.length);
    get(arr[pos], function (code) {
      if (code === null) { log("IB110 CE " + pos); cb(0); return; }
      Timer.set(120, false, function () {
        put(id, code, pos > 0, function (ok) {
          if (!ok) { log("IB110 PE " + pos); cb(0); return; }
          Timer.set(120, false, function () { chunks(id, arr, pos + 1, cb); });
        });
      });
    });
  }

  function build(job) {
    if (!job || !job.name || !job.recipe || job.id === undefined) { log("IB110 BJ"); selfStopLocal(); return; }
    log("IB110 R " + job.name);
    fetchJson(job.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { log("IB110 RCE"); selfStopLocal(); return; }
      stop(job.id, function () {
        setBoot(job.id, !!recipe.boot, function () {
          chunks(job.id, recipe.chunks, 0, function (ok) {
            if (!ok) { log("IB110 WE " + job.name); selfStopLocal(); return; }
            verSet(job.name, job.version, function () {
              jobClear(function () {
                log("IB110 OK " + job.name + " " + job.version);
                selfStopLocal();
              });
            });
          });
        });
      });
    });
  }

  function run() {
    log("IB110 RN");
    Shelly.call("KVS.Get", { key: JOB_KEY }, function (res, err) {
      if (err || !res || !res.value || !res.value.name) { log("IB110 NJ"); selfStopLocal(); return; }
      build(res.value);
    });
  }

  run();
})();
