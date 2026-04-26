// installer-build 1.0.0-one-script-builder
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var TEXT_ID = 201;
  var VK = "ftx.ver.";
  var JOB_KEY = "ftx.install.job";
  var SELF_NAME = "installer-build";

  function txt(s) {
    print("build " + String(s || ""));
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
      txt("B100 HTO");
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
      if (!obj) { txt("B100 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("B100 LSE"); cb([]); return; }
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

  function create(name, cb) {
    txt("B100 CR " + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) { txt("B100 CRE " + name); cb(null); return; }
      cb(res.id);
    });
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

  function verSet(name, version, cb) {
    Shelly.call("KVS.Set", { key: VK + name, value: String(version || "") }, function () { cb(); });
  }

  function jobClear(cb) {
    Shelly.call("KVS.Set", { key: JOB_KEY, value: {} }, function () { cb(); });
  }

  function selfStop() {
    list(function (arr) {
      var id = find(arr, SELF_NAME);
      if (id === null || id === undefined) return;
      Shelly.call("Script.Stop", { id: id }, function () {});
    });
  }

  function chunks(id, arr, pos, cb) {
    if (pos >= arr.length) { cb(1); return; }
    txt("B100 W " + pos + "/" + arr.length);
    get(arr[pos], function (code) {
      if (code === null) { txt("B100 CE " + pos); cb(0); return; }
      Timer.set(120, false, function () {
        put(id, code, pos > 0, function (ok) {
          if (!ok) { txt("B100 PE " + pos); cb(0); return; }
          Timer.set(120, false, function () {
            chunks(id, arr, pos + 1, cb);
          });
        });
      });
    });
  }

  function build(job) {
    if (!job || !job.name || !job.recipe) { txt("B100 NJ"); selfStop(); return; }
    txt("B100 R " + job.name);
    fetchJson(job.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { txt("B100 RCE"); selfStop(); return; }
      list(function (arr) {
        var id = find(arr, job.name);
        function writeTo(scriptId) {
          if (scriptId === null || scriptId === undefined) { txt("B100 NE"); selfStop(); return; }
          stop(scriptId, function () {
            chunks(scriptId, recipe.chunks, 0, function (ok) {
              if (!ok) { txt("B100 WE " + job.name); selfStop(); return; }
              verSet(job.name, job.version, function () {
                jobClear(function () {
                  txt("B100 OK " + job.name + " " + job.version);
                  selfStop();
                });
              });
            });
          });
        }
        if (id !== null && id !== undefined) { writeTo(id); return; }
        create(job.name, writeTo);
      });
    });
  }

  function run() {
    txt("B100 RN");
    Shelly.call("KVS.Get", { key: JOB_KEY }, function (res, err) {
      if (err || !res || !res.value || !res.value.name) { txt("B100 NJ"); selfStop(); return; }
      build(res.value);
    });
  }

  run();
})();
