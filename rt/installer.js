// installer 1.0.2
(function () {
  "use strict";

  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX = "rt/index.json";
  var STATE = "ftx.installer.state";
  var TEXT_ID = 201;
  var PERIOD = 300000;

  var timer = null;
  var busy = false;
  var trace = "";
  var textBusy = false;
  var textPending = false;

  function flushText() {
    if (textBusy) {
      textPending = true;
      return;
    }
    textBusy = true;
    textPending = false;
    Shelly.call("Text.Set", { id: TEXT_ID, value: trace }, function () {
      textBusy = false;
      if (textPending) flushText();
    });
  }

  function t(s) {
    trace = trace + String(s || "") + " ";
    if (trace.length > 220) trace = trace.slice(trace.length - 220);
    print("inst " + trace);
    flushText();
  }

  function get(path, cb) {
    t("G" + path);
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) {
        t("GE");
        cb(null);
        return;
      }
      t("GO" + res.body.length);
      cb(res.body);
    });
  }

  function jp(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function stateGet(cb) {
    Shelly.call("KVS.Get", { key: STATE }, function (res, err) {
      var v;
      if (err || !res || !res.value || typeof res.value !== "object") {
        t("KN");
        cb({ scripts: {} });
        return;
      }
      v = res.value;
      if (!v.scripts || typeof v.scripts !== "object") v.scripts = {};
      t("KO");
      cb(v);
    });
  }

  function stateSet(st, cb) {
    t("KW");
    Shelly.call("KVS.Set", { key: STATE, value: st }, function (res, err) {
      if (err) t("KWE"); else t("KWO");
      cb();
    });
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

  function fetchJson(path, code, cb) {
    get(path, function (body) {
      var obj = body ? jp(body) : null;
      if (!obj) { t(code + "E"); cb(null); return; }
      t(code + "O");
      cb(obj);
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { t("LSE"); cb([]); return; }
      t("LS" + res.scripts.length);
      cb(res.scripts);
    });
  }

  function findScript(listArr, name, id) {
    var i;
    var s;
    for (i = 0; i < listArr.length; i++) {
      s = listArr[i];
      if (s.name === name) return s.id;
    }
    for (i = 0; i < listArr.length; i++) {
      s = listArr[i];
      if (s.id === id) return s.id;
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

  function setCfg(id, name, cb) {
    t("CFG" + id);
    Shelly.call("Script.SetConfig", { id: id, config: { name: name, enable: true } }, function (res, err) {
      if (err) t("CFGE"); else t("CFGO");
      cb();
    });
  }

  function ensure(desc, cb) {
    if (!desc || !desc.name) { t("BADD"); cb(null); return; }
    list(function (arr) {
      var id = findScript(arr, desc.name, desc.id);
      if (id !== null && id !== undefined) { t("FD" + id); cb(id); return; }
      create(desc.name, function (newId) {
        if (newId === null || newId === undefined) { cb(null); return; }
        setCfg(newId, desc.name, function () { cb(newId); });
      });
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

  function installOne(desc, st, cb) {
    var old;
    if (!desc || !desc.name) { t("BADS"); cb(); return; }
    old = st.scripts[desc.name];
    t("SC" + desc.name + ":" + String(old || "-") + ">" + desc.version);
    if (old === desc.version) { t("SK"); cb(); return; }
    fetchJson(desc.recipe, "R", function (recipe) {
      if (!recipe || !recipe.chunks || !recipe.chunks.length) { t("RCE"); cb(); return; }
      ensure(desc, function (id) {
        if (id === null || id === undefined) { t("NE"); cb(); return; }
        stop(id, function () {
          chunks(id, recipe.chunks, 0, function (ok) {
            if (!ok) { t("WE"); cb(); return; }
            st.scripts[desc.name] = desc.version;
            stateSet(st, function () {
              if (desc.start) start(id, cb); else cb();
            });
          });
        });
      });
    });
  }

  function installList(arr, pos, st, cb) {
    if (pos >= arr.length) { cb(); return; }
    t("L" + pos);
    installOne(arr[pos], st, function () { installList(arr, pos + 1, st, cb); });
  }

  function next() {
    if (timer) Timer.clear(timer);
    t("NX");
    timer = Timer.set(PERIOD, false, function () { timer = null; run(); });
  }

  function run() {
    if (busy) { t("BZ"); return; }
    busy = true;
    trace = "I102 ";
    t("RN");
    deviceInfo(function (info) {
      if (!info) { busy = false; next(); return; }
      devicePath(info, function (path) {
        if (!path) { t("NDF"); busy = false; next(); return; }
        fetchJson(path, "D", function (dev) {
          if (!dev || !dev.scripts || !dev.scripts.length) { t("DE"); busy = false; next(); return; }
          t("DN" + dev.scripts.length);
          stateGet(function (st) {
            installList(dev.scripts, 0, st, function () {
              t("OK");
              busy = false;
              next();
            });
          });
        });
      });
    });
  }

  run();
})();
