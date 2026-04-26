// installer 1.1.0-http-watchdog
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX = "rt/index.json";
  var TEXT_ID = 201;
  var PERIOD = 300000;
  var VK = "ftx.ver.";
  var timer = null;
  var busy = false;

  function txt(s) {
    print("inst " + String(s || ""));
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
      txt("I110 HTO");
      finish(null);
    });

    Shelly.call("HTTP.GET", { url: BASE + path + "?v=" + String(Math.floor(Date.now() / 60000)), timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) {
        finish(null);
        return;
      }
      finish(res.body);
    });
  }

  function jp(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function fetchJson(path, tag, cb) {
    get(path, function (body) {
      var obj = body ? jp(body) : null;
      if (!obj) { txt("I110 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function getDevicePath(cb) {
    txt("I110 DI");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      if (err || !info) { txt("I110 DIE"); cb(null); return; }
      fetchJson(INDEX, "I", function (idx) {
        var p = null;
        if (!idx) { cb(null); return; }
        p = idx[String(info.id || "")];
        if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
        if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
        if (!p) txt("I110 NDF");
        cb(p || null);
      });
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("I110 LSE"); cb([]); return; }
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

  function create(name, cb) {
    txt("I110 CR " + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) { txt("I110 CRE " + name); cb(null); return; }
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

  function chunks(id, arr, pos, cb) {
    if (pos >= arr.length) { cb(1); return; }
    txt("I110 CG " + pos + "/" + arr.length);
    get(arr[pos], function (code) {
      if (code === null) { txt("I110 CE " + pos); cb(0); return; }
      txt("I110 CO " + pos + " " + code.length);
      Timer.set(100, false, function () {
        txt("I110 PW " + pos);
        put(id, code, pos > 0, function (ok) {
          if (!ok) { txt("I110 PE " + pos); cb(0); return; }
          txt("I110 PO " + pos);
          Timer.set(100, false, function () {
            chunks(id, arr, pos + 1, cb);
          });
        });
      });
    });
  }

  function installWrite(desc, cb) {
    txt("I110 R " + desc.name);
    fetchJson(desc.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { txt("I110 RCE " + desc.name); cb(); return; }
      list(function (arr) {
        var id = find(arr, desc.name);
        function writeTo(scriptId) {
          if (scriptId === null || scriptId === undefined) { txt("I110 NE " + desc.name); cb(); return; }
          stop(scriptId, function () {
            chunks(scriptId, recipe.chunks, 0, function (ok) {
              if (!ok) { txt("I110 WE " + desc.name); cb(); return; }
              verSet(desc.name, desc.version, function () {
                txt("I110 IN " + desc.name + " " + desc.version);
                cb();
              });
            });
          });
        }
        if (id !== null && id !== undefined) {
          writeTo(id);
          return;
        }
        create(desc.name, writeTo);
      });
    });
  }

  function installOne(desc, cb) {
    txt("I110 SC " + desc.name);
    list(function (arr) {
      var id = find(arr, desc.name);
      if (id === null || id === undefined) {
        txt("I110 MS " + desc.name);
        installWrite(desc, cb);
        return;
      }
      verGet(desc.name, function (old) {
        if (old === String(desc.version || "")) {
          txt("I110 SK " + desc.name + " " + old);
          cb();
          return;
        }
        txt("I110 UP " + desc.name + " " + old + ">" + desc.version);
        installWrite(desc, cb);
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

  function installDev(dev, pos, cb) {
    var d;
    if (pos >= dev.n) { cb(); return; }
    txt("I110 L " + pos);
    d = descAt(dev, pos);
    if (!d) { txt("I110 BADS " + pos); installDev(dev, pos + 1, cb); return; }
    installOne(d, function () { installDev(dev, pos + 1, cb); });
  }

  function next() {
    if (timer) Timer.clear(timer);
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { txt("I110 BZ"); return; }
    busy = true;
    txt("I110 RN");
    getDevicePath(function (path) {
      if (!path) { busy = false; next(); return; }
      fetchJson(path, "D", function (dev) {
        if (!dev || !dev.n) { txt("I110 DE"); busy = false; next(); return; }
        txt("I110 DN " + dev.n);
        installDev(dev, 0, function () {
          txt("I110 OK");
          busy = false;
          next();
        });
      });
    });
  }

  run();
})();
