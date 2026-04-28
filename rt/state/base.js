// state base 1.4.0-common-log
var SCRIPT_NAME = "state";

var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";
var KEY_STATE_RUN = "ftx.state.run";

function createStateCtx() {
  return {
    telM: {},
    telAct: {},
    run: { sup: 0, ext: 0, vvx: 0, heat: 0, cool: 0, dmp: 0 },
    power_w: 0,
    fan_avg_pct: 0,
    vvx_eff_pct: 0,
    vvx_eff_hist: { r0: 0, r1: 0, r2: 0 }
  };
}
