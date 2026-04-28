// common script 1.2.0-role-version-aware
function scriptName() {
  if (typeof SCRIPT_NAME === "string" && SCRIPT_NAME.length > 0) return SCRIPT_NAME;
  return "script";
}

function log(s) {
  print(scriptName() + " " + String(s || ""));
}

function startsWith(s, p) {
  return String(s || "").slice(0, String(p || "").length) === String(p || "");
}

function findScriptByNameOrRole(arr, name) {
  var i;
  var p = String(name || "") + "_v";
  for (i = 0; i < arr.length; i++) {
    if (arr[i].name === name && arr[i].running) return arr[i];
  }
  for (i = 0; i < arr.length; i++) {
    if (startsWith(arr[i].name, p) && arr[i].running) return arr[i];
  }
  for (i = 0; i < arr.length; i++) {
    if (arr[i].name === name) return arr[i];
  }
  for (i = 0; i < arr.length; i++) {
    if (startsWith(arr[i].name, p)) return arr[i];
  }
  return null;
}

function scriptStopByName(name, cb) {
  Shelly.call("Script.List", {}, function (res, err) {
    var s;
    if (err || !res || !res.scripts) {
      if (cb) cb(0);
      return;
    }
    s = findScriptByNameOrRole(res.scripts, name);
    if (!s || s.id === undefined) {
      if (cb) cb(0);
      return;
    }
    Shelly.call("Script.Stop", { id: s.id }, function () {
      if (cb) cb(1);
    });
  });
}

function selfStop() {
  scriptStopByName(scriptName(), function () {});
}
