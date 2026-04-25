// installer 1.0.9 missing-script-reinstall
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
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) {
        cb(null);
        return;
      }
      cb(res.body);
    });
  }

  function jp(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function fetchJson(path, tag, cb) {
    get(path, function (body) {
      var obj = body ? jp(body) : null;
      if (!obj) { txt("I109 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function getDevicePath(cb) {
    txt("I109 DI");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      if (err || !info) { txt("I109 DIE"); cb(null); return; }
      fetchJson(INDEX, "I", function (idx) {
        var p = null;
        if (!idx) { cb(null); return; }
        p = idx[String(info.id || "")];
        if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
        if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
        if (!p) txt("I109 NDF");
        cb(p || null);
      });
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("I109 LSE"); cb([]); return; }
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
    txt("I109 CR " + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) { txt("I109 CRE " + name); cb(null); return; }
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
    txt("I109 CG " + pos + "/" + arr.length);
    get(arr[pos], function (code) {
      if (code === null) { txt("I109 CE " + pos); cb(0); return; }
      txt("I109 CO " + pos + " " + code.length);
      Timer.set(50, false, function () {
        txt("I109 PW " + pos);
        put(id, code, pos > 0, function (ok) {
          if (!ok) { txt("I109 PE " + pos); cb(0); return; }
          txt("I109 PO " + pos);
          Timer.set(50, false, function () {
            chunks(id, arr, pos + 1, cb);
          });
        });
      });
    });
  }

  function installWrite(desc, cb) {
    txt("I109 R " + desc.name);
    fetchJson(desc.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { txt("I109 RCE " + desc.name); cb(); return; }
      list(function (arr) {
        var id = find(arr, desc.name);
        function writeTo(scriptId) {
          if (scriptId === null || scriptId === undefined) { txt("I109 NE " + desc.name); cb(); return; }
          stop(scriptId, function () {
            chunks(scriptId, recipe.chunks, 0, function (ok) {
              if (!ok) { txt("I109 WE " + desc.name); cb(); return; }
              verSet(desc.name, desc.version, function () {
                txt("I109 IN " + desc.name + " " + desc.version);
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
    txt("I109 SC " + desc.name);
    list(function (arr) {
      var id = find(arr, desc.name);
      if (id === null || id === undefined) {
        txt("I109 MS " + desc.name);
        installWrite(desc, cb);
        return;
      }
      verGet(desc.name, function (old) {
        if (old === String(desc.version || "")) {
          txt("I109 SK " + desc.name + " " + old);
          cb();
          return;
        }
        txt("I109 UP " + desc.name + " " + old + ">" + desc.version);
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
    txt("I109 L " + pos);
    d = descAt(dev, pos);
    if (!d) { txt("I109 BADS " + pos); installDev(dev, pos + 1, cb); return; }
    installOne(d, function () { installDev(dev, pos + 1, cb); });
  }

  function next() {
    if (timer) Timer.clear(timer);
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { txt("I109 BZ"); return; }
    busy = true;
    txt("I109 RN");
    getDevicePath(function (path) {
      if (!path) { busy = false; next(); return; }
      fetchJson(path, "D", function (dev) {
        if (!dev || !dev.n) { txt("I109 DE"); busy = false; next(); return; }
        txt("I109 DN " + dev.n);
        installDev(dev, 0, function () {
          txt("I109 OK");
          busy = false;
          next();
        });
      });
    });
  }

  run();
})();
