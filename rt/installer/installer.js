// installer 2.0.0-onefile-device-version
(function () {
  "use strict";

  var SCRIPT_NAME = "installer";
  var INSTALLER_ID = 1;
  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var STATE_TEXT_ID = 200;
  var STATE_DEFAULT = "{\"dv\":0,\"ok\":0}";
  var PUT_WAIT_MS = 120;

  function log(s) { print(SCRIPT_NAME + " " + String(s || "")); }
  function n(v, d) { var x = Number(v); return (x === x) ? x : d; }
  function i(v) { var x = Number(v); if (x !== x) return 0; return Math.floor(x + 0.5); }
  function startsWith(s, p) { return String(s || "").slice(0, String(p || "").length) === String(p || ""); }

  function stopSelf() { Shelly.call("Script.Stop", { id: INSTALLER_ID }, function () {}); }

  function jp(s) { try { return JSON.parse(s); } catch (e) { return null; } }

  function shortId(id) {
    var s = String(id || "");
    var p = s.lastIndexOf("-");
    if (p >= 0) return s.slice(p + 1);
    return s;
  }

  function get(path, cb) {
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) { cb(null); return; }
      cb(res.body);
    });
  }

  function fetchJson(path, tag, cb) {
    get(path, function (body) {
      var obj = body ? jp(body) : null;
      if (!obj) { log(tag + " JSON ERR"); cb(null); return; }
      cb(obj);
    });
  }

  function listScripts(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) { cb([]); return; }
      cb(res.scripts);
    });
  }

  function findExact(scripts, name) {
    var k;
    for (k = 0; k < scripts.length; k++) {
      if (scripts[k].name === name) return scripts[k];
    }
    return null;
  }

  function findRole(scripts, role) {
    var k;
    var p = String(role || "") + "_v";
    for (k = 0; k < scripts.length; k++) {
      if (startsWith(scripts[k].name, p)) return scripts[k];
    }
    for (k = 0; k < scripts.length; k++) {
      if (scripts[k].name === role) return scripts[k];
    }
    return null;
  }

  function versionName(role, version) {
    return String(role || "script") + "_v" + String(version || "0").split(".").join("_");
  }

  function readInstallerState(cb) {
    Shelly.call("Text.GetStatus", { id: STATE_TEXT_ID }, function (res, err) {
      var obj;
      if (err || !res) { cb({ dv: 0, ok: 0 }); return; }
      obj = jp(String(res.value || ""));
      if (!obj) obj = { dv: 0, ok: 0 };
      obj.dv = i(n(obj.dv, 0));
      obj.ok = obj.ok ? 1 : 0;
      cb(obj);
    });
  }

  function writeInstallerState(dv, ok, cb) {
    var s = "{\"dv\":" + i(dv) + ",\"ok\":" + (ok ? 1 : 0) + "}";
    Shelly.call("Text.Set", { id: STATE_TEXT_ID, value: s }, function () { if (cb) cb(); });
  }

  function compGetMethod(type) {
    if (type === "boolean") return "Boolean.GetStatus";
    if (type === "number") return "Number.GetStatus";
    if (type === "enum") return "Enum.GetStatus";
    if (type === "text") return "Text.GetStatus";
    return "";
  }

  function compExists(c, cb) {
    var m = compGetMethod(c.type);
    if (!m) { cb(1); return; }
    Shelly.call(m, { id: c.id }, function (res, err) {
      cb((!err && res) ? 1 : 0);
    });
  }

  function addComponent(c, cb) {
    var cfg = { name: c.name || (c.type + ":" + c.id) };
    if (c.persisted !== undefined) cfg.persisted = !!c.persisted;
    if (c.default !== undefined) cfg.default_value = c.default;
    if (c.min !== undefined) cfg.min = c.min;
    if (c.max !== undefined) cfg.max = c.max;
    if (c.step !== undefined) cfg.step = c.step;
    if (c.unit !== undefined) cfg.unit = c.unit;
    if (c.options !== undefined) cfg.options = c.options;

    log("ADD " + c.type + ":" + c.id + " " + cfg.name);
    Shelly.call("Virtual.Add", { type: c.type, id: c.id, config: cfg }, function (res, err) {
      if (err) log("ADD ERR " + c.type + ":" + c.id);
      cb(err ? 0 : 1);
    });
  }

  function ensureComponent(c, cb) {
    if (!c || !c.type || c.id === undefined) { cb(1); return; }
    compExists(c, function (exists) {
      if (exists) { cb(1); return; }
      addComponent(c, cb);
    });
  }

  function ensureComponents(arr, pos, cb) {
    if (!arr || pos >= arr.length) { cb(1); return; }
    ensureComponent(arr[pos], function () { ensureComponents(arr, pos + 1, cb); });
  }

  function ensureInstallerStateComponent(dev, cb) {
    var c = dev && dev.state_component ? dev.state_component : { type: "text", id: STATE_TEXT_ID, name: "Installer state", persisted: true, default: STATE_DEFAULT };
    ensureComponent(c, cb);
  }

  function stopMasterFirst(cb) {
    listScripts(function (scripts) {
      var m = findRole(scripts, "master");
      if (!m || m.id === undefined || m.id === INSTALLER_ID) { cb(); return; }
      log("STOP master #" + m.id);
      Shelly.call("Script.Stop", { id: m.id }, function () { Timer.set(300, false, cb); });
    });
  }

  function stopAllExceptInstaller(cb) {
    listScripts(function (scripts) { stopAllList(scripts, 0, cb); });
  }

  function stopAllList(scripts, pos, cb) {
    var s;
    if (!scripts || pos >= scripts.length) { cb(); return; }
    s = scripts[pos];
    if (!s || s.id === INSTALLER_ID) { stopAllList(scripts, pos + 1, cb); return; }
    Shelly.call("Script.Stop", { id: s.id }, function () {
      Timer.set(80, false, function () { stopAllList(scripts, pos + 1, cb); });
    });
  }

  function createScript(name, cb) {
    log("CREATE " + name);
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res || res.id === undefined) { log("CREATE ERR " + name); cb(null); return; }
      cb({ id: res.id, name: name });
    });
  }

  function ensureTargetScript(pkg, cb) {
    listScripts(function (scripts) {
      var s = findExact(scripts, pkg.name);
      if (s) { cb(s); return; }
      createScript(pkg.name, cb);
    });
  }

  function setScriptConfig(id, name, boot, cb) {
    Shelly.call("Script.SetConfig", { id: id, config: { name: name, enable: !!boot } }, function () { cb(); });
  }

  function putCode(id, code, append, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code, append: append }, function (res, err) {
      if (err) { cb(0); return; }
      cb(1);
    });
  }

  function writeChunks(id, chunks, pos, cb) {
    if (!chunks || pos >= chunks.length) { cb(1); return; }
    log("W " + pos + "/" + chunks.length);
    get(chunks[pos], function (code) {
      if (code === null) { log("CHUNK ERR " + pos); cb(0); return; }
      Timer.set(PUT_WAIT_MS, false, function () {
        putCode(id, code, pos > 0, function (ok) {
          if (!ok) { log("PUT ERR " + pos); cb(0); return; }
          Timer.set(PUT_WAIT_MS, false, function () { writeChunks(id, chunks, pos + 1, cb); });
        });
      });
    });
  }

  function startMasterAndStop() {
    listScripts(function (scripts) {
      var m = findRole(scripts, "master");
      if (!m || m.id === undefined) { log("NO MASTER START"); stopSelf(); return; }
      log("START master #" + m.id);
      Shelly.call("Script.Start", { id: m.id }, function () { stopSelf(); });
    });
  }

  function buildPackage(dev, pkg) {
    log("JOB " + pkg.role + " " + pkg.version);
    stopMasterFirst(function () {
      stopAllExceptInstaller(function () {
        fetchJson(pkg.recipe, "RECIPE", function (recipe) {
          if (!recipe || !recipe.chunks || !recipe.chunks.length) { log("RECIPE ERR"); startMasterAndStop(); return; }
          ensureComponents(recipe.components, 0, function () {
            ensureTargetScript(pkg, function (target) {
              if (!target || target.id === undefined) { startMasterAndStop(); return; }
              Shelly.call("Script.Stop", { id: target.id }, function () {
                setScriptConfig(target.id, pkg.name, !!pkg.boot, function () {
                  writeChunks(target.id, recipe.chunks, 0, function (ok) {
                    if (!ok) { log("BUILD ERR " + pkg.role); startMasterAndStop(); return; }
                    log("BUILD OK " + pkg.role);
                    startMasterAndStop();
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  function normalizePackage(p) {
    if (!p) return null;
    if (!p.name) p.name = versionName(p.role, p.version);
    if (p.boot === undefined) p.boot = false;
    return p;
  }

  function findNextPackage(dev, cb) {
    listScripts(function (scripts) {
      var k;
      var p;
      if (!dev || !dev.scripts) { cb(null); return; }
      for (k = 0; k < dev.scripts.length; k++) {
        p = normalizePackage(dev.scripts[k]);
        if (!findExact(scripts, p.name)) { cb(p); return; }
      }
      cb(null);
    });
  }

  function runWithDevice(dev) {
    var remoteDv = i(n(dev.device_version, 0));
    ensureInstallerStateComponent(dev, function () {
      readInstallerState(function (st) {
        log("DV local=" + st.dv + " remote=" + remoteDv);
        if (st.dv === remoteDv && st.ok) { log("OK"); stopSelf(); return; }
        writeInstallerState(st.dv, 0, function () {
          findNextPackage(dev, function (pkg) {
            if (!pkg) {
              log("COMPLETE " + remoteDv);
              writeInstallerState(remoteDv, 1, function () { startMasterAndStop(); });
              return;
            }
            buildPackage(dev, pkg);
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
      fetchJson(path, "DEVICE", function (dev) {
        if (!dev) { stopSelf(); return; }
        runWithDevice(dev);
      });
    });
  }

  run();
})();
