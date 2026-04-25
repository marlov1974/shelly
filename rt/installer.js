// installer 1.0.6 flat-version
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
        txt("I106 GE " + path);
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
      if (!obj) { txt("I106 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function getDevicePath(cb) {
    txt("I106 DI");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      if (err || !info) { txt("I106 DIE"); cb(null); return; }
      fetchJson(INDEX, "I", function (idx) {
        var p = null;
        if (!idx) { cb(null); return; }
        p = idx[String(info.id || "")];
        if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
        if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
        if (!p) txt("I106 NDF");
        cb(p || null);
      });
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("I106 LSE"); cb([]); return; }
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
    txt("I106 CR " + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) { txt("I106 CRE " + name); cb(null); return; }
      cb(res.id);
    });
  }

  function stop(id, cb) {
    Shelly.call("Script.Stop", { id: id }, function () { cb(); });
  }

  function start(id, cb) {
    txt("I106 ST " + id);
    Shelly.call("Script.Start", { id: id }, function (res, err) {
      if (err) txt("I106 STE " + id); else txt("I106 STO " + id);
      cb();
    });
  }

  function put(id, code, append, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code, append: append }, function (res, err) {
      if (err) { txt("I106 PE " + id); cb(0); return; }
      cb(1);
    });
  }

  function chunks(id, arr, pos, cb) {
    if (pos >= arr.length) { cb(1); return; }
    txt("I106 C " + pos + "/" + arr.length);
    get(arr[pos], function (code) {
      if (code === null) { txt("I106 CE " + pos); cb(0); return; }
      put(id, code, pos > 0, function (ok) {
        if (!ok) { cb(0); return; }
        chunks(id, arr, pos + 1, cb);
      });
    });
  }

  function ensure(name, cb) {
    list(function (arr) {
      var id = find(arr, name);
      if (id !== null && id !== undefined) { cb(id); return; }
      create(name, cb);
    });
  }

  function installWrite(desc, cb) {
    txt("I106 R " + desc.name);
    fetchJson(desc.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { txt("I106 RCE " + desc.name); cb(); return; }
      ensure(desc.name, function (id) {
        if (id === null || id === undefined) { txt("I106 NE " + desc.name); cb(); return; }
        stop(id, function () {
          chunks(id, recipe.chunks, 0, function (ok) {
            if (!ok) { txt("I106 WE " + desc.name); cb(); return; }
            verSet(desc.name, desc.version, function () {
              if (desc.start) start(id, cb); else cb();
            });
          });
        });
      });
    });
  }

  function installOne(desc, cb) {
    txt("I106 SC " + desc.name);
    verGet(desc.name, function (old) {
      if (old === String(desc.version || "")) {
        txt("I106 SK " + desc.name + " " + old);
        cb();
        return;
      }
      txt("I106 UP " + desc.name + " " + old + ">" + desc.version);
      installWrite(desc, cb);
    });
  }

  function descAt(dev, pos) {
    var p = "s" + pos + "_";
    if (!dev[p + "name"]) return null;
    return {
      name: dev[p + "name"],
      id: dev[p + "id"],
      version: dev[p + "version"],
      recipe: dev[p + "recipe"],
      start: dev[p + "start"]
    };
  }

  function installDev(dev, pos, cb) {
    var d;
    if (pos >= dev.n) { cb(); return; }
    txt("I106 L " + pos);
    d = descAt(dev, pos);
    if (!d) { txt("I106 BADS " + pos); installDev(dev, pos + 1, cb); return; }
    installOne(d, function () { installDev(dev, pos + 1, cb); });
  }

  function next() {
    if (timer) Timer.clear(timer);
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { txt("I106 BZ"); return; }
    busy = true;
    txt("I106 RN");
    getDevicePath(function (path) {
      if (!path) { busy = false; next(); return; }
      fetchJson(path, "D", function (dev) {
        if (!dev || !dev.n) { txt("I106 DE"); busy = false; next(); return; }
        txt("I106 DN " + dev.n);
        installDev(dev, 0, function () {
          txt("I106 OK");
          busy = false;
          next();
        });
      });
    });
  }

  run();
})();
