// installer 1.0.3 no-state
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX = "rt/index.json";
  var TEXT_ID = 201;
  var PERIOD = 300000;

  var timer = null;
  var busy = false;
  var trace = "";

  function t(s) {
    trace = trace + String(s || "") + " ";
    if (trace.length > 220) trace = trace.slice(trace.length - 220);
    print("inst " + trace);
    Shelly.call("Text.Set", { id: TEXT_ID, value: trace }, function () {});
  }

  function get(path, cb) {
    t("G" + path);
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) { t("GE"); cb(null); return; }
      t("GO" + res.body.length);
      cb(res.body);
    });
  }

  function jp(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function deviceInfo(cb) {
    t("DI");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (res, err) {
      if (err || !res) { t("DIE"); cb(null); return; }
      t("D" + String(res.id || res.mac || "?"));
      cb(res);
    });
  }

  function devicePath(info, cb) {
    get(INDEX, function (body) {
      var idx = body ? jp(body) : null;
      var p = null;
      if (!idx) { t("IXE"); cb(null); return; }
      p = idx[String(info.id || "")];
      if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
      if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
      if (p) t("P" + p); else t("PN");
      cb(p);
    });
  }

  function fetchJson(path, tag, cb) {
    get(path, function (body) {
      var o = body ? jp(body) : null;
      if (!o) { t(tag + "E"); cb(null); return; }
      t(tag + "O");
      cb(o);
    });
  }

  function list(cb) {
    t("LS");
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { t("LSE"); cb([]); return; }
      t("LSO" + res.scripts.length);
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
    t("CR" + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) { t("CRE"); cb(null); return; }
      t("CRO" + res.id);
      cb(res.id);
    });
  }

  function stop(id, cb) {
    t("SP" + id);
    Shelly.call("Script.Stop", { id: id }, function () { cb(); });
  }

  function start(id, cb) {
    t("ST" + id);
    Shelly.call("Script.Start", { id: id }, function (res, err) { if (err) t("STE"); else t("STO"); cb(); });
  }

  function put(id, code, append, cb) {
    t((append ? "A" : "W") + id + ":" + code.length);
    Shelly.call("Script.PutCode", { id: id, code: code, append: append }, function (res, err) {
      if (err) { t("PE"); cb(0); return; }
      cb(1);
    });
  }

  function chunks(id, arr, pos, cb) {
    if (pos >= arr.length) { t("WC"); cb(1); return; }
    t("C" + pos);
    get(arr[pos], function (code) {
      if (code === null) { t("CE" + pos); cb(0); return; }
      put(id, code, pos > 0, function (ok) {
        if (!ok) { cb(0); return; }
        chunks(id, arr, pos + 1, cb);
      });
    });
  }

  function installNew(desc, cb) {
    fetchJson(desc.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { t("RCE"); cb(); return; }
      create(desc.name, function (id) {
        if (id === null || id === undefined) { t("NE"); cb(); return; }
        stop(id, function () {
          chunks(id, recipe.chunks, 0, function (ok) {
            if (!ok) { t("WE"); cb(); return; }
            if (desc.start) start(id, cb); else cb();
          });
        });
      });
    });
  }

  function installOne(desc, cb) {
    t("SC" + desc.name);
    list(function (arr) {
      var id = find(arr, desc.name);
      if (id !== null && id !== undefined) { t("EX" + id); cb(); return; }
      installNew(desc, cb);
    });
  }

  function installList(arr, pos, cb) {
    if (pos >= arr.length) { cb(); return; }
    t("L" + pos);
    installOne(arr[pos], function () { installList(arr, pos + 1, cb); });
  }

  function next() {
    if (timer) Timer.clear(timer);
    t("NX");
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { t("BZ"); return; }
    busy = true;
    trace = "I103 ";
    t("RN");
    deviceInfo(function (info) {
      if (!info) { busy = false; next(); return; }
      devicePath(info, function (path) {
        if (!path) { t("NDF"); busy = false; next(); return; }
        fetchJson(path, "D", function (dev) {
          if (!dev || !dev.scripts || !dev.scripts.length) { t("DE"); busy = false; next(); return; }
          t("DN" + dev.scripts.length);
          installList(dev.scripts, 0, function () {
            t("OK");
            busy = false;
            next();
          });
        });
      });
    });
  }

  run();
})();
