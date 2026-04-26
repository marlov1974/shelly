// inst.schedule 1.0.0
(function () {
  "use strict";

  var SCRIPT_NAME = "inst.schedule";
  var POLL_NAME = "inst.poll";
  var TEXT_ID = 201;
  var INTERVAL_MS = 300000;

  function txt(s) {
    print("inst.schedule " + String(s || ""));
    Shelly.call("Text.Set", { id: TEXT_ID, value: String(s || "") }, function () {});
  }

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
      if (err || !res || !res.scripts) { txt("IS100 LSE"); if (cb) cb(); return; }
      s = findByName(res.scripts, POLL_NAME);
      if (!s || s.id === undefined) { txt("IS100 NOP"); if (cb) cb(); return; }
      Shelly.call("Script.Start", { id: s.id }, function (r, e) {
        if (e) txt("IS100 STE " + s.id);
        else txt("IS100 ST " + s.id);
        if (cb) cb();
      });
    });
  }

  function loop() {
    startPoll(function () {
      Timer.set(INTERVAL_MS, false, loop);
    });
  }

  txt("IS100 RN");
  loop();
})();
