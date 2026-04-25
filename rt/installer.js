// installer 1.0.5 arrayless
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX = "rt/index.json";
  var TEXT_ID = 201;
  var PERIOD = 300000;
  var timer = null;
  var busy = false;

  function txt(s) {
    print("inst " + String(s || ""));
    Shelly.call("Text.Set", { id: TEXT_ID, value: String(s || "") }, function () {});
  }

  function get(path, cb) {
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) {
        txt("I105 GE " + path);
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
      if (!obj) { txt("I105 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function getDevicePath(cb) {
    txt("I105 DI");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      if (err || !info) { txt("I105 DIE"); cb(null); return; }
      fetchJson(INDEX, "I", function (idx) {
        var p = null;
        if (!idx) { cb(null); return; }
        p = idx[String(info.id || "")];
        if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
        if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
        if (!p) txt("I105 NDF");
        cb(p || null);
      });
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("I105 LSE"); cb([]); return; }
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
    txt("I105 CR " + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) { txt("I105 CRE " + name); cb(null); return; }
      cb(res.id);
    });
  }

  function stop(id, cb) {
    Shelly.call("Script.Stop", { id: id }, function () { cb(); });
  }

  function start(id, cb) {
    txt("I105 ST " + id);
    Shelly.call("Script.Start", { id: id }, function (res, err) {
      if (err) txt("I105 STE " + id); else txt("I105 STO " + id);
      cb();
    });
  }

  function put(id, code, append, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code, append: append }, function (res, err) {
      if (err) { txt("I105 PE " + id); cb(0); return; }
      cb(1);
    });
  }

  function chunks(id, arr, pos, cb) {
    if (pos >= arr.length) { cb(1); return; }
    txt("I105 C " + pos + "/" + arr.length);
    get(arr[pos], function (code) {
      if (code === null) { txt("I105 CE " + pos); cb(0); return; }
      put(id, code, pos > 0, function (ok) {
        if (!ok) { cb(0); return; }
        chunks(id, arr, pos + 1, cb);
      });
    });
  }

  function installNew(desc, cb) {
    txt("I105 R " + desc.name);
    fetchJson(desc.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { txt("I105 RCE " + desc.name); cb(); return; }
      create(desc.name, function (id) {
        if (id === null || id === undefined) { txt("I105 NE " + desc.name); cb(); return; }
        stop(id, function () {
          chunks(id, recipe.chunks, 0, function (ok) {
            if (!ok) { txt("I105 WE " + desc.name); cb(); return; }
            if (desc.start) start(id, cb); else cb();
          });
        });
      });
    });
  }

  function installOne(desc, cb) {
    txt("I105 SC " + desc.name);
    list(function (arr) {
      var id = find(arr, desc.name);
      if (id !== null && id !== undefined) { txt("I105 EX " + desc.name + " " + id); cb(); return; }
      installNew(desc, cb);
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
    txt("I105 L " + pos);
    d = descAt(dev, pos);
    if (!d) { txt("I105 BADS " + pos); installDev(dev, pos + 1, cb); return; }
    installOne(d, function () { installDev(dev, pos + 1, cb); });
  }

  function next() {
    if (timer) Timer.clear(timer);
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { txt("I105 BZ"); return; }
    busy = true;
    txt("I105 RN");
    getDevicePath(function (path) {
      if (!path) { busy = false; next(); return; }
      fetchJson(path, "D", function (dev) {
        if (!dev || !dev.n) { txt("I105 DE"); busy = false; next(); return; }
        txt("I105 DN " + dev.n);
        installDev(dev, 0, function () {
          txt("I105 OK");
          busy = false;
          next();
        });
      });
    });
  }

  run();
})();
