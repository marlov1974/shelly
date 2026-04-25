// installer 1.0.0
(function () {
  "use strict";

  var INSTALLER_ID = 0;
  var BASE = "https://raw.githubusercontent.com/marlov1974/shelly/main/";
  var INDEX_PATH = "rt/index.json";
  var STATE_KEY = "ftx.installer.state";
  var PERIOD_MS = 300000;

  var timer = null;
  var running = false;

  function log(s) {
    print("installer " + s);
  }

  function httpGet(path, cb) {
    Shelly.call("HTTP.GET", { url: BASE + path, timeout: 10 }, function (res, err) {
      if (err || !res || !res.body) {
        log("HTTP ERR " + path);
        cb(null);
        return;
      }
      cb(res.body);
    });
  }

  function jsonParse(s) {
    try {
      return JSON.parse(s);
    } catch (e) {
      return null;
    }
  }

  function kvsGetObject(key, cb) {
    Shelly.call("KVS.Get", { key: key }, function (res, err) {
      if (err || !res || !res.value || typeof res.value !== "object") {
        cb({ scripts: {} });
        return;
      }
      if (!res.value.scripts || typeof res.value.scripts !== "object") {
        res.value.scripts = {};
      }
      cb(res.value);
    });
  }

  function kvsSetObject(key, value, cb) {
    Shelly.call("KVS.Set", { key: key, value: value }, function () {
      if (cb) cb();
    });
  }

  function deviceInfo(cb) {
    Shelly.call("Shelly.GetDeviceInfo", {}, function (res, err) {
      if (err || !res) {
        cb(null);
        return;
      }
      cb(res);
    });
  }

  function getDevicePath(info, cb) {
    httpGet(INDEX_PATH, function (body) {
      var idx;
      var p;
      if (!body) {
        cb(null);
        return;
      }
      idx = jsonParse(body);
      if (!idx) {
        log("INDEX JSON ERR");
        cb(null);
        return;
      }
      p = idx[String(info.id || "")];
      if (!p && info.mac) p = idx[String(info.mac).toLowerCase()];
      if (!p && info.mac) p = idx[String(info.mac).toUpperCase()];
      cb(p || null);
    });
  }

  function fetchDevice(path, cb) {
    httpGet(path, function (body) {
      var dev;
      if (!body) {
        cb(null);
        return;
      }
      dev = jsonParse(body);
      if (!dev || !dev.scripts || !dev.scripts.length) {
        log("DEVICE JSON ERR");
        cb(null);
        return;
      }
      cb(dev);
    });
  }

  function fetchRecipe(path, cb) {
    httpGet(path, function (body) {
      var recipe;
      if (!body) {
        cb(null);
        return;
      }
      recipe = jsonParse(body);
      if (!recipe || !recipe.chunks || !recipe.chunks.length) {
        log("RECIPE JSON ERR");
        cb(null);
        return;
      }
      cb(recipe);
    });
  }

  function listScripts(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      if (err || !res || !res.scripts) {
        cb([]);
        return;
      }
      cb(res.scripts);
    });
  }

  function findScript(list, name, expectedId) {
    var i;
    var s;
    var byName = null;
    var byId = null;
    for (i = 0; i < list.length; i++) {
      s = list[i];
      if (s.name === name) byName = s;
      if (s.id === expectedId) byId = s;
    }
    if (byName) return byName;
    if (byId && (!byId.name || byId.name === name)) return byId;
    return null;
  }

  function createScript(name, cb) {
    Shelly.call("Script.Create", { name: name }, function (res, err) {
      if (err || !res) {
        log("CREATE ERR " + name);
        cb(null);
        return;
      }
      cb(res.id);
    });
  }

  function setScriptName(id, name, cb) {
    Shelly.call("Script.SetConfig", { id: id, config: { name: name, enable: true } }, function () {
      cb();
    });
  }

  function stopScript(id, cb) {
    Shelly.call("Script.Stop", { id: id }, function () {
      cb();
    });
  }

  function startScript(id, cb) {
    Shelly.call("Script.Start", { id: id }, function () {
      cb();
    });
  }

  function putCode(id, code, append, cb) {
    Shelly.call("Script.PutCode", { id: id, code: code, append: append }, function (res, err) {
      if (err) {
        log("PUT ERR id=" + id);
        cb(0);
        return;
      }
      cb(1);
    });
  }

  function ensureScript(desc, cb) {
    listScripts(function (list) {
      var s = findScript(list, desc.name, desc.id);
      if (s) {
        cb(s.id);
        return;
      }
      createScript(desc.name, function (id) {
        if (id === null || id === undefined) {
          cb(null);
          return;
        }
        setScriptName(id, desc.name, function () {
          cb(id);
        });
      });
    });
  }

  function writeChunks(id, chunks, pos, cb) {
    if (pos >= chunks.length) {
      cb(1);
      return;
    }
    httpGet(chunks[pos], function (code) {
      if (code === null) {
        cb(0);
        return;
      }
      putCode(id, code, pos > 0, function (ok) {
        if (!ok) {
          cb(0);
          return;
        }
        writeChunks(id, chunks, pos + 1, cb);
      });
    });
  }

  function installOne(desc, state, cb) {
    var current = state.scripts[desc.name];
    if (current === desc.version) {
      log("SKIP " + desc.name + " " + desc.version);
      cb();
      return;
    }

    log("INSTALL " + desc.name + " " + desc.version);
    fetchRecipe(desc.recipe, function (recipe) {
      if (!recipe) {
        cb();
        return;
      }
      ensureScript(desc, function (id) {
        if (id === null || id === undefined) {
          cb();
          return;
        }
        stopScript(id, function () {
          writeChunks(id, recipe.chunks, 0, function (ok) {
            if (!ok) {
              cb();
              return;
            }
            state.scripts[desc.name] = desc.version;
            kvsSetObject(STATE_KEY, state, function () {
              if (desc.start) {
                startScript(id, function () {
                  cb();
                });
              } else {
                cb();
              }
            });
          });
        });
      });
    });
  }

  function installList(list, pos, state, cb) {
    if (pos >= list.length) {
      cb();
      return;
    }
    installOne(list[pos], state, function () {
      installList(list, pos + 1, state, cb);
    });
  }

  function scheduleNext() {
    if (timer) {
      Timer.clear(timer);
      timer = null;
    }
    timer = Timer.set(PERIOD_MS, false, function () {
      timer = null;
      runInstaller();
    });
  }

  function runInstaller() {
    if (running) return;
    running = true;
    log("RUN");

    deviceInfo(function (info) {
      if (!info) {
        running = false;
        scheduleNext();
        return;
      }
      getDevicePath(info, function (path) {
        if (!path) {
          log("NO DEVICE FILE");
          running = false;
          scheduleNext();
          return;
        }
        fetchDevice(path, function (dev) {
          if (!dev) {
            running = false;
            scheduleNext();
            return;
          }
          kvsGetObject(STATE_KEY, function (state) {
            installList(dev.scripts, 0, state, function () {
              log("DONE");
              running = false;
              scheduleNext();
            });
          });
        });
      });
    });
  }

  runInstaller();
})();
