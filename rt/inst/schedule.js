// inst.schedule 1.1.0-print-only
(function () {
  "use strict";

  var SCRIPT_NAME = "inst.schedule";
  var POLL_NAME = "inst.poll";
  var INTERVAL_MS = 300000;

  function log(s) { print(SCRIPT_NAME + " " + String(s || "")); }

  function findByName(arr, name) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].name === name) return arr[i];
    }
    return null;
  }

  function startPoll(cb) {
    Shelly.call("Script.List", {}, function (res, err) {
      var s;
      if (err || !res || !res.scripts) { log("IS110 LSE"); if (cb) cb(); return; }
      s = findByName(res.scripts, POLL_NAME);
      if (!s || s.id === undefined) { log("IS110 NOP"); if (cb) cb(); return; }
      Shelly.call("Script.Start", { id: s.id }, function (r, e) {
        if (e) log("IS110 STE " + s.id);
        else log("IS110 ST " + s.id);
        if (cb) cb();
      });
    });
  }

  function loop() {
    startPoll(function () {
      Timer.set(INTERVAL_MS, false, loop);
    });
  }

  log("IS110 RN");
  loop();
})();
