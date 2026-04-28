// common script 1.1.0-print-only
function scriptName() {
  if (typeof SCRIPT_NAME === "string" && SCRIPT_NAME.length > 0) return SCRIPT_NAME;
  return "script";
}

function log(s) {
  print(scriptName() + " " + String(s || ""));
}

function findScriptByName(arr, name) {
  var i;
  for (i = 0; i < arr.length; i++) {
    if (arr[i].name === name) return arr[i];
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
    s = findScriptByName(res.scripts, name);
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
