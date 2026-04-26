// installer-build 1.1.1-self-stop-by-name
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var TEXT_ID = 204;
  var VK = "ftx.ver.";
  var JOB_KEY = "ftx.install.job";
  var SELF_NAME = "build";

  function txt(s) {
    print("build " + String(s || ""));
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
      if (!obj) { txt("B111 " + tag + "E"); cb(null); return; }
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
    Shelly.call("Script.SetConfig", { id: id, config: { enable: !!boot } }, function () {
      cb();
    });
  }

  function verSet(name, version, cb) {
    Shelly.call("KVS.Set", { key: VK + name, value: String(version || "") }, function () { cb(); });
  }

  function jobClear(cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: {} }, function () { cb(); });
  }

  function selfStop() {
    Shelly.call("Script.List", {}, function (res, err) {
      var s;
      if (err || !res || !res.scripts) return;
      s = findByName(res.scripts, SELF_NAME);
      if (!s || s.id === undefined) return;
      Shelly.call("Script.Stop", { id: s.id }, function () {});
    });
  }

  function chunks(id, arr, pos, cb) {
    if (pos >= arr.length) { cb(1); return; }
    txt("B111 W " + pos + "/" + arr.length);
    get(arr[pos], function (code) {
      if (code === null) { txt("B111 CE " + pos); cb(0); return; }
      Timer.set(120, false, function () {
        put(id, code, pos > 0, function (ok) {
          if (!ok) { txt("B111 PE " + pos); cb(0); return; }
          Timer.set(120, false, function () {
            chunks(id, arr, pos + 1, cb);
          });
        });
      });
    });
  }

  function build(job) {
    if (!job || !job.name || !job.recipe || job.id === undefined) { txt("B111 BJ"); selfStop(); return; }
    txt("B111 R " + job.name);
    fetchJson(job.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { txt("B111 RCE"); selfStop(); return; }
      stop(job.id, function () {
        setBoot(job.id, !!recipe.boot, function () {
          chunks(job.id, recipe.chunks, 0, function (ok) {
            if (!ok) { txt("B111 WE " + job.name); selfStop(); return; }
            verSet(job.name, job.version, function () {
              jobClear(function () {
                txt("B111 OK " + job.name + " " + job.version);
                selfStop();
              });
            });
          });
        });
      });
    });
  }

  function run() {
    txt("B111 RN");
    Shelly.call("KVS.Get", { key: JOB_KEY }, function (res, err) {
      if (err || !res || !res.value || !res.value.name) { txt("B111 NJ"); selfStop(); return; }
      build(res.value);
    });
  }

  run();
})();
