// state base 1.3.2-self-stop
var SCRIPT_NAME = "state";

var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";
var KEY_STATE_RUN = "ftx.state.run";

var STATE_STATUS_TEXT_ID = 203;

function log(s) {
  print(String(SCRIPT_NAME) + " " + s);
}

function findScriptByName(arr, name) {
  var i;
  for (i = 0; i < arr.length; i++) {
    if (arr[i].name === name) return arr[i];
  }
  return null;
}

function selfStop() {
  Shelly.call("Script.List", {}, function (res, err) {
    var s;
    if (err || !res || !res.scripts) return;
    s = findScriptByName(res.scripts, SCRIPT_NAME);
    if (!s || s.id === undefined) return;
    Shelly.call("Script.Stop", { id: s.id }, function () {});
  });
}

function createStateCtx() {
  return {
    telM: {},
    telAct: {},
    run: {
      sup: 0,
      ext: 0,
      vvx: 0,
      heat: 0,
      cool: 0,
      dmp: 0
    },
    power_w: 0,
    fan_avg_pct: 0,
    vvx_eff_pct: 0,
    vvx_eff_hist: { r0: 0, r1: 0, r2: 0 }
  };
}
