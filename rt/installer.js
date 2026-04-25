// installer 1.0.4 low-text
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX = "rt/index.json";
  var TEXT_ID = 201;
  var PERIOD = 300000;

  var timer = null;
  var busy = false;
  var status = "";

  function txt(s) {
    status = String(s || "");
    print("inst " + status);
    Shelly.call("Text.Set", { id: TEXT_ID, value: status }, function () {});
  }

  function p(s) {
    print("inst " + String(s || ""));
  }

  function get(path, cb) {
    p("GET " + path);
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) {
        txt("I104 GE " + path);
        cb(null);
        return;
      }
      cb(res.body);
    });
  }

  function jp(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function deviceInfo(cb) {
    txt("I104 DI");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (res, err) {
      if (err || !res) { txt("I104 DIE"); cb(null); return; }
      cb(res);
    });
  }

  function devicePath(info, cb) {
    get(INDEX, function (body) {
      var idx = body ? jp(body) : null;
      var path = null;
      if (!idx) { txt("I104 IXE"); cb(null); return; }
      path = idx[String(info.id || "")];
      if (!path && info.mac) path = idx[String(info.mac).toLowerCase()];
      if (!path && info.mac) path = idx[String(info.mac).toUpperCase()];
      if (!path) { txt("I104 NDF"); cb(null); return; }
      cb(path);
    });
  }

  function fetchJson(path, tag, cb) {
    get(path, function (body) {
      var obj = body ? jp(body) : null;
      if (!obj) { txt("I104 " + tag + "E"); cb(null); return; }
      cb(obj);
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { txt("I104 LSE"); cb([]); return; }
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
    txt("I104 CR " + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) { txt("I104 CRE " + name); cb(null); return; }
      txt("I104 CRO " + name + " " + res.id);
      cb(res.id);
    });
  }

  function stop(id, cb) {
    Shelly.call("Script.Stop", { id: id }, function () { cb(); });
  }

  function start(id, cb) {
    txt("I104 ST " + id);
    Shelly.call("Script.Start", { id: id }, function (res, err) {
      if (err) txt("I104 STE " + id); else txt("I104 STO " + id);
      cb();
    });
  }

  function put(id, code, append, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code, append: append }, function (res, err) {
      if (err) { txt("I104 PE " + id); cb(0); return; }
      cb(1);
    });
  }

  function chunks(id, arr, pos, cb) {
    if (pos >= arr.length) { cb(1); return; }
    txt("I104 C " + pos + "/" + arr.length);
    get(arr[pos], function (code) {
      if (code === null) { txt("I104 CE " + pos); cb(0); return; }
      put(id, code, pos > 0, function (ok) {
        if (!ok) { cb(0); return; }
        chunks(id, arr, pos + 1, cb);
      });
    });
  }

  function installNew(desc, cb) {
    txt("I104 R " + desc.name);
    fetchJson(desc.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { txt("I104 RCE " + desc.name); cb(); return; }
      create(desc.name, function (id) {
        if (id === null || id === undefined) { txt("I104 NE " + desc.name); cb(); return; }
        stop(id, function () {
          chunks(id, recipe.chunks, 0, function (ok) {
            if (!ok) { txt("I104 WE " + desc.name); cb(); return; }
            if (desc.start) start(id, cb); else cb();
          });
        });
      });
    });
  }

  function installOne(desc, cb) {
    var name = desc && desc.name ? desc.name : "?";
    txt("I104 SC " + name);
    if (!desc || !desc.name) { cb(); return; }
    list(function (arr) {
      var id = find(arr, desc.name);
      if (id !== null && id !== undefined) { txt("I104 EX " + desc.name + " " + id); cb(); return; }
      installNew(desc, cb);
    });
  }

  function installList(arr, pos, cb) {
    if (pos >= arr.length) { cb(); return; }
    txt("I104 L " + pos);
    installOne(arr[pos], function () { installList(arr, pos + 1, cb); });
  }

  function next() {
    if (timer) Timer.clear(timer);
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { txt("I104 BZ"); return; }
    busy = true;
    txt("I104 RN");
    deviceInfo(function (info) {
      if (!info) { busy = false; next(); return; }
      devicePath(info, function (path) {
        if (!path) { busy = false; next(); return; }
        fetchJson(path, "D", function (dev) {
          if (!dev || !dev.scripts || !dev.scripts.length) { txt("I104 DE"); busy = false; next(); return; }
          txt("I104 DN " + dev.scripts.length);
          installList(dev.scripts, 0, function () {
            txt("I104 OK");
            busy = false;
            next();
          });
        });
      });
    });
  }

  run();
})();
