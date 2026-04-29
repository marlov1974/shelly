// installer 2.1.0-fixed-ids-compact
(function () {
  "use strict";

  var SCRIPT_NAME = "installer";
  var INSTALLER_ID = 1;
  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var STATE_TEXT_ID = 200;
  var PUT_WAIT_MS = 120;

  function log(s) { print(SCRIPT_NAME + " " + String(s || "")); }
  function n(v, d) { var x = Number(v); return (x === x) ? x : d; }
  function i(v) { var x = Number(v); if (x !== x) return 0; return Math.floor(x + 0.5); }
  function sw(s, p) { s = String(s || ""); p = String(p || ""); return s.slice(0, p.length) === p; }
  function jp(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  function stopSelf() { Shelly.call("Script.Stop", { id: INSTALLER_ID }, function () {}); }

  function shortId(id) {
    var s = String(id || "");
    var p = s.lastIndexOf("-");
    if (p >= 0) return s.slice(p + 1);
    return s;
  }

  function get(path, cb) {
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      cb((err || !res || !res.body) ? null : res.body);
    });
  }

  function getJson(path, tag, cb) {
    get(path, function (body) {
      var obj = body ? jp(body) : null;
      if (!obj) log(tag + " JSON ERR");
      cb(obj);
    });
  }

  function list(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      cb((err || !res || !res.scripts) ? [] : res.scripts);
    });
  }

  function exact(arr, name) {
    var k;
    for (k = 0; k < arr.length; k++) if (arr[k].name === name) return arr[k];
    return null;
  }

  function byId(arr, id) {
    var k;
    var wanted = i(id);
    for (k = 0; k < arr.length; k++) if (i(arr[k].id) === wanted) return arr[k];
    return null;
  }

  function role(arr, r) {
    var k;
    var s;
    var best = null;
    var p = String(r || "") + "_v";
    for (k = 0; k < arr.length; k++) {
      s = arr[k];
      if (sw(s.name, p)) if (!best || i(s.id) > i(best.id)) best = s;
    }
    if (best) return best;
    for (k = 0; k < arr.length; k++) if (arr[k].name === r) return arr[k];
    return null;
  }

  function vname(r, v) { return String(r || "script") + "_v" + String(v || "0").split(".").join("_"); }

  function norm(p) {
    if (!p) return null;
    if (!p.name) p.name = vname(p.role, p.version);
    if (p.boot === undefined) p.boot = false;
    return p;
  }

  function readState(cb) {
    Shelly.call("Text.GetStatus", { id: STATE_TEXT_ID }, function (res, err) {
      var o = (!err && res) ? jp(String(res.value || "")) : null;
      if (!o) o = { dv: 0, ok: 0 };
      o.dv = i(n(o.dv, 0));
      o.ok = o.ok ? 1 : 0;
      cb(o);
    });
  }

  function writeState(dv, ok, cb) {
    var s = "{\"dv\":" + i(dv) + ",\"ok\":" + (ok ? 1 : 0) + "}";
    Shelly.call("Text.Set", { id: STATE_TEXT_ID, value: s }, function () { if (cb) cb(); });
  }

  function compGet(type) {
    if (type === "boolean") return "Boolean.GetStatus";
    if (type === "number") return "Number.GetStatus";
    if (type === "enum") return "Enum.GetStatus";
    if (type === "text") return "Text.GetStatus";
    return "";
  }

  function ensureComp(c, cb) {
    var m;
    var cfg;
    if (!c || !c.type || c.id === undefined) { cb(); return; }
    m = compGet(c.type);
    if (!m) { cb(); return; }
    Shelly.call(m, { id: c.id }, function (res, err) {
      if (!err && res) { cb(); return; }
      cfg = { name: c.name || (c.type + ":" + c.id) };
      if (c.persisted !== undefined) cfg.persisted = !!c.persisted;
      if (c.default !== undefined) cfg.default_value = c.default;
      if (c.min !== undefined) cfg.min = c.min;
      if (c.max !== undefined) cfg.max = c.max;
      if (c.step !== undefined) cfg.step = c.step;
      if (c.unit !== undefined) cfg.unit = c.unit;
      if (c.options !== undefined) cfg.options = c.options;
      log("ADD " + c.type + ":" + c.id);
      Shelly.call("Virtual.Add", { type: c.type, id: c.id, config: cfg }, function () { cb(); });
    });
  }

  function ensureComps(arr, pos, cb) {
    if (!arr || pos >= arr.length) { cb(); return; }
    ensureComp(arr[pos], function () { ensureComps(arr, pos + 1, cb); });
  }

  function ensureInstallerComp(dev, cb) {
    var c = dev && dev.state_component ? dev.state_component : { type: "text", id: STATE_TEXT_ID, name: "Installer state", persisted: true, default: "{\"dv\":0,\"ok\":0}" };
    ensureComp(c, cb);
  }

  function stopList(arr, pos, cb) {
    var s;
    if (!arr || pos >= arr.length) { cb(); return; }
    s = arr[pos];
    if (!s || s.id === INSTALLER_ID) { stopList(arr, pos + 1, cb); return; }
    Shelly.call("Script.Stop", { id: s.id }, function () { Timer.set(80, false, function () { stopList(arr, pos + 1, cb); }); });
  }

  function stopAll(cb) { list(function (arr) { stopList(arr, 0, cb); }); }

  function createScript(name, cb) {
    log("CREATE " + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res || res.id === undefined) { log("CREATE ERR"); cb(null); return; }
      cb({ id: res.id, name: name });
    });
  }

  function ensureTarget(pkg, cb) {
    list(function (arr) {
      var ex = exact(arr, pkg.name);
      var at = pkg.id !== undefined ? byId(arr, pkg.id) : null;
      if (ex && (pkg.id === undefined || i(ex.id) === i(pkg.id))) { cb(ex); return; }
      if (at && at.id !== INSTALLER_ID) { log("REUSE #" + at.id); cb(at); return; }
      if (ex) log("WRONGID #" + ex.id + " wanted #" + pkg.id);
      createScript(pkg.name, function (s) {
        if (s && pkg.id !== undefined && i(s.id) !== i(pkg.id)) log("IDERR got #" + s.id + " wanted #" + pkg.id);
        cb(s);
      });
    });
  }

  function setCfg(id, name, boot, cb) {
    Shelly.call("Script.SetConfig", { id: id, config: { name: name, enable: !!boot } }, function () { cb(); });
  }

  function put(id, code, append, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code, append: append }, function (res, err) { cb(err ? 0 : 1); });
  }

  function writeChunks(id, chunks, pos, cb) {
    if (!chunks || pos >= chunks.length) { cb(1); return; }
    log("W " + pos + "/" + chunks.length);
    get(chunks[pos], function (code) {
      if (code === null) { log("CHUNK ERR"); cb(0); return; }
      Timer.set(PUT_WAIT_MS, false, function () {
        put(id, code, pos > 0, function (ok) {
          if (!ok) { log("PUT ERR"); cb(0); return; }
          Timer.set(PUT_WAIT_MS, false, function () { writeChunks(id, chunks, pos + 1, cb); });
        });
      });
    });
  }

  function manifestMaster(dev, arr) {
    var k;
    var p;
    if (dev && dev.scripts) {
      for (k = 0; k < dev.scripts.length; k++) {
        p = norm(dev.scripts[k]);
        if (p && p.role === "master") return exact(arr, p.name) || (p.id !== undefined ? byId(arr, p.id) : null);
      }
    }
    return role(arr, "master");
  }

  function startMasterAndStop(dev) {
    list(function (arr) {
      var m = manifestMaster(dev, arr);
      if (!m || m.id === undefined) { log("NO MASTER START"); stopSelf(); return; }
      log("START master #" + m.id);
      Shelly.call("Script.Start", { id: m.id }, function () { stopSelf(); });
    });
  }

  function build(dev, pkg) {
    log("JOB " + pkg.role + " " + pkg.version + " #" + pkg.id);
    stopAll(function () {
      getJson(pkg.recipe, "RECIPE", function (recipe) {
        if (!recipe || !recipe.chunks || !recipe.chunks.length) { log("RECIPE ERR"); startMasterAndStop(dev); return; }
        ensureComps(recipe.components, 0, function () {
          ensureTarget(pkg, function (target) {
            if (!target || target.id === undefined) { startMasterAndStop(dev); return; }
            Shelly.call("Script.Stop", { id: target.id }, function () {
              setCfg(target.id, pkg.name, !!pkg.boot, function () {
                writeChunks(target.id, recipe.chunks, 0, function (ok) {
                  if (!ok) { log("BUILD ERR " + pkg.role); startMasterAndStop(dev); return; }
                  log("BUILD OK " + pkg.role + " #" + target.id);
                  startMasterAndStop(dev);
                });
              });
            });
          });
        });
      });
    });
  }

  function installed(arr, p) {
    var ex = exact(arr, p.name);
    if (!ex) return 0;
    if (p.id !== undefined && i(ex.id) !== i(p.id)) return 0;
    return 1;
  }

  function nextPkg(dev, cb) {
    list(function (arr) {
      var k;
      var p;
      if (!dev || !dev.scripts) { cb(null); return; }
      for (k = 0; k < dev.scripts.length; k++) {
        p = norm(dev.scripts[k]);
        if (!installed(arr, p)) { cb(p); return; }
      }
      cb(null);
    });
  }

  function runDevice(dev) {
    var rdv = i(n(dev.device_version, 0));
    ensureInstallerComp(dev, function () {
      readState(function (st) {
        log("DV local=" + st.dv + " remote=" + rdv);
        if (st.dv === rdv && st.ok) { log("OK"); stopSelf(); return; }
        writeState(st.dv, 0, function () {
          nextPkg(dev, function (p) {
            if (!p) {
              log("COMPLETE " + rdv);
              writeState(rdv, 1, function () { startMasterAndStop(dev); });
              return;
            }
            build(dev, p);
          });
        });
      });
    });
  }

  function run() {
    log("BOT");
    Shelly.call("Shelly.GetDeviceInfo", {}, function (info, err) {
      var sid;
      var path;
      if (err || !info) { log("DEVICE ERR"); stopSelf(); return; }
      sid = shortId(info.id || info.mac || "");
      path = "rt/devices/" + sid + ".json";
      log("D " + sid);
      getJson(path, "DEVICE", function (dev) { if (!dev) { stopSelf(); return; } runDevice(dev); });
    });
  }

  run();
})();
